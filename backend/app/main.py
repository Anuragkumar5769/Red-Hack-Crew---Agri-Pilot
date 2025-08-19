# backend/app/main.py
from email.mime import image
import os
import logging
import base64
from fastapi import FastAPI, Form, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
# Change the import from langchain_groq to langchain_google_genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_community.chat_message_histories import ChatMessageHistory
from dotenv import load_dotenv
load_dotenv()

# Import both tools
from .tools import crop_info_tool, weather_tool, market_info_tool, crop_disease_classifier

# --- Basic App Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LangChain Agri Assistant API",
    description="An API for an intelligent agricultural assistant powered by LangChain and Google Gemini."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Keys and Model/Pipeline Clients ---
# Set your Google API key (replace with your actual key)
os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

# --- LangChain Agent Setup ---
try:
    # Change from ChatGroq to ChatGoogleGenerativeAI and use the Gemini 2 Flash model
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)
    logger.info("ChatGoogleGenerativeAI LLM initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize ChatGoogleGenerativeAI LLM: {e}")
    llm = None

# --- CORRECTED PROMPT ---
# This new system prompt is more direct and forceful, which helps the agent
# make the correct decision when it sees the long base64 image string.
prompt = ChatPromptTemplate.from_messages([
    ("system", """
You are an expert agricultural assistant bot. Your primary purpose is to provide comprehensive, data-driven, and actionable advice to farmers by strategically using a set of available tools.

# TOOLKIT DEFINITION

- **CropInfoRetriever**:
  - Description: Provides detailed information on crop cultivation, farming techniques, pest and disease management (excluding image-based diagnosis), and general agricultural practices.
  - Input: `{{\"query\": \"The user's question about a specific crop or farming technique\"}}`

- **WeatherInfo**:
  - Description: Retrieves current and forecasted weather conditions for a specific location. It is currently Monday, August 18, 2025. The user is in Kharagpur, West Bengal, India.
  - Input: `{{\"location\": \"The city, district, or specific area for the weather report\"}}`

- **MarketInfo**:
  - Description: Fetches the latest market prices of agricultural commodities.
  - Input: `{{\"commodity\": \"The name of the crop or agricultural product\", \"location\": \"The state or district for market prices\"}}`

- **crop_disease_classifier**:
  - Description: Analyzes an input image to identify a potential crop disease. This tool MUST be used first if an image is provided.
  - Input: `{{\"image_path\": \"The path or reference to the user's image\"}}`

# OPERATING PROCEDURE

1.  **Triage & Language Check**:
    - If the user provides an image, your first step is to use `crop_disease_classifier`.
    - If the user query is not in English, you MUST respond in the same language.

2.  **Analyze and Plan**:
    - **Thought**: Carefully break down the user's request. Identify the core questions and the entities involved (e.g., crop names, locations).
    - **Plan**: Formulate a step-by-step plan of which tools to use in what order. This plan is for your internal reasoning only.

3.  **Execute and Synthesize**:
    - **Crucially, you MUST continue executing your plan step-by-step until you have gathered all the information required to provide a complete and definitive answer to the user's query.** Do not stop after one step.
    - After executing all necessary tool calls, you must provide a **Final Answer**. The final answer should synthesize all the gathered information (from soil, weather, market, etc.) into a cohesive, well-structured, and actionable response for the user.
    - **DO NOT** output your plan to the user. Only output the final, synthesized answer.

# <<< NEW SECTION: FALLBACK & ERROR HANDLING

4.  **Fallback and Error Handling**:
    - **If a tool fails or returns an error or provides no relevant data**, you MUST inform the user that specific data could not be retrieved. Then, use your general knowledge as an agricultural expert to provide the best possible advice, clearly stating that this advice is based on general principles rather than specific, real-time data.
    - **If the user's question is outside the scope of your tools** (e.g., it's a general greeting, a philosophical question, or unrelated to agriculture), answer it conversationally using your own knowledge without attempting to use any tools.

Your ultimate goal is to provide a complete, final answer in a single response after using the tools.
"""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Add the new tool to the agent's toolkit
tools = [crop_info_tool, weather_tool, market_info_tool, crop_disease_classifier]
agent = create_tool_calling_agent(llm, tools, prompt)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True
)

session_histories = {}

def get_session_history(session_id: str) -> ChatMessageHistory:
    if session_id not in session_histories:
        session_histories[session_id] = ChatMessageHistory()
    return session_histories[session_id]

class ChatResponse(BaseModel):
    response: str
    session_id: str
from fastapi.staticfiles import StaticFiles
import uuid

# --- Mount static folder for serving uploaded images ---
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    session_id: str = Form(...),
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    location: Optional[str] = Form(None) 
):
    if not llm:
        raise HTTPException(status_code=503, detail="LLM service is not available.")

    logger.info(f"Received request for session {session_id}: text={bool(text)}, image={bool(image)}")

    user_input_parts = []
    today_str = datetime.now().strftime('%Y-%m-%d')
    user_input_parts.append(f"Today's date: {today_str}")
    if text:
        user_input_parts.append(text)

    if location:
        user_input_parts.append(f"\nUser's location: {location}")
    
    if image:
        # Save uploaded image to disk
        file_ext = os.path.splitext(image.filename)[1] or ".png"
        file_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)

        with open(file_path, "wb") as f:
            f.write(await image.read())

        # Generate public URL (served by FastAPI static mount)
        image_url = f"/uploads/{file_name}"

        # Append URL instead of base64
        user_input_parts.append(f"\n[Image available at: {image_url}]")
        user_input_parts.append("\n[User has uploaded an image for analysis.]")

    if not user_input_parts:
        raise HTTPException(status_code=400, detail="No input provided. Please send text or an image.")

    user_input = "\n".join(user_input_parts)
    ...

    try:
        chat_history = get_session_history(session_id)
        print("DEBUG - Final user_input_parts:/", user_input_parts)
        response = agent_executor.invoke({
            "input": user_input,
            "chat_history": chat_history.messages
        })

        ai_response = response.get("output", "I'm sorry, I encountered an issue and can't respond right now.")

        # Keep the history clean by not storing the long base64 string
        history_message = text if text else "Sent an image for analysis."
        chat_history.add_user_message(history_message)
        chat_history.add_ai_message(ai_response)

        logger.info(f"Agent response for session {session_id}: '{ai_response}'")
        return ChatResponse(response=ai_response, session_id=session_id)

    except Exception as e:
        logger.exception(f"Error processing chat for session {session_id}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

@app.get("/health")
def health_check():
    return {
        "status": "active",
        "llm_model": "gemini-2.0-flash" if llm else "unavailable",
        "tools": [tool.name for tool in tools]
    }

if __name__ == "__main__":
    import uvicorn
    if os.getenv("GOOGLE_API_KEY") is None or "YOUR_GOOGLE_API_KEY_HERE" in os.getenv("GOOGLE_API_KEY", ""):
        print("WARNING: GOOGLE_API_KEY is not set correctly.")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
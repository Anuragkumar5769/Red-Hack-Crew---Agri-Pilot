# backend/app/tools.py
import os
import logging
import json
import requests
from datetime import datetime, timedelta
from urllib.parse import urlencode, quote_plus
from langchain.tools import Tool
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv
load_dotenv()


# --- 0. Setup Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.tools import Tool
import os

# backend/app/tools.py

import os
import logging
from langchain.tools import Tool
from langchain.docstore.document import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    CSVLoader,
    UnstructuredWordDocumentLoader,
    DirectoryLoader
)
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# --- Basic Setup ---
logger = logging.getLogger(__name__)

# --- Configuration ---
# These must match the settings used in your `build_index.py` script
INDEX_PATH = "app/data/faiss_index"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# --- Document Loader Function ---
# This function is kept here so the separate `build_index.py` script can import and use it.
# It is NOT used during the normal, fast startup of the application.
def create_retrieval_tool():
    """
    Initializes a retrieval tool by LOADING a pre-built FAISS index from disk.
    This function is designed to be very fast on application startup.
    """
    logger.info("Initializing retrieval tool by loading FAISS index...")

    # Check if the pre-built index directory exists
    if not os.path.isdir(INDEX_PATH):
        logger.error(f"FAISS index not found at '{INDEX_PATH}'.")
        logger.error("Please run the `build_index.py` script first to create it.")
        return Tool(
            name="CropInfoRetriever",
            func=lambda q: "❌ Error: The document database index is missing. Please ask the administrator to build it.",
            description="Use for questions about crop cultivation, farming techniques, etc. Currently unavailable."
        )

    try:
        # 1. Initialize the same embedding model used to build the index
        embeddings = HuggingFaceEmbeddings(model_name=MODEL_NAME)
        
        # 2. Load the FAISS index from the local directory
        db = FAISS.load_local(
            INDEX_PATH,
            embeddings,
            allow_dangerous_deserialization=True  # Required for loading FAISS indexes with LangChain
        )
        retriever = db.as_retriever(search_kwargs={"k": 3})
        logger.info("✅ FAISS index loaded successfully and retriever is ready.")

    except Exception as e:
        logger.error(f"Error loading FAISS vector store from disk: {e}", exc_info=True)
        return Tool(
            name="CropInfoRetriever",
            func=lambda q: "❌ Error: Could not load the document database due to an internal error.",
            description="Use for questions about crop cultivation, farming techniques, etc. Currently unavailable."
        )

    # This is the actual function the LangChain agent will call
    def retrieve_and_format(query: str) -> str:
        """
        Queries the retriever and formats the output. Falls back to
        SAMPLE_DOCS if no results are found in the main database.
        """
        try:
            # First, try the main retriever from the FAISS index
            docs = retriever.get_relevant_documents(query)
            
            # If the main retriever finds results, format and return them
            if docs:
                formatted_output = "\n\n---\n\n".join([
                    f"Source: {doc.metadata.get('source', 'N/A')}\n\nContent: {doc.page_content}"
                    for doc in docs
                ])
                return formatted_output

            # If no results from FAISS, check the fallback SAMPLE_DOCS
            logger.warning(f"No results from FAISS for '{query}'. Checking fallback documents.")
            
        except Exception as e:
            logger.error(f"Error during retrieval for query '{query}': {e}", exc_info=True)
            return "Sorry, I encountered an error while searching my knowledge base."

    # Create the final tool for the agent
    return Tool(
        name="CropInfoRetriever",
        func=retrieve_and_format,
        description="Use this tool for any questions about crop cultivation, farming techniques, plant diseases, and agricultural practices. Provide the crop name or topic as input."
    )


# --- Tool Initialization ---
# This line is executed when the module is imported.
# It now runs the very fast `create_retrieval_tool` function.
crop_info_tool = create_retrieval_tool()

# --- 2. Tool-Specific Logic: Weather Retrieval ---
# --- 2. Tool-Specific Logic: Weather Retrieval (Updated) ---
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_DATA_FILE = "weather_data.json" # Renamed for clarity

def get_weather_data(location: str) -> str:
    """
    Fetches and returns current and 5-day forecast weather data for a given location.
    Data is stored in a JSON file, with a refresh policy to avoid repeated API calls.

    Args:
        location (str): The name of the city, e.g., "Kharagpur", or a coordinate string "lat,lon".

    Returns:
        str: A JSON string of the weather data, or an error message.
    """
    try:
        # Load existing data or initialize an empty dictionary
        if os.path.exists(WEATHER_DATA_FILE):
            with open(WEATHER_DATA_FILE, 'r') as f:
                weather_data_store = json.load(f)
        else:
            weather_data_store = {}

        today_str = datetime.now().strftime('%Y-%m-%d')

        # Check if the location data is in the store and still fresh
        if location in weather_data_store:
            cached_data = weather_data_store[location]
            timestamp = datetime.fromisoformat(cached_data.get('timestamp'))
            data = cached_data.get('data', {})

            has_today = any(
                f.get("date") == today_str
                for f in data.get("five_day_forecast", [])
            )

            # Use cached data only if it contains today's forecast and is less than 1 day old
            if (datetime.now() - timestamp).days < 1 and has_today:
                return json.dumps(data, indent=2)

        # If data is not fresh, incomplete, or doesn't exist, fetch new data
        is_coords = ',' in location
        if is_coords:
            lat, lon = location.split(',')
            geo_response = requests.get(
                f"https://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={WEATHER_API_KEY}"
            )
            geo_data = geo_response.json()
            if not geo_data:
                return "Error: Could not determine city from coordinates."
            city_name = geo_data[0]['name']
        else:
            city_name = location
            
        current_weather_url = f"https://api.openweathermap.org/data/2.5/weather?q={quote_plus(city_name)}&units=metric&appid={WEATHER_API_KEY}"
        current_response = requests.get(current_weather_url)
        current_response.raise_for_status()
        current_data = current_response.json()

        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?q={quote_plus(city_name)}&units=metric&appid={WEATHER_API_KEY}"
        forecast_response = requests.get(forecast_url)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()

        daily_forecast = {}
        for item in forecast_data['list']:
            date_string = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
            if date_string not in daily_forecast:
                daily_forecast[date_string] = {
                    "date": date_string,
                    "temp_max": item['main']['temp_max'],
                    "temp_min": item['main']['temp_min'],
                    "weather": item['weather'][0]['description'],
                    "pop": item.get('pop', 0)
                }
            else:
                daily_forecast[date_string]['temp_max'] = max(
                    daily_forecast[date_string]['temp_max'],
                    item['main']['temp_max']
                )
                daily_forecast[date_string]['temp_min'] = min(
                    daily_forecast[date_string]['temp_min'],
                    item['main']['temp_min']
                )

        processed_data = {
            "current_weather": {
                "city": current_data.get('name'),
                "temperature": current_data['main']['temp'],
                "feels_like": current_data['main']['feels_like'],
                "humidity": current_data['main']['humidity'],
                "wind_speed": current_data['wind']['speed'],
                "description": current_data['weather'][0]['description']
            },
            "five_day_forecast": list(daily_forecast.values())
        }

        # Store the new data in the dictionary
        weather_data_store[location] = {
            "timestamp": datetime.now().isoformat(),
            "data": processed_data
        }

        # Save the updated dictionary to the JSON file
        with open(WEATHER_DATA_FILE, 'w') as f:
            json.dump(weather_data_store, f, indent=2)
            
        return json.dumps(processed_data, indent=2)

    except requests.exceptions.HTTPError as err:
        return f"Error: Could not retrieve weather data. HTTP Error: {err.response.status_code} - {err.response.text}"
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}"

# --- 3. Tool-Specific Logic: Market Retrieval ---
# --- 3. Tool-Specific Logic: Market Retrieval (Updated) ---
MARKET_API_KEY = os.getenv("DATA_GOV_IN_API_KEY", "579b464db66ec23bdd000001798dfe5b454546066ddae0d79944e04d")
MARKET_DATA_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
MARKET_DATA_FILE = "market_data.json" # Renamed for clarity

def get_market_data(query: str) -> str:
    """
    Fetches and returns the latest market prices for a specific commodity, state, and district.
    The query should be a JSON string with optional keys: 'commodity', 'state', 'district'.
    The data is stored locally to prevent redundant API calls for recent queries.

    Args:
        query (str): A JSON string like '{"commodity": "rice", "state": "West Bengal"}'.

    Returns:
        str: A JSON string of the market data, or an error message.
    """
    try:
        params = json.loads(query)
    except json.JSONDecodeError:
        return "Error: Invalid JSON query format. Please provide a JSON string."

    # Create a consistent, sortable key from the query parameters
    sorted_params = sorted(params.items())
    query_key = json.dumps(sorted_params)

    try:
        # Load existing data or initialize an empty dictionary
        if os.path.exists(MARKET_DATA_FILE):
            with open(MARKET_DATA_FILE, 'r') as f:
                market_data_store = json.load(f)
        else:
            market_data_store = {}

        # Check if the query data is in the store and is still fresh
        if query_key in market_data_store:
            cached_data = market_data_store[query_key]
            timestamp = datetime.fromisoformat(cached_data.get('timestamp'))
            if (datetime.now() - timestamp).total_seconds() < 21600: # 6 hours
                return json.dumps(cached_data.get('data'))

        # If data is not fresh or doesn't exist, fetch new data
        filters = {
            "format": "json",
            "api-key": MARKET_API_KEY,
            "limit": 50,
        }
        
        if 'commodity' in params: filters[f"filters[commodity]"] = params['commodity']
        if 'state' in params: filters[f"filters[state]"] = params['state']
        if 'district' in params: filters[f"filters[district]"] = params['district']
        
        url_with_params = f"{MARKET_DATA_URL}?{urlencode(filters, quote_via=quote_plus)}"
        
        response = requests.get(url_with_params)
        response.raise_for_status()
        data = response.json()

        if data.get('records'):
            transformed_records = [
                {
                    "commodity": record.get("commodity", "N/A"),
                    "mandi": record.get("market", "N/A"),
                    "state": record.get("state", "N/A"),
                    "district": record.get("district", "N/A"),
                    "modal_price": record.get("modal_price", "N/A"),
                    "arrival_date": record.get("arrival_date", "N/A")
                }
                for record in data['records']
            ]
            
            # Store the new data in the dictionary
            market_data_store[query_key] = {
                "timestamp": datetime.now().isoformat(),
                "data": transformed_records
            }

            # Save the updated dictionary to the JSON file
            with open(MARKET_DATA_FILE, 'w') as f:
                json.dump(market_data_store, f, indent=2)
            
            return json.dumps(transformed_records, indent=2)
        else:
            return "No market data found for the given criteria."

    except requests.exceptions.HTTPError as err:
        return f"Error: Could not retrieve market data. HTTP Error: {err.response.status_code}"
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}"

# --- 4. Initialize Tools ---
crop_info_tool = create_retrieval_tool()
weather_tool = Tool(
    name="WeatherInfo",
    func=get_weather_data,
    description="Useful for fetching current and future weather conditions for a specific location. Input should be a string containing a location name (e.g., 'New Delhi' or '19.0760,72.8777')."
)
market_info_tool = Tool(
    name="MarketInfo",
    func=get_market_data,
    description="Useful for finding the latest market prices for agricultural commodities. Input should be a JSON string with optional keys: 'commodity', 'state', and 'district'. For example, use '{\"commodity\": \"rice\", \"state\": \"West Bengal\"}' to get rice prices in West Bengal."
)


# backend/app/tools.py
from langchain.tools import tool
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch, io, base64

# Load the ViT model once at startup
# Decode base64 → bytes → PIL

# feature_extractor = ViTFeatureExtractor.from_pretrained("app/crop_leaf_vit")
# model = ViTForImageClassification.from_pretrained("app/crop_leaf_vit")

processor = AutoImageProcessor.from_pretrained("app/mobilenet_plant_disease")
model = AutoModelForImageClassification.from_pretrained("app/mobilenet_plant_disease")


import requests

def crop_disease_classifier(image_path: str) -> str:
    """
    Classify crop leaf diseases from an uploaded image URL.
    """
    try:
        if image_path.startswith("http"):
            response = requests.get(image_path)
            image_bytes = response.content
        else:
            # Local file path (served by FastAPI static)
            with open(image_path.lstrip("/"), "rb") as f:
                image_bytes = f.read()

        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        inputs = processor(images=pil_image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)

        logits = outputs.logits
        predicted_class_idx = logits.argmax(-1).item()
        predicted_label = model.config.id2label[predicted_class_idx]

        return f"Detected disease: {predicted_label}"

    except Exception as e:
        return f"Error in crop_disease_classifier: {str(e)}"


crop_disease_classifier = Tool(
    name="crop_disease_classifier",
    func=crop_disease_classifier,
    description="Classifies crop leaf diseases from an uploaded image. Input should be a base64 encoded string of the image data.",
)



all_tools = [crop_info_tool, weather_tool, market_info_tool,crop_disease_classifier]
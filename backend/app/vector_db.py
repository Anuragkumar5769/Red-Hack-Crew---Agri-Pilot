# build_index.py
import logging
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    DirectoryLoader,
    CSVLoader,
    UnstructuredWordDocumentLoader,
)
import pandas as pd
# from app.tools import load_documents_from_directories # Import the loader from your existing file
import os
# --- Configuration ---
INDEX_PATH = "faiss_index"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_soil_documents():
    """
    Loads soil CSVs from 'data/soil_csvs' and converts each row to a Document.
    """
    soil_folder = os.path.join(os.path.dirname(__file__), "data", "csvs")
    if not os.path.exists(soil_folder):
        logger.warning(f"No soil data folder found at '{soil_folder}'")
        return []

    all_files = [os.path.join(soil_folder, f) for f in os.listdir(soil_folder) if f.endswith(".csv")]
    if not all_files:
        logger.warning("No soil CSV files found.")
        return []

    dfs = []
    for file in all_files:
        try:
            df = pd.read_csv(file)
            dfs.append(df)
            logger.info(f"Loaded {len(df)} soil rows from '{file}'")
        except Exception as e:
            logger.error(f"Failed to read '{file}': {e}")

    if not dfs:
        return []

    df = pd.concat(dfs, ignore_index=True)
    required_columns = ["district", "Nitrogen", "Phosphorous", "Potassium", "pH"]
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Average multiple rows per district
    df = df.groupby("district", as_index=False).mean()

    documents = []
    for _, row in df.iterrows():
        content = f"Soil data for {row['district']}: N={row['Nitrogen']}, P={row['Phosphorous']}, K={row['Potassium']}, pH={row['pH']}"
        metadata = {
            "district": row["district"],
            "N": row["Nitrogen"],
            "P": row["Phosphorous"],
            "K": row["Potassium"],
            "pH": row["pH"]
        }
        documents.append(Document(page_content=content, metadata=metadata))

    return documents

def load_documents_from_directories():
    """
    Loads documents from configured subdirectories (pdfs, csvs, docs).
    """
    all_docs = []
    # Assumes a 'data' folder is in the same directory as this 'app' folder
    base_path = os.path.join(os.path.dirname(__file__), "data")
    dir_configs = [
        {"path": os.path.join(base_path, "pdfs"), "loader_cls": PyPDFLoader, "glob": "**/*.pdf"},
        # {"path": os.path.join(base_path, "csvs"), "loader_cls": CSVLoader, "glob": "**/*.csv"},
        # {"path": os.path.join(base_path, "docs"), "loader_cls": UnstructuredWordDocumentLoader, "glob": "**/*.docx"},
    ]

    for config in dir_configs:
        path = config["path"]
        if os.path.exists(path) and os.path.isdir(path):
            loader = DirectoryLoader(
                path,
                glob=config["glob"],
                loader_cls=config["loader_cls"],
                show_progress=True,
                use_multithreading=True
            )
            try:
                docs = loader.load()
                if docs:
                    all_docs.extend(docs)
                    logger.info(f"Loaded {len(docs)} docs from {path} during build process.")
            except Exception as e:
                logger.error(f"Failed to load documents from {path}: {e}")
    return all_docs


def build_index():
    """
    Loads documents, creates embeddings, builds a FAISS index, 
    and saves it to disk. This is a one-time setup process.
    """
    logger.info("Starting index build process...")

    # 1. Load documents from your data directories
    logger.info("Loading documents...")
    docs = load_soil_documents()
    docs_to_process = load_documents_from_directories()+docs
    if not docs_to_process:
        logger.error("No documents found. Aborting index creation.")
        return

    # 2. Split the documents into chunks
    logger.info(f"Splitting {len(docs_to_process)} documents into chunks...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    split_docs = splitter.split_documents(docs_to_process)
    logger.info(f"Documents split into {len(split_docs)} chunks.")

    # 3. Initialize the embedding model
    logger.info(f"Initializing embedding model: {MODEL_NAME}")
    embeddings = HuggingFaceEmbeddings(model_name=MODEL_NAME)

    # 4. Create FAISS index from documents and save it
    logger.info("Creating FAISS vector store... This may take a while.")
    db = FAISS.from_documents(split_docs, embeddings)
    db.save_local(INDEX_PATH)
    
    logger.info(f"✅ FAISS index has been successfully created and saved to '{INDEX_PATH}'")

if __name__ == "__main__":
    build_index()
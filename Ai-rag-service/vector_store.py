from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from typing import List, Optional
import os

# Default persist directory for ChromaDB
DEFAULT_PERSIST_DIR = "./chroma_db"

# Default embedding model (free, runs locally)
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def get_embeddings(model_name: str = DEFAULT_EMBEDDING_MODEL) -> HuggingFaceEmbeddings:
    """
    Initialize HuggingFace embeddings model.
    
    Args:
        model_name: HuggingFace model name for embeddings
        
    Returns:
        HuggingFaceEmbeddings instance
    """
    return HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs={'device': 'cpu'},  # Use 'cuda' if GPU available
        encode_kwargs={'normalize_embeddings': True}
    )


def create_vector_store(
    documents: List[Document],
    persist_directory: str = DEFAULT_PERSIST_DIR,
    collection_name: str = "documents",
    embedding_model: str = DEFAULT_EMBEDDING_MODEL
) -> Chroma:
    """
    Create a ChromaDB vector store from documents.
    
    Args:
        documents: List of Document objects to embed and store
        persist_directory: Directory to persist the vector store
        collection_name: Name of the collection in ChromaDB
        embedding_model: HuggingFace model name for embeddings
        
    Returns:
        Chroma vector store instance
    """
    embeddings = get_embeddings(embedding_model)
    
    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=persist_directory,
        collection_name=collection_name
    )
    
    return vector_store


def load_vector_store(
    persist_directory: str = DEFAULT_PERSIST_DIR,
    collection_name: str = "documents",
    embedding_model: str = DEFAULT_EMBEDDING_MODEL
) -> Chroma:
    """
    Load an existing ChromaDB vector store.
    
    Args:
        persist_directory: Directory where vector store is persisted
        collection_name: Name of the collection in ChromaDB
        embedding_model: HuggingFace model name for embeddings
        
    Returns:
        Chroma vector store instance
    """
    embeddings = get_embeddings(embedding_model)
    
    vector_store = Chroma(
        persist_directory=persist_directory,
        collection_name=collection_name,
        embedding_function=embeddings
    )
    
    return vector_store


def similarity_search(
    query: str,
    vector_store: Chroma,
    k: int = 4
) -> List[Document]:
    """
    Search for similar documents in the vector store.
    
    Args:
        query: Search query string
        vector_store: Chroma vector store instance
        k: Number of results to return
        
    Returns:
        List of similar Document objects
    """
    return vector_store.similarity_search(query, k=k)


def similarity_search_with_score(
    query: str,
    vector_store: Chroma,
    k: int = 4
) -> List[tuple[Document, float]]:
    """
    Search for similar documents with relevance scores.
    
    Args:
        query: Search query string
        vector_store: Chroma vector store instance
        k: Number of results to return
        
    Returns:
        List of (Document, score) tuples
    """
    return vector_store.similarity_search_with_score(query, k=k)


def add_documents(
    documents: List[Document],
    vector_store: Chroma
) -> None:
    """
    Add new documents to an existing vector store.
    
    Args:
        documents: List of Document objects to add
        vector_store: Chroma vector store instance
    """
    vector_store.add_documents(documents)


def delete_collection(
    persist_directory: str = DEFAULT_PERSIST_DIR,
    collection_name: str = "documents"
) -> None:
    """
    Delete a collection from the vector store.
    
    Args:
        persist_directory: Directory where vector store is persisted
        collection_name: Name of the collection to delete
    """
    import chromadb
    
    client = chromadb.PersistentClient(path=persist_directory)
    client.delete_collection(collection_name)

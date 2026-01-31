from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from rag_pipeline import query, index_files, delete_documents
from llm_service import check_ollama_health, list_available_models


app = FastAPI(
    title="RAG Service API",
    description="RAG-based chatbot service for document Q&A",
    version="1.0.0"
)

# CORS middleware for Spring Boot communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class ChatRequest(BaseModel):
    question: str
    collection_name: Optional[str] = "documents"
    k: Optional[int] = 4
    threshold: Optional[float] = 1.0
    model: Optional[str] = "mistral"
    # Dynamic context from Spring Boot (jobs, applications, profiles)
    context: Optional[str] = None



class ChatResponse(BaseModel):
    answer: str
    sources: list
    documents_retrieved: Optional[int] = 0
    documents_used: Optional[int] = 0
    error: bool = False
    error_message: Optional[str] = None


class IndexRequest(BaseModel):
    file_paths: list[str]
    collection_name: Optional[str] = "documents"
    chunk_size: Optional[int] = 1000
    chunk_overlap: Optional[int] = 200


class IndexResponse(BaseModel):
    success: bool
    message: str
    indexed_count: int
    files_processed: Optional[int] = 0


class DeleteRequest(BaseModel):
    file_paths: list[str]
    collection_name: Optional[str] = "documents"


class DeleteResponse(BaseModel):
    success: bool
    message: str
    deleted_count: int


class HealthResponse(BaseModel):
    status: str
    ollama_available: bool
    available_models: list[str]


# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check the health of the RAG service and Ollama."""
    ollama_healthy = check_ollama_health()
    models = list_available_models() if ollama_healthy else []
    
    return HealthResponse(
        status="healthy" if ollama_healthy else "degraded",
        ollama_available=ollama_healthy,
        available_models=models
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Ask a question and get an answer based on indexed documents.
    
    Returns an answer grounded in the document context.
    If dynamic context is provided, it will be prioritized for answering.
    If no relevant documents are found, returns "I don't know" response.
    """
    result = query(
        question=request.question,
        collection_name=request.collection_name,
        k=request.k,
        threshold=request.threshold,
        model=request.model,
        dynamic_context=request.context
    )
    
    return ChatResponse(
        answer=result["answer"],
        sources=result.get("sources", []),
        documents_retrieved=result.get("documents_retrieved", 0),
        documents_used=result.get("documents_used", 0),
        error=result.get("error", False),
        error_message=result.get("error_message")
    )



@app.post("/index", response_model=IndexResponse)
async def index_documents(request: IndexRequest):
    """
    Index documents into the vector store.
    
    Accepts file paths that exist on the local filesystem.
    Documents are chunked and embedded for semantic search.
    """
    result = index_files(
        file_paths=request.file_paths,
        collection_name=request.collection_name,
        chunk_size=request.chunk_size,
        chunk_overlap=request.chunk_overlap
    )
    
    return IndexResponse(
        success=result["success"],
        message=result["message"],
        indexed_count=result["indexed_count"],
        files_processed=result.get("files_processed", 0)
    )


@app.delete("/documents", response_model=DeleteResponse)
async def delete_docs(request: DeleteRequest):
    """
    Delete documents from the vector store by file path.
    """
    result = delete_documents(
        file_paths=request.file_paths,
        collection_name=request.collection_name
    )
    
    return DeleteResponse(
        success=result["success"],
        message=result["message"],
        deleted_count=result["deleted_count"]
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

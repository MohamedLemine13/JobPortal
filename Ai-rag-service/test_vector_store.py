from document_loader import load_all_documents
from chunker import chunk_documents
from vector_store import (
    create_vector_store,
    load_vector_store,
    similarity_search,
    similarity_search_with_score
)
import shutil
import os

# Test directory for vector store
TEST_PERSIST_DIR = "./test_chroma_db"


def test_full_pipeline():
    """Test the complete RAG ingestion pipeline."""
    
    # Clean up any existing test data
    if os.path.exists(TEST_PERSIST_DIR):
        shutil.rmtree(TEST_PERSIST_DIR)
    
    # 1. Load documents
    docs = load_all_documents("/home/limam/Documents/Notes")
    print(f"✓ Loaded {len(docs)} documents")
    
    # 2. Chunk documents
    chunks = chunk_documents(docs, chunk_size=500, chunk_overlap=50)
    print(f"✓ Created {len(chunks)} chunks")
    
    # 3. Create vector store with embeddings
    print("Creating vector store (this may take a moment on first run)...")
    vector_store = create_vector_store(
        documents=chunks,
        persist_directory=TEST_PERSIST_DIR,
        collection_name="test_docs"
    )
    print(f"✓ Vector store created and persisted to {TEST_PERSIST_DIR}")
    
    # 4. Test similarity search
    query = "lora gateway"
    print(f"\n--- Searching for: '{query}' ---")
    
    results = similarity_search(query, vector_store, k=3)
    print(f"\nTop {len(results)} results:")
    for i, doc in enumerate(results, 1):
        print(f"\n{i}. Source: {doc.metadata.get('source', 'unknown')}")
        print(f"   Chunk: {doc.metadata.get('chunk', 'N/A')}")
        print(f"   Content: {doc.page_content[:200]}...")
    
    # 5. Test search with scores
    print(f"\n--- Search with scores ---")
    results_with_scores = similarity_search_with_score(query, vector_store, k=3)
    for doc, score in results_with_scores:
        print(f"Score: {score:.4f} | Source: {doc.metadata.get('source', 'unknown')}")
    
    # 6. Test loading existing vector store
    print("\n--- Testing vector store reload ---")
    loaded_store = load_vector_store(
        persist_directory=TEST_PERSIST_DIR,
        collection_name="test_docs"
    )
    reload_results = similarity_search("SSH", loaded_store, k=1)
    print(f"✓ Successfully reloaded vector store, found {len(reload_results)} results")
    
    print("\n✅ Full pipeline test completed!")


if __name__ == "__main__":
    test_full_pipeline()

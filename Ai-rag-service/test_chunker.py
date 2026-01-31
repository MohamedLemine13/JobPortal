from document_loader import load_all_documents
from chunker import chunk_documents

docs = load_all_documents("/home/limam/Documents/Notes")
chunks = chunk_documents(docs, chunk_size=1000, chunk_overlap=100)

print(f"Created {len(chunks)} chunks")
print(chunks[0].page_content[:500])
print(chunks[0].metadata)


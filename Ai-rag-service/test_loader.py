from document_loader import load_all_documents

docs = load_all_documents("/home/limam/Documents/Notes")

print(f"Loaded {len(docs)} documents")

for d in docs[:3]:
    print("TEXT:", d.page_content)
    print("META:", d.metadata)
    print("-----")


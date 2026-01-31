from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    Docx2txtLoader
)
from langchain_core.documents import Document
from pathlib import Path
import pandas as pd
import os

def load_excel(file_path: str):
    documents = []
    xls = pd.ExcelFile(file_path)

    for sheet_name in xls.sheet_names:
        df = xls.parse(sheet_name)

        # Convert rows to text
        for idx, row in df.iterrows():
            row_text = " | ".join(
                [f"{col}: {row[col]}" for col in df.columns if pd.notna(row[col])]
            )

            if row_text.strip():
                documents.append(
                    Document(
                        page_content=row_text,
                        metadata={
                            "source": file_path,
                            "sheet": sheet_name,
                            "row": idx
                        }
                    )
                )

    return documents


def load_document(file_path: str):
    ext = Path(file_path).suffix.lower()

    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
        return loader.load()

    elif ext == ".txt":
        loader = TextLoader(file_path, encoding="utf-8")
        return loader.load()

    elif ext == ".docx":
        loader = Docx2txtLoader(file_path)
        return loader.load()

    elif ext in [".xls", ".xlsx"]:
        return load_excel(file_path)

    else:
        raise ValueError(f"Unsupported file type: {ext}")


def load_all_documents(base_path: str):
    documents = []

    for root, _, files in os.walk(base_path):
        for file in files:
            path = os.path.join(root, file)
            try:
                docs = load_document(path)
                documents.extend(docs)
            except Exception as e:
                print(f"Skipping {path}: {e}")

    return documents

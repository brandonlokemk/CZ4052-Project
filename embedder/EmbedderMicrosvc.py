from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from langchain.llms import OpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain import PromptTemplate
import langchain
import openai 
from PyPDF2 import PdfReader
from langchain_openai import OpenAI
import pinecone
import os
from dotenv import load_dotenv, find_dotenv

find_dotenv()
load_dotenv(find_dotenv(), override=True)
openai.api_key=os.getenv("OPENAI_KEY")
client = OpenAI(api_key=os.getenv("OPENAI_KEY"))  

import io

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    if file:
        try:
            chunks = extract_text_chunks_from_pdf(file)
            embedded_chunks = embed_and_store_chunks(chunks)
            return jsonify({'status': 'success', 'embedded_chunks': embedded_chunks})
        except Exception as e:
            return jsonify({'error': str(e)})

#Split uploaded file into chunks
def extract_text_chunks_from_pdf(file):
    try:
        reader = PdfReader(file)
        text = ""
        #read text
        for page in reader.pages:
            text += page.extract_text() + "\n"
        #split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            separators=["\n\n", "\n", " ", ""],
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = text_splitter.create_documents(texts=[text])
        return chunks
    except Exception as e:
        raise RuntimeError(f"Error extracting text chunks from PDF: {e}")

#Store vectors in Pinecone db
def embed_and_store_chunks(chunks):
    try:
        #embed chunks
        embedding_generator = OpenAIEmbeddings(model="text-embedding-ada-002", openai_api_key=os.getenv("OPENAI_KEY"))
        #store vectors in Pinecone db
        index_name = os.getenv("PINECONE_INDEX")
        docsearch = PineconeVectorStore.from_documents(chunks, embedding_generator, index_name=index_name)
        return docsearch
    except Exception as e:
        raise RuntimeError(f"Error embedding and storing chunks into Pinecone: {e}")

if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT"))



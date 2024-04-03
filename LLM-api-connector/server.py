import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv, find_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI
from langchain_pinecone import PineconeVectorStore
import pymongo
from bson.objectid import ObjectId

load_dotenv(find_dotenv("./config/.env"))

app = Flask(__name__)
CORS(app)

# Instantiate connection to Mongo Atlas
try:
    client = pymongo.MongoClient(os.getenv("MONGO_URI"))

    # Access the database and collection
    db = client.test
    collection = db.prompts

    # Fetch the document by _id (Hardcoded for example)
    document = collection.find_one({"_id": ObjectId("660d334aa446317f0c7e55a6")})

    # Check if document exists
    if document:
        # Access the "prompt" field from the fetched document
        prompt = document.get("prompt")
        
        # Print the prompt
        print("Prompt:", prompt)
        system_message_prompt = SystemMessagePromptTemplate.from_template(prompt)
    else:
        print("Document not found.")
except Exception as e:
    print("An error occurred, unable to fetch prompt template from Mongo Atlas:", e)

# Instantiate connection to Pinecone
try:
    embedding_generator = OpenAIEmbeddings(model="text-embedding-ada-002",openai_api_key=os.getenv("OPENAI_API_KEY"))
    index_name = os.getenv("PINECONE_INDEX")
    vectorstore = PineconeVectorStore(
        index_name=os.getenv("PINECONE_INDEX"),
        embedding=OpenAIEmbeddings(model="text-embedding-ada-002")
    )

    print("Connected to Pinecone")
except Exception as e:
    print("Error occurred, unable to connect to Pinecone")

# LLM functions 
human_template = """
Context: {context}

History: {history}

Query: {query}
"""
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)

chat_prompt = ChatPromptTemplate.from_messages(
    [system_message_prompt, human_message_prompt]
)

chat = ChatOpenAI(temperature=0)

@app.route('/getAns', methods=['POST', 'OPTIONS'])
def getAnswer():
    if request.method == 'OPTIONS':
        # Respond to preflight request
        response = jsonify({'status': 'success'})
        response.headers['Access-Control-Allow-Origin'] = '*'  # Adjust as needed
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Allow-Methods'] = 'POST'
        return response
    
    try: 
        data = request.get_json()
        prompt = data.get("userInput","") # Default set the input to blank
        history = data.get("chatHistory", "") # Default set to blank

        if len(history) >= 4:
            history[:] = history[-4:]

        docs = vectorstore.similarity_search(prompt, k=3)

        if docs == []:
            vector_result = "Not sure of the answer"
        else:
            temp = []
            for i in range(len(docs)):
                temp.append([docs[i].page_content])
            vector_result = str(temp)
            print(vector_result)

        reply = chat(
            chat_prompt.format_prompt(
                context=vector_result, history=history, query=prompt
            ).to_messages()
        )

        return {"Answer":reply.content}
    except:
        return jsonify({"Status":"Failure --- Error with OpenAI API"})

if __name__ == "__main__":
    app.run(debug=True, port=os.getenv("PORT"))
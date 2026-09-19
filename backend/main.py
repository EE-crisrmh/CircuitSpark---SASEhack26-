from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json
import uuid

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Open the JSON file and load its contents into a Python dictionary. 
with open ("buck_converter_steps.json") as f:
           CIRCUIT_DATA = json.load(f)

STEPS = CIRCUIT_DATA["steps"] 

#In-memory storage: simple dictionary holding every active session.
sessions = {} 

class StartResponse(BaseModel):
        session_id: str
        step_number: int
        total_steps: int 
        title: str
        task: str

class AnswerRequest(BaseModel):
        session_id: str
        answer: str 

class AnswerResponse(BaseModel): 
        correct: bool 
        message: str
        hint_level: int 
        step_number: int 
        total_steps: int 
        completed: bool 
 
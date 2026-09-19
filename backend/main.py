from ast import For

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

@app.post("/start", response_model=StartResponse) 
def start_session():
        session_id = str(uuid.uuid4())

        sessions[session_id]= {
            "current_step_index" : 0,
            "hint_level": 0,
            "attempts": 0,
        }

        first_step = STEPS[0]

        return StartResponse(
            session_id=session_id,
            step_number=1,
            total_steps=len(STEPS),
            title=first_step["title"],
            task=first_step["task"]
        )

def evaluate_component_step(step, student_answer): 
    """For steps 3-7: keyword match, no API call needed.""" 
    expected_components = [c.lower() for c in step["expected_answer"]["components"]]
    answer_lower = student_answer.lower() 

    abbreviations = {
            "capacitor": ["capacitor", "cap", "caps"], 
            "inductor": ["inductor", "coil", "ind"], 
            "resistor": ["resistor", "res", "resist"],
    }

    for comp in expected_components: 
            accepted_terms = abbreviations.get(comp, [comp]) 
            if not any(term in answer_lower for term in accepted_terms):
                    return False 

        return True


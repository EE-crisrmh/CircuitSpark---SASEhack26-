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
with open (buck_converter_steps.json") as f:
           CIRCUIT_DATA = json.load(f)

STEPS = CIRCUIT_DATA["steps"] 
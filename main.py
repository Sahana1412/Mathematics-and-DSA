from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# FastAPI App
app = FastAPI()

# CORS Middleware (allow frontend to communicate with backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to store uploaded files
UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve uploaded files
app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")

# Simulated database for storing file records
records = {}

@app.post("/upload/")
async def upload_file(
    aadhaar: str = Form(...), 
    password: str = Form(...), 
    file: UploadFile = File(...)
):
    user_key = (aadhaar, password)

    # Ensure multiple files can be stored per user
    if user_key not in records:
        records[user_key] = []

    # Save the uploaded file
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    records[user_key].append({"file_name": file.filename, "file_path": f"/files/{file.filename}"})

    return {"message": "File uploaded successfully"}

@app.post("/retrieve/")
async def retrieve_records(aadhaar: str = Form(...), password: str = Form(...)):
    user_key = (aadhaar, password)

    if user_key not in records or not records[user_key]:
        raise HTTPException(status_code=404, detail="No files found for the given credentials")

    return JSONResponse(content={"files": records[user_key]})

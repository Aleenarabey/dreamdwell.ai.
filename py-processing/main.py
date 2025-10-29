from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import shutil
import os

app = FastAPI()

# Enable CORS (allows React to communicate with this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
UPLOAD_DIR = './uploads'
PROCESSED_DIR = './processed'
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)


@app.get("/")
def read_root():
    return {"message": "FastAPI Floorplan Processing Service"}


@app.post("/process-image/")
async def process_image(file: UploadFile = File(...)):
    """Preprocess image and return processed image file"""
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Load and preprocess image
    image = cv2.imread(file_location)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(
        blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 2
    )

    # Save processed image
    out_path = f"{PROCESSED_DIR}/processed_{file.filename}"
    cv2.imwrite(out_path, thresh)

    return FileResponse(out_path, media_type="image/jpeg")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "floorplan-processor"}


@app.post("/detect-features/")
async def detect_features(file: UploadFile = File(...)):
    """Detect walls (lines) and rooms (contours) and return as JSON"""
    
    # Save uploaded file
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Read and preprocess
    image = cv2.imread(file_location)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(
        blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 2
    )

    # --- WALL DETECTION (Lines using Hough Transform) ---
    edges = cv2.Canny(thresh, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(
        edges, 
        rho=1, 
        theta=np.pi/180, 
        threshold=80, 
        minLineLength=50, 
        maxLineGap=10
    )
    
    wall_lines = []
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            wall_lines.append({
                "x1": int(x1),
                "y1": int(y1),
                "x2": int(x2),
                "y2": int(y2)
            })

    # --- ROOM DETECTION (Contours) ---
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    rooms = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 500:  # Filter small noise contours
            perimeter = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * perimeter, True)
            
            points = []
            for point in approx:
                x, y = point[0]
                points.append({"x": int(x), "y": int(y)})
            
            rooms.append({
                "area": int(area),
                "perimeter": int(perimeter),
                "points": points
            })

    # Return JSON with detected features
    return JSONResponse({
        "success": True,
        "imageWidth": image.shape[1],
        "imageHeight": image.shape[0],
        "walls": wall_lines,
        "rooms": rooms
    })



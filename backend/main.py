import shutil, os
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from model import SimpleCNN

app = FastAPI()

# Mount the uploads folder to serve the uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Folder to save the uploaded images
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create the model
cnn = SimpleCNN(input_shape=(64, 64, 3), num_classes=2)
cnn.create_model()

# Train the model (maybe this can be done before starting the server)
# cnn.train(X_train, y_train, X_val, y_val, epochs=10, batch_size=32)

# Initialize an array to store the classified images and their probabilities
classified_images = []


@app.get("/")
async def start():
    """Endpoint to check if the backend is running"""
    return JSONResponse(content={"message": "Backend funcionando correctamente 🚀"}, status_code=200)


@app.post("/classify-image")
async def upload_image(file: UploadFile = File(...)):
    """Endpoint to receive and save an image file"""
    try:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"INFO - Image saved at: {file_path}")

        # Predict the class of the image
        class_idx, probabilities = cnn.predict(file_path)

        print(f"INFO - Class index: {class_idx}")
        print(f"INFO - Probabilities: {probabilities}")

        # Construct the image URL
        image_url = f"/uploads/{file.filename}"

        # Store the classified image and its probabilities
        classified_images.append(
            {"image_url": image_url, "class_idx": int(class_idx), "probabilities": probabilities.tolist()}
        )

        return JSONResponse(
            content={"image_url": image_url, "class_idx": int(class_idx), "probabilities": probabilities.tolist()},
            status_code=200,
        )

    except Exception as e:
        print(f"ERROR - {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/previous-classifications")
async def get_classified_images():
    """Endpoint to get the classified images"""
    return JSONResponse(content=classified_images, status_code=200)

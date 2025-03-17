import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
from tensorflow.keras.preprocessing import image


class SimpleCNN:
    def __init__(self, input_shape=(64, 64, 3), num_classes=2):
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.model = None

    def create_model(self):
        self.model = keras.Sequential(
            [
                layers.Conv2D(32, (3, 3), activation="relu", input_shape=self.input_shape),
                layers.MaxPooling2D((2, 2)),
                layers.Conv2D(64, (3, 3), activation="relu"),
                layers.MaxPooling2D((2, 2)),
                layers.Flatten(),
                layers.Dense(64, activation="relu"),
                layers.Dense(self.num_classes, activation="softmax"),
            ]
        )
        self.model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
        print("Model created and compiled.")

    def train(self, X_train, y_train, X_val, y_val, epochs=10, batch_size=32):
        if self.model is None:
            raise ValueError("Model has not been created. Call create_model() first.")

        self.model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=epochs, batch_size=batch_size)
        print("Training complete.")

    def predict(self, filepath):
        if self.model is None:
            raise ValueError("Model has not been created or trained.")

        img = image.load_img(filepath, target_size=self.input_shape[:2])
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0  # Normalize

        predictions = self.model.predict(img_array)
        class_idx = np.argmax(predictions)
        return class_idx, predictions[0]

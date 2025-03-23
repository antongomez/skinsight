import tensorflow as tf
import numpy as np


class SkinSightModel:

    def __init__(self, dir_models="models", model_name="best_model", img_size=(256, 256)):
        self.img_size = img_size
        self.model = tf.keras.models.load_model(f"{dir_models}/{model_name}.keras")

    def predict(self, filepath):
        if self.model is None:
            raise ValueError("Model has not been loaded yet. Please load a model first.")

        img = self.load_and_preprocess_image(filepath)
        img_array = np.expand_dims(img, axis=0)

        probabilities = self.model.predict(img_array)[0]
        class_idx = np.argmax(probabilities)
        return class_idx, probabilities

    def load_and_preprocess_image(self, file_path):
        """
        Reads an image from a file, preprocesses it, and normalizes it in the same way as the training data.
        """
        # Read and decode the image file
        image = tf.io.read_file(file_path)
        image = tf.image.decode_image(image, channels=3, expand_animations=False)
        image = tf.cast(image, tf.float32)

        # Add padding to make the image square and resize it
        image = self._add_padding(image)
        image = tf.image.resize(image, self.img_size)

        # Normalize the image to [0, 1]
        image = image / 255.0
        return image

    def _add_padding(self, image):
        """
        Add padding to an image to make it square. The padding is added to the smaller dimension.

        Args:
            image (tensor): Image with shape (height, width, channels).

        Returns:
            tensor: Image with padding added.
        """
        shape = tf.shape(image)
        height = shape[0]
        width = shape[1]

        diff = tf.abs(width - height)

        # If the image has more width than height, add padding to the top and bottom
        def pad_height():
            pad_top = diff // 2
            pad_bottom = diff - pad_top
            paddings = [[pad_top, pad_bottom], [0, 0], [0, 0]]
            return tf.pad(image, paddings, constant_values=0)

        # If the image has more height than width, add padding to the left and right
        def pad_width():
            pad_left = diff // 2
            pad_right = diff - pad_left
            paddings = [[0, 0], [pad_left, pad_right], [0, 0]]
            return tf.pad(image, paddings, constant_values=0)

        image = tf.cond(width > height, pad_height, pad_width)
        return image

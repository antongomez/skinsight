import tensorflow as tf
import os
import math


class ImageDataLoader:
    def __init__(
        self, data_dir, batch_size=64, img_size=(256, 256), train_ratio=0.7, val_ratio=0.15, test_ratio=0.15, seed=42
    ):
        """
        Class to load and split image data into train, validation, and test sets.

        Args:
            data_dir (str): Path to the directory containing the images.
            batch_size (int): Batch size for the DataLoader.
            img_size (tuple): Final size to which the images will be resized (e.g., (256, 256)).
            train_ratio (float): Proportion of data for training.
            val_ratio (float): Proportion of data for validation.
            test_ratio (float): Proportion of data for testing.
        """
        assert math.isclose(train_ratio + val_ratio + test_ratio, 1.0), "The ratios must sum to 1."

        self.data_dir = data_dir
        self.batch_size = batch_size
        self.img_size = img_size

        # Get file paths, labels, and class names
        file_paths, labels, class_names = self._get_file_paths_and_labels(self.data_dir)
        self.class_names = class_names
        print(f"Num classes: {len(self.class_names)}. Found classes: {self.class_names}")
        print(f"Num images per class: {[labels.count(i) for i in range(len(class_names))]}")

        total_size = len(file_paths)

        # Create a dataset from the file paths and labels
        dataset = tf.data.Dataset.from_tensor_slices((file_paths, labels))
        dataset = dataset.shuffle(buffer_size=total_size, seed=seed)

        # Map the load_and_preprocess_image function to the dataset
        dataset = dataset.map(self.load_and_preprocess_image, num_parallel_calls=tf.data.AUTOTUNE)

        # Dividir el dataset en train, validation y test
        train_size = math.floor(train_ratio * total_size)
        val_size = math.floor(val_ratio * total_size)
        test_size = total_size - train_size - val_size

        self.train = dataset.take(train_size).batch(self.batch_size).prefetch(tf.data.AUTOTUNE)
        self.val = dataset.skip(train_size).take(val_size).batch(self.batch_size).prefetch(tf.data.AUTOTUNE)
        self.test = (
            dataset.skip(train_size + val_size).take(test_size).batch(self.batch_size).prefetch(tf.data.AUTOTUNE)
        )

    def _get_file_paths_and_labels(self, data_dir):
        """
        Get the file paths, labels, and class names from the data directory.

        Returns:
            file_paths (list): List of file paths.
            labels (list): List of the numeric labels corresponding to the file paths.
            class_names (list): List of class names.
        """
        file_paths = []
        labels = []
        # We suppose that each subdirectory in the data directory corresponds to a class
        class_names = sorted([d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))])
        for idx, cls in enumerate(class_names):
            cls_dir = os.path.join(data_dir, cls)
            for file in os.listdir(cls_dir):
                if file.lower().endswith(("png", "jpg", "jpeg")):
                    file_paths.append(os.path.join(cls_dir, file))
                    labels.append(idx)
        return file_paths, labels, class_names

    def load_and_preprocess_image(self, file_path, label):
        """
        Reads an image from a file, preprocesses it, and normalizes it.
        """
        # Read and decode the image file
        image = tf.io.read_file(file_path)
        image = tf.image.decode_image(image, channels=3, expand_animations=False)
        image = tf.cast(image, tf.float32)

        # Add padding to make the image square
        image = self._add_padding(image)

        # Resize the image to the desired size
        image = tf.image.resize(image, self.img_size)

        # Normalize the image to [0, 1]
        image = image / 255.0
        return image, label

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

    def get_datasets(self):
        """Return the train, validation, and test datasets."""
        return self.train, self.val, self.test

    def get_class_mapping(self):
        """Return a dictionary mapping the class index to the class name."""
        return {i: cls for i, cls in enumerate(self.class_names)}

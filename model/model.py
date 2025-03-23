import os, argparse, pickle
import tensorflow as tf
from dataloader import ImageDataLoader

parser = argparse.ArgumentParser(
    description="Train a Convolutional Neural Network (CNN) model on the CIFAR-10 dataset."
)

parser.add_argument(
    "--data_dir", type=str, default="data/raw_data/", help="Path to the data directory (default: data/raw_data/)"
)
parser.add_argument("--batch_size", type=int, default=32, help="Size of the batches (default: 32)")
parser.add_argument("--dir_save_models", type=str, default="models/", help="Path to save the models (default: models/)")

args = parser.parse_args()
data_dir = args.data_dir
batch_size = args.batch_size
dir_save_models = args.dir_save_models

# load data from the data directory using the ImageDataLoader class
data_loader = ImageDataLoader(data_dir, batch_size=batch_size)
train_ds, val_ds, test_ds = data_loader.get_datasets()


def generate_ann(
    input_shape=(256, 256, 3),
    filters=[32, 64, 128, 256],
    dense_units=[256, 128],
    output_units=3,
    dropout_rate=0.15,
):
    """
    Generates a Convolutional Neural Network (CNN) model for CIFAR-10.

    Args:
    - filters (list): A list of integers specifying the number of filters in each convolutional layer.
    - dense_units (list): A list of integers specifying the number of units in each fully connected layer.
    - dropout_rate (float): The dropout rate for the fully connected layers.

    Returns:
    - model (tf.keras.Model): The compiled CNN model.
    """

    model = tf.keras.Sequential()

    for i, filter in enumerate(filters):
        if i == 0:
            model.add(
                tf.keras.layers.Conv2D(filter, (3, 3), activation="relu", padding="same", input_shape=input_shape)
            )
        else:
            model.add(tf.keras.layers.Conv2D(filter, (3, 3), activation="relu", padding="same"))
        model.add(tf.keras.layers.BatchNormalization())
        model.add(tf.keras.layers.MaxPooling2D(pool_size=(2, 2)))

    model.add(tf.keras.layers.Flatten())

    for units in dense_units:
        model.add(tf.keras.layers.Dense(units, activation="relu"))
        model.add(tf.keras.layers.Dropout(dropout_rate))

    model.add(tf.keras.layers.Dense(output_units, activation="softmax"))
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

    return model


model = generate_ann()

# Callbacks
early_stopping = tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)
dir_save_models = "models"
os.makedirs(dir_save_models, exist_ok=True)
model_checkpoint = tf.keras.callbacks.ModelCheckpoint(dir_save_models + "/best_model.keras", save_best_only=True)

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=50,
    callbacks=[early_stopping, model_checkpoint],
)

with open(f"{dir_save_models}/history.pkl", "wb") as f:
    pickle.dump(history.history, f)

test_loss, test_acc = model.evaluate(test_ds)
print(f"Test accuracy: {test_acc:.4f}")

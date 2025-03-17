export default class BackendClient {
  constructor() {
    this.apiBaseUrl = "http://127.0.0.1:8000";
  }

  async ping() {
    const response = await fetch(`${this.apiBaseUrl}/`);
    if (!response.ok) throw new Error("Error: Could not connect to the server");

    const res = await response.json();
    console.log("Server response", res.message);

    return res.message;
  }

  async classifyImage(image, fileName) {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("filename", fileName);

    // Send the image to the server
    const response = await fetch(`${this.apiBaseUrl}/classify-image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok)
      throw new Error("Error: Could not send the image to the server");

    const classificationResult = await response.json();
    console.log("Image URL", classificationResult);

    return classificationResult;
  }
}

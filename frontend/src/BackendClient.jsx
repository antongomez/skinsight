export default class BackendClient {
  constructor() {
    this.apiBaseUrl = "http://127.0.0.1:8000";
  }

  async ping() {
    const response = await fetch(`${this.apiBaseUrl}/`);
    if (!response.ok) throw new Error("Error: Could not connect to the server");

    const res = await response.json();

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

    return classificationResult;
  }

  async getPreviousClassifications() {
    const response = await fetch(`${this.apiBaseUrl}/previous-classifications`);
    if (!response.ok)
      throw new Error("Error: Could not get the previous classifications");

    const previousClassifications = await response.json();
    console.log("Previous classifications", previousClassifications);

    return previousClassifications;
  }
}

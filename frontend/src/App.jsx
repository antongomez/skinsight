import React, { useState, useRef } from "react";
import {
  Container,
  Button,
  Card,
  Form,
  Image,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import BackendClient from "./BackendClient";

export const App = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const [classificationResult, setClassificationResult] = useState(null);
  const [awaitingResponse, setAwaitingResponse] = useState(false);

  const backendClient = new BackendClient();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFileName(file.name);
    }
  };

  const handleClassifyImage = async () => {
    try {
      setAwaitingResponse(true);
      const classificationResult = await backendClient.classifyImage(
        imageFile,
        fileName
      );

      setTimeout(() => {
        setAwaitingResponse(false);
      }, 1000);

      console.log("Classification result", classificationResult);
      setClassificationResult(classificationResult);
    } catch (error) {
      console.error("Error classifying the image", error);
      setClassificationResult(null);
      handleClear();
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Container fluid className="px-0 py-5 bg-dark min-vh-100">
      <Container fluid className="text-center text-white ">
        <Image
          src={"/logo.svg"}
          alt="SkinSight Logo"
          fluid
          style={{ maxWidth: "200px" }}
        />
        <h1 className="mt-4">Welcome to SkinSight</h1>
        <p className="lead">
          An AI-powered mobile application to classify skin images
        </p>
      </Container>
      <Container fluid className="mt-5">
        <Card>
          <Card.Body>
            <Container
              className="px-0 border-bottom border-light"
              xs={1}
              md={2}
            >
              <h3 className="mb-4">Upload an image</h3>
              <Form>
                <Form.Group
                  controlId="formFile"
                  className={`${imagePreview ? "mb-0" : "mb-4"}`}
                >
                  <Form.Label>Select a skin image to be classified</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </Form.Group>
              </Form>

              {imagePreview && (
                <Container
                  fluid
                  className="px-0 py-4 d-flex flex-column align-items-center"
                >
                  <h5>Preview:</h5>
                  <Image
                    fluid
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "50%" }}
                  />
                </Container>
              )}
            </Container>
            <Container fluid className="d-flex justify-content-center mt-4">
              <Button
                variant="primary"
                className="me-2"
                onClick={() => handleClassifyImage()}
                disabled={!imagePreview}
              >
                Classify image
              </Button>
              <Button
                variant="secondary"
                className="ms-2 text-white"
                onClick={handleClear}
                disabled={!imagePreview}
              >
                Clear
              </Button>
            </Container>
          </Card.Body>
        </Card>
        <Card className="mt-4">
          <Card.Body>
            <h3>Classification Result</h3>
            {awaitingResponse ? (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : classificationResult ? (
              <Row className="d-flex justify-content-center">
                <Col>
                  <p>{classificationResult.class_idx}</p>
                </Col>
                <Col>
                  <p>{classificationResult.probabilities}</p>
                </Col>
              </Row>
            ) : (
              <p>No classification result available.</p>
            )}
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
};

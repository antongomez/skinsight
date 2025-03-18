import React, { useState, useRef, useEffect } from "react";
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
  const [previousClassifications, setPreviousClassifications] = useState([]);

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

      console.log("Classification result", classificationResult);
      setClassificationResult(classificationResult);
    } catch (error) {
      console.error("Error classifying the image", error);
      setClassificationResult(null);
    } finally {
      handleClear();
      setTimeout(() => {
        setAwaitingResponse(false);
      }, 1000);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Load previous classifications
  useEffect(() => {
    const loadPreviousClassifications = async () => {
      try {
        const res = await backendClient.getPreviousClassifications();
        console.log("Previous classifications", res);
        setPreviousClassifications(res);
      } catch (error) {
        console.error("Error loading previous classifications", error);
      }
    };

    loadPreviousClassifications();
  }, [classificationResult]);

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
        <Row className="mx-0 d-flex justify-content-center align-items-top">
          <Col xs={12} md={6} className="mb-4 mb-md-0">
            <Card className="min-vh-xs-25 min-vh-lg-50">
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
                      <Form.Label>
                        Select a skin image to be classified
                      </Form.Label>
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
                        className="mw-xs-50 mw-lg-25"
                      />
                    </Container>
                  )}
                </Container>
                <Container
                  fluid
                  className="d-flex flex-column flex-md-row justify-content-center mt-4"
                >
                  <Button
                    variant="primary"
                    className="mb-2 mb-md-0 me-md-2"
                    onClick={() => handleClassifyImage()}
                    disabled={!imagePreview}
                  >
                    Classify image
                  </Button>
                  <Button
                    variant="secondary"
                    className="ms-md-2 text-white"
                    onClick={handleClear}
                    disabled={!imagePreview}
                  >
                    Clear
                  </Button>
                </Container>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="min-vh-xs-25 min-vh-lg-50">
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
                    <Col
                      xs={12}
                      md={6}
                      xxl={4}
                      className="d-flex flex-column align-items-center my-3 my-md-0"
                    >
                      <h5>Label</h5>
                      <p>{classificationResult.class_idx}</p>
                    </Col>
                    <Col
                      xs={12}
                      md={6}
                      xxl={4}
                      className="d-flex flex-column align-items-center my-3 my-md-0"
                    >
                      <Image
                        fluid
                        src={`${backendClient.apiBaseUrl}${classificationResult.image_url}`}
                        alt="Classified Image"
                      />
                    </Col>
                    <Col
                      xs={12}
                      md={6}
                      xxl={4}
                      className="d-flex flex-column align-items-center my-3 my-md-0"
                    >
                      <h5>Probabilities</h5>
                      {classificationResult.probabilities.map((prob, index) => (
                        <p key={index} className="mb-1">
                          <span className="fw-bolder">Class {index}</span>:{" "}
                          {prob.toFixed(4)}
                        </p>
                      ))}
                    </Col>
                  </Row>
                ) : (
                  <p>No classification result available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Container fluid className="mt-3">
          <Card className="min-vh-xs-25 min-vh-lg-50">
            <Card.Body>
              <h3>Previous classifications</h3>
              {previousClassifications.length > 0 ? (
                <Container fluid className="px-0">
                  {previousClassifications
                    .reverse()
                    .map((classification, index) => (
                      <Row className="d-flex justify-content-center py-2">
                        <Col key={index} xs={4} className="">
                          <Image
                            fluid
                            src={`${backendClient.apiBaseUrl}${classification.image_url}`}
                            alt="Classified Image"
                          />
                        </Col>
                        <Col
                          xs={4}
                          className="d-flex flex-column justify-content-center"
                        >
                          <h5>Probabilities</h5>
                          {classification.probabilities.map((prob, index) => (
                            <p key={index} className="mb-1">
                              <span className="fw-bolder">Class {index}</span>:{" "}
                              {prob.toFixed(4)}
                            </p>
                          ))}
                        </Col>
                      </Row>
                    ))}
                </Container>
              ) : (
                <p>No previous classifications available.</p>
              )}
            </Card.Body>
          </Card>
        </Container>
      </Container>
    </Container>
  );
};

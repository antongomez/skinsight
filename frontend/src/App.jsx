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

  const classLabels = {
    0: "atopic dermatitis",
    1: "eczema",
    2: "melanoma",
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
      setTimeout(() => setAwaitingResponse(false), 1000);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setImageFile(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearClassificationResult = () => {
    setClassificationResult(null);
  };

  // Load previous classifications
  useEffect(() => {
    const loadPreviousClassifications = async () => {
      try {
        const res = await backendClient.getPreviousClassifications();
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
          style={{ width: "200px" }}
        />
        <h1 className="mt-4">Welcome to SkinSight</h1>
        <p className="lead">
          An AI-powered mobile application to classify skin images
        </p>
      </Container>
      {!awaitingResponse && !classificationResult && (
        <Container fluid className="mt-5 px-3 px-md-5 mw-xl-50 text-center">
          <Card className="border-rounded border-lighter-dark-2 bg-lighter-dark text-white">
            <Card.Body>
              <Container
                className="px-0 border-bottom border-lighter-dark-2"
                xs={1}
                md={2}
              >
                <h3 className="mb-2">Upload an image</h3>
                <Form data-bs-theme="dark">
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
                      className="mw-xs-100 mw-sm-75 mw-md-50"
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
        </Container>
      )}
      {awaitingResponse && (
        <Container fluid className="mt-5 px-3 px-md-5 mw-xl-50 text-center">
          <Card className="border-rounded border-lighter-dark-2 bg-lighter-dark text-white">
            <Card.Body>
              <h3 className="mb-4">Classifying image...</h3>
              <Spinner size="lg" animation="border" variant="primary" />
            </Card.Body>
          </Card>
        </Container>
      )}
      {!awaitingResponse && classificationResult && (
        <Container
          fluid
          className="mt-5 px-3 px-md-5 mw-xl-75 mw-xxl-50 text-center"
        >
          <Card className="border-rounded border-lighter-dark-2 bg-lighter-dark text-white">
            <Card.Body>
              <h3 className="mb-4">Classification Result</h3>
              <Container fluid className="px-0">
                <Image
                  fluid
                  src={`${backendClient.apiBaseUrl}${classificationResult.image_url}`}
                  alt="Classified Image"
                />
              </Container>
              <Container fluid className="px-0 mt-4">
                <h5 className="text-capitalize">
                  Predicted:{" "}
                  <span className="fw-bolder text-success">
                    {classLabels[classificationResult.class_idx]}
                  </span>
                </h5>
              </Container>
              <hr className="border-lighter-dark-2 my-4" />
              <Container fluid className="px-0">
                <h5>Probabilities</h5>
                {classificationResult.probabilities.map((prob, index) => (
                  <p key={index} className="mb-1">
                    <span className="text-capitalize">
                      {classLabels[index]}
                    </span>
                    : {(prob * 100).toFixed(2)}%
                  </p>
                ))}
              </Container>
            </Card.Body>
          </Card>
          <Button className="mt-3" onClick={handleClearClassificationResult}>
            Classify another image
          </Button>
          <hr className="border-lighter-dark-2 my-5" />
          <Card className="border-rounded border-lighter-dark-2 bg-lighter-dark text-white">
            <Card.Body>
              <h3>Previous classifications</h3>
              {previousClassifications.length > 0 ? (
                <Container fluid className="px-0">
                  {[...previousClassifications]
                    .reverse()
                    .map((classification, index) => (
                      <Row
                        key={index}
                        className="d-flex justify-content-center py-3 row-border-bottom"
                      >
                        <Col xs={10} md={6} xl={4} className="mb-4 mb-md-0">
                          <Image
                            fluid
                            src={`${backendClient.apiBaseUrl}${classification.image_url}`}
                            alt="Classified Image"
                          />
                        </Col>
                        <Col
                          xs={10}
                          md={6}
                          xl={4}
                          className="d-flex flex-column justify-content-center"
                        >
                          <h5 className="text-capitalize mb-4">
                            Predicted:{" "}
                            <span className="fw-bolder text-success">
                              {classLabels[classification.class_idx]}
                            </span>
                          </h5>
                          <h5>Probabilities</h5>
                          {classification.probabilities.map((prob, index) => (
                            <p key={index} className="mb-1">
                              <span className="fw-bolder text-capitalize">
                                {classLabels[index]}
                              </span>
                              : {(prob * 100).toFixed(2)}%
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
      )}
    </Container>
  );
};

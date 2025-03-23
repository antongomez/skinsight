import React from "react";
import { Container, Navbar } from "react-bootstrap";

export const Header = () => {
  return (
    <Navbar
      bg="dark"
      data-bs-theme="dark"
      className="border-bottom border-1 border-light"
    >
      <Container>
        <Navbar.Brand href="#">
          <img
            alt=""
            src="/logo.svg"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
          SkinSight
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

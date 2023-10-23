import React from "react";

import { useSiteMetadata } from "hooks";

import Container from "components/Container";

const Footer = () => {
  const { authorName, authorUrl } = useSiteMetadata();

  return (
    <footer>
      <Container>
        <p>
          &copy; {new Date().getFullYear()},{" "}
          <a href={authorUrl}>Group GD</a>
          <a href='https://disease.sh/docs/#/'> Data</a>
        </p>
      </Container>
    </footer>
  );
};

export default Footer;

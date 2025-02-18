import React from "react";
import styled from "styled-components";

export default function FullButton({ title, action, border, href }) {
  return href ? (
    <StyledLink className="animate pointer radius8" href={href} border={border}>
      {title}
    </StyledLink>
  ) : (
    <Wrapper
      className="animate pointer radius8"
      onClick={action ? () => action() : null}
      border={border}
    >
      {title}
    </Wrapper>
  );
}

const BaseStyle = `
  display: inline-block;
  text-align: center;
  text-decoration: none;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  width: 100%;
  padding: 15px;
  outline: none;
  color: var(--text-color);
  cursor: pointer;
  transition: 0.3s;

  :hover {
    background-color: var(--hover-bg);
    border-color: #dd841a;
    color: var(--hover-text);
  }
`;

const Wrapper = styled.button`
  ${BaseStyle}
  --border-color: ${(props) => (props.border ? "#707070" : "#0F172A")};
  --bg-color: ${(props) => (props.border ? "transparent" : "#0F172A")};
  --text-color: ${(props) => (props.border ? "#707070" : "#fff")};
  --hover-bg: ${(props) => (props.border ? "transparent" : "#dd841a")};
  --hover-text: ${(props) => (props.border ? "#dd841a" : "#fff")};
`;

const StyledLink = styled.a`
  ${BaseStyle}
  --border-color: ${(props) => (props.border ? "#707070" : "#0F172A")};
  --bg-color: ${(props) => (props.border ? "transparent" : "#0F172A")};
  --text-color: ${(props) => (props.border ? "#707070" : "#fff")};
  --hover-bg: ${(props) => (props.border ? "transparent" : "#dd841a")};
  --hover-text: ${(props) => (props.border ? "#dd841a" : "#fff")};
`;


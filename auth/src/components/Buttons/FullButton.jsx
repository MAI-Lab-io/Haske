import React from "react";
import styled from "styled-components";

export default function FullButton({ title, action, border }) {
  return (
    <Wrapper
      className="animate pointer radius8"
      onClick={action ? () => action() : null}
      border={border}
    >
      {title}
    </Wrapper>
  );
}

const Wrapper = styled.button`
  border: 1px solid ${(props) => (props.border ? "#707070" : "#dd841a")}; /* Mid Orange */
  background-color: ${(props) => (props.border ? "transparent" : "#dd841a")}; /* Mid Orange */
  width: 100%;
  padding: 15px;
  outline: none;
  color: ${(props) => (props.border ? "#707070" : "#fff")};
  :hover {
    background-color: ${(props) => (props.border ? "transparent" : "#FFAC1C")}; /* Bright Orange */
    border: 1px solid #dd841a; /* Mid Orange */
    color: ${(props) => (props.border ? "#dd841a" : "#fff")};
  }
`;

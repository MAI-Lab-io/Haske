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
  border: 1px solid ${(props) => (props.border ? "#707070" : "#0F172A")}; /* Deep blue */
  background-color: ${(props) => (props.border ? "transparent" : "#0F172A")}; /* Deep Blue*/
  width: 100%;
  padding: 15px;
  outline: none;
  color: ${(props) => (props.border ? "#707070" : "#fff")};
  :hover {
    background-color: ${(props) => (props.border ? "transparent" : "#dd841a")}; /* Mid orange */
    border: 1px solid #dd841a; /* Mid Orange */
    color: ${(props) => (props.border ? "#dd841a" : "#fff")};
  }
`;

import React from "react";
import styled from "styled-components";

export default function ProjectBox({ metric, title, text, action }) {
  return (
    <Wrapper>
      <MetricCard className="animate pointer" onClick={action ? () => action() : null}>
        <MetricValue className="font40 extraBold">{metric}</MetricValue>
        <h3 className="font20 extraBold">{title}</h3>
        <p className="font13">{text}</p>
      </MetricCard>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  margin-top: 30px;
  text-align: center;
`;

const MetricCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const MetricValue = styled.div`
  font-size: 40px;
  font-weight: bold;
  color: #0F172A;
  margin-bottom: 10px;
`;

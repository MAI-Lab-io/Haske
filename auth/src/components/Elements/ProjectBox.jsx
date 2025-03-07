import React, { useState } from "react";
import styled from "styled-components";
import CountUp from "react-countup";
import { InView } from "react-intersection-observer"; // Import InView

export default function ProjectBox({ metric, title, text, action, suffix, prefix }) {
  const [isInView, setIsInView] = useState(false); // State to track if the component is in view

  return (
    <InView triggerOnce={true} onChange={(inView) => setIsInView(inView)}>
      {({ ref }) => (
        <Wrapper ref={ref}>
          <MetricCard className="animate pointer" onClick={action ? () => action() : null}>
            <MetricValue className="font40 extraBold">
              {prefix} {/* Add prefix (e.g., "$") */}
              {isInView ? ( // Only animate when in view
                <CountUp end={metric} duration={2.5} separator="," suffix={suffix} />
              ) : (
                <span>0{suffix}</span> // Default value before animation
              )}
            </MetricValue>
            <h3 className="font20 extraBold">{title}</h3>
            <p className="font13">{text}</p>
          </MetricCard>
        </Wrapper>
      )}
    </InView>
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add shadow */
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Enhance shadow on hover */
  }
`;

const MetricValue = styled.div`
  font-size: 40px;
  font-weight: bold;
  color: #0F172A;
  margin-bottom: 10px;
`;

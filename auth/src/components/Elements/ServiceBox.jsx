import React from "react";
import styled from "styled-components";
import ImagingIcon from "../../assets/img/imaging.png";
import DiagnosisIcon from "../../assets/img/diagnosis.png";
import CloudComputingIcon from "../../assets/img/cloud-computing.png";
import CostEffectiveIcon from "../../assets/img/cost-effective.png";

export default function ServiceBox({ icon, title, subtitle }) {
  let getIcon;

  switch (icon) {
    case "imaging":
      getIcon = <IconImage src={ImagingIcon} alt="imaging Icon" />;
      break;
    case "diagnosis":
      getIcon = <IconImage src={DiagnosisIcon} alt="diagnosis Icon" />;
      break;
    case "cloud_computing":
      getIcon = <IconImage src={CloudComputingIcon} alt="cloud_computing Icon" />;
      break;
    case "cost_effective":
      getIcon = <IconImage src={CostEffectiveIcon} alt="cost_effective Icon" />;
      break;
    default:
      getIcon = null;
  }

  return (
    <Wrapper className="flex flexColumn">
      <IconStyle>{getIcon}</IconStyle>
      <TitleStyle className="font20 extraBold">{title}</TitleStyle>
      <SubtitleStyle className="font15">{subtitle}</SubtitleStyle>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  text-align: center;
`;

const IconStyle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px; /* Fixed height for the icon container */
  margin-bottom: 20px; /* Adjust spacing as needed */
`;

const IconImage = styled.img`
  width: auto; /* Allow width to adjust based on height */
  height: 100%; /* Stretch to match the container height */
  max-width: 100%; /* Ensure the icon doesn't overflow */
  object-fit: cover; /* Stretch the icon to fill the container */
  aspect-ratio: 5 / 4; /* Force a square aspect ratio */
`;

const TitleStyle = styled.h2`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 20px 0; /* Adjust padding as needed */
  @media (max-width: 860px) {
    padding: 10px 0;
  }
`;

const SubtitleStyle = styled.p`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
`;

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
`;

const IconImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover; /* Ensures uniform scaling */
`;

const IconStyle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
`;

const TitleStyle = styled.h2`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 40px 0;
  @media (max-width: 860px) {
    padding: 20px 0;
  }
`;

const SubtitleStyle = styled.p`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
`;

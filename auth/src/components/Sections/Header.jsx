import React from "react";
import styled, { keyframes } from "styled-components";
// Components
import FullButton from "../Buttons/FullButton";
// Assets
import HeaderImage from "../../assets/img/header-imgg.png";
import QuotesIcon from "../../assets/svg/Quotes";
import Dots from "../../assets/svg/Dots";

export default function Header() {
  return (
    <Wrapper id="home" className="container flexSpaceCenter">
      <LeftSide className="flexCenter">
        <div>
          <h1 className="extraBold font60">
            Open AI-enabled Teleradiology for the developing world.
          </h1>
          <HeaderP className="font15 semiBold">
            Haske: an open-source, AI-powered PACS platform designed to revolutionize radiology in low-resource settings like Nigeria. With cloud-based accessibility and FHIR compliance, Haske offers a cost-effective solution for seamless image management and AI-driven diagnostics.
          </HeaderP>
          <BtnWrapper>
            <FullButton title="Get Started" href="/register" />
          </BtnWrapper>
        </div>
      </LeftSide>
      <RightSide>
        <ImageWrapper>
          <Img className="radius8 floating" src={HeaderImage} alt="office" style={{ zIndex: 9 }} />
          <TechOverlay />
          <DotsWrapper>
            <Dots />
          </DotsWrapper>
        </ImageWrapper>
        <GradientDiv className="whiteGradient"></GradientDiv>
      </RightSide>
    </Wrapper>
  );
}

// Floating animation for the image
const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
`;

const Wrapper = styled.section`
  padding-top: 80px;
  width: 100%;
  min-height: 840px;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ffffff, #E5E7EB); /* White gradient background */
  color: #0F172A; /* Blue text color */
  @media (max-width: 960px) {
    flex-direction: column;
    text-align: center;
  }
`;

const LeftSide = styled.div`
  width: 50%;
  height: 100%;
  @media (max-width: 960px) {
    width: 100%;
    order: 2;
    margin: 50px 0;
  }
  @media (max-width: 560px) {
    margin: 80px 0 50px 0;
  }
`;

const RightSide = styled.div`
  width: 50%;
  height: 100%;
  position: relative;
  @media (max-width: 960px) {
    width: 100%;
    order: 1;
    margin-top: 30px;
  }
`;

const HeaderP = styled.p`
  max-width: 470px;
  padding: 15px 0 50px 0;
  line-height: 1.8rem;
  color: #334155; /* Slightly lighter blue for paragraph text */
  @media (max-width: 960px) {
    padding: 15px 0 50px 0;
    text-align: center;
    max-width: 100%;
  }
`;

const BtnWrapper = styled.div`
  max-width: 190px;
  @media (max-width: 960px) {
    margin: 0 auto;
  }
`;

const GradientDiv = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(240, 244, 248, 0.8)); /* White gradient overlay */
  @media (max-width: 960px) {
    display: none;
  }
`;

const ImageWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
  z-index: 9;
  @media (max-width: 960px) {
    width: 100%;
    justify-content: center;
  }
`;

const Img = styled.img`
  width: 100%;
  max-width: 1000px;
  height: 600px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2); /* Subtle blue shadow */
  animation: ${float} 6s ease-in-out infinite;
  @media (max-width: 960px) {
    width: 70%;
    max-width: 350px;
  }
  @media (max-width: 560px) {
    width: 80%;
    max-width: 300px;
  }
`;

const TechOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.6), rgba(240, 244, 248, 0.6)); /* White gradient overlay */
  border-radius: 12px;
  z-index: 10;
`;

const DotsWrapper = styled.div`
  position: absolute;
  right: -100px;
  bottom: 100px;
  z-index: 2;
  @media (max-width: 960px) {
    right: 100px;
  }
  @media (max-width: 560px) {
    display: none;
  }
`;

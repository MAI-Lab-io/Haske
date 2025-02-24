import React from "react";
import styled, { keyframes } from "styled-components";
// Components
import FullButton from "../Buttons/FullButton";
// Assets
import HeaderImage from "../../assets/img/header-imgg.png";
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
        <Img className="floating" src={HeaderImage} alt="office" />
        <DotsWrapper>
          <Dots />
        </DotsWrapper>
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
  background: #F9FAFB;
  color: #0f172a; /* Blue text color */
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
  color: #0f172a; /* Blue text color */
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

const Img = styled.img`
  width: 130%;
  max-width: 1600px;
  height: auto;
  animation: ${float} 6s ease-in-out infinite;
  position: relative;
  top: 0;
  right: 90;
  z-index: 1;
  @media (max-width: 960px) {
    width: 80%;
    max-width: 400px;
    position: relative;
    right: auto;
  }
  @media (max-width: 560px) {
    width: 90%;
    max-width: 300px;
  }
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

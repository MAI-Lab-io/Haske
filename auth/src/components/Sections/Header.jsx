import React from "react";
import styled from "styled-components";
// Components
import FullButton from "../Buttons/FullButton";
// Assets
import HeaderImage from "../../assets/img/header-img.png";
import Dots from "../../assets/svg/Dots";

export default function Header() {
  return (
    <Wrapper id="home" className="container flexSpaceCenter">
      <LeftSide className="flexCenter">
        <Content>
          <Title className="extraBold font60">
            Open AI-enabled Teleradiology for the developing world.
          </Title>
          <Description className="font13 semiBold">
            Haske: an open-source, AI-powered PACS platform designed to revolutionize radiology in low-resource settings like Nigeria. With cloud-based accessibility and FHIR compliance,
            Haske offers a cost-effective solution for seamless image management and AI-driven diagnostics.
          </Description>
          <BtnWrapper>
            <FullButton title="Get Started" />
          </BtnWrapper>
        </Content>
      </LeftSide>
      <RightSide>
        <ImageWrapper>
          <Img className="radius8" src={HeaderImage} alt="office" />
          <DotsWrapper>
            <Dots />
          </DotsWrapper>
        </ImageWrapper>
        <GreyDiv />
      </RightSide>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  padding-top: 80px;
  width: 100%;
  min-height: 840px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  @media (max-width: 960px) {
    flex-direction: column;
    text-align: center;
  }
`;

const LeftSide = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 960px) {
    width: 100%;
    margin-top: 50px;
  }
`;

const Content = styled.div`
  max-width: 470px;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
  color: #333;
`;

const Description = styled.p`
  line-height: 1.7rem;
  color: #666;
  margin-bottom: 40px;
`;

const BtnWrapper = styled.div`
  max-width: 190px;
  margin: 0 auto;
  @media (max-width: 960px) {
    width: 80%;
  }
`;

const RightSide = styled.div`
  width: 50%;
  height: 100%;
  position: relative;
  @media (max-width: 960px) {
    width: 100%;
    margin-top: 30px;
  }
`;

const GreyDiv = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(180deg, #5b617a, #43495d);
  z-index: 1;
  @media (max-width: 960px) {
    display: none;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
  z-index: 9;
`;

const Img = styled.img`
  width: 100%;
  max-width: 1000px;
  height: auto;
  border-radius: 8px;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
  @media (max-width: 960px) {
    width: 70%;
    max-width: 350px;
  }
  @media (max-width: 560px) {
    width: 80%;
    max-width: 300px;
  }
`;

const DotsWrapper = styled.div`
  position: absolute;
  right: -100px;
  bottom: 100px;
  z-index: 2;
  @media (max-width: 960px) {
    right: 50px;
    bottom: 80px;
  }
  @media (max-width: 560px) {
    display: none;
  }
`;

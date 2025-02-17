import React from "react";
import styled from "styled-components";
// Components
import FullButton from "../Buttons/FullButton";
// Assets
import HeaderImage from "../../assets/img/header-img.png";
import QuotesIcon from "../../assets/svg/Quotes";
import Dots from "../../assets/svg/Dots";
import BackgroundVideo from "../../assets/background-video.mp4"; // Ensure this path is correct

export default function Header() {
  return (
    <Wrapper id="home" className="container flexSpaceCenter">
      <VideoBackground>
        <video autoPlay loop muted>
          <source src={BackgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </VideoBackground>
      <LeftSide className="flexCenter">
        <div>
          <h1 className="extraBold font60">Open AI-enabled Teleradiology for the developing world.</h1>
          <HeaderP className="font13 semiBold">
            Haske: an open-source, AI-powered PACS platform designed to revolutionize radiology in low-resource settings like Nigeria. With cloud-based accessibility and FHIR compliance,
            Haske offers a cost-effective solution for seamless image management and AI-driven diagnostics.
          </HeaderP>
          <BtnWrapper>
            <FullButton title="Get Started" />
          </BtnWrapper>
        </div>
      </LeftSide>
      <RightSide>
        <ImageWrapper>
          <Img className="radius8" src={HeaderImage} alt="office" style={{ zIndex: 9 }} />
          <DotsWrapper>
            <Dots />
          </DotsWrapper>
        </ImageWrapper>
        <GreyDiv className="lightBg"></GreyDiv>
      </RightSide>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  position: relative;
  padding-top: 80px;
  width: 100%;
  min-height: 840px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const LeftSide = styled.div`
  width: 50%;
  height: 100%;
  color: white;
  @media (max-width: 960px) {
    width: 100%;
    order: 2;
    margin: 50px 0;
    text-align: center;
  }
  @media (max-width: 560px) {
    margin: 80px 0 50px 0;
  }
`;

const RightSide = styled.div`
  width: 50%;
  height: 100%;
  position: relative;
  color: white;
  @media (max-width: 960px) {
    width: 100%;
    order: 1;
    margin-top: 30px;
  }
`;

const HeaderP = styled.div`
  max-width: 470px;
  padding: 15px 0 50px 0;
  line-height: 1.5rem;
  @media (max-width: 960px) {
    text-align: center;
    max-width: 100%;
  }
`;

const BtnWrapper = styled.div`
  max-width: 190px;
  margin-top: 20px;
  @media (max-width: 960px) {
    margin: 20px auto;
  }
`;

const GreyDiv = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 5;
  background: linear-gradient(180deg, rgba(91, 97, 122, 0.7), rgba(67, 73, 93, 0.7));
  backdrop-filter: blur(10px);
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
    justify-content: center;
  }
`;

const Img = styled.img`
  width: 100%;
  max-width: 1000px;
  height: 600px;
  object-fit: cover;
  border-radius: 8px;
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
    right: 100px;
  }
  @media (max-width: 560px) {
    display: none;
  }
`;

const VideoBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  filter: blur(8px);
  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
  }
`;

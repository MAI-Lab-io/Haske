import React from "react";
import Slider from "react-slick";
import styled from "styled-components";
// Assets
import sponsor1 from "../../assets/sponsor1.png";
import sponsor2 from "../../assets/sponsor2.png";
import sponsor3 from "../../assets/sponsor3.png";
import sponsor4 from "../../assets/sponsor4.png";
import sponsor5 from "../../assets/sponsor5.png";

export default function ClientSlider() {
  const settings = {
    infinite: true,
    speed: 600,
    slidesToShow: 6,
    slidesToScroll: 1,
    arrows: false,
    centerMode: true,
    centerPadding: "20px",
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <SliderWrapper>
      <Header>
        <Title>Our Partners & Sponsors</Title>
        <Description>
          We are proud to collaborate with leading organizations and institutions supporting our mission.
        </Description>
      </Header>

      <Slider {...settings}>
        <LogoWrapper>
          <a
            href="https://www.med.upenn.edu/globalhealth/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Upenn"
          >
            <ImgStyle src={sponsor1} alt="Upenn" />
          </a>
        </LogoWrapper>
        <LogoWrapper>
          <a
            href="https://aws.amazon.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit AWS"
          >
            <ImgStyle src={sponsor2} alt="AWS" />
          </a>
        </LogoWrapper>
        <LogoWrapper>
          <a
            href="https://crestviewradiology.org/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit CrestView"
          >
            <ImgStyle src={sponsor3} alt="CrestView" />
          </a>
        </LogoWrapper>
        <LogoWrapper>
          <a
            href="https://lacunafund.org/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Lacuna"
          >
            <ImgStyle src={sponsor4} alt="Lacuna" />
          </a>
        </LogoWrapper>
        <LogoWrapper>
          <a
            href="https://airg.nitda.gov.ng/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit NAIRS"
          >
            <ImgStyle src={sponsor5} alt="NAIRS" />
          </a>
        </LogoWrapper>
      </Slider>
    </SliderWrapper>
  );
}

const SliderWrapper = styled.div`
  margin-top: 50px;
  padding: 0 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: 36px;
  font-weight: bold;
  color: #0b093b;
  margin: 0;
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
  margin-top: 10px;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  cursor: pointer;
  padding: 20px;
  opacity: 0.9;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 0 10px;

  &:hover {
    opacity: 1;
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  :focus-visible {
    outline: none;
  }

  @media (max-width: 768px) {
    height: 120px;
    padding: 15px;
  }
`;

const ImgStyle = styled.img`
  max-height: 80px;
  max-width: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease, filter 0.3s ease;

  &:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
  }
`;

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
    autoplay: true,
    autoplaySpeed: 3000,
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
        <LogoContainer>
          <a href="https://www.med.upenn.edu/globalhealth/" target="_blank" rel="noopener noreferrer" aria-label="Visit Upenn">
            <Logo src={sponsor1} alt="Upenn" />
          </a>
        </LogoContainer>
        <LogoContainer>
          <a href="https://aws.amazon.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit AWS">
            <Logo src={sponsor2} alt="AWS" />
          </a>
        </LogoContainer>
        <LogoContainer>
          <a href="https://crestviewradiology.org/" target="_blank" rel="noopener noreferrer" aria-label="Visit CrestView">
            <Logo src={sponsor3} alt="CrestView" />
          </a>
        </LogoContainer>
        <LogoContainer>
          <a href="https://lacunafund.org/" target="_blank" rel="noopener noreferrer" aria-label="Visit Lacuna">
            <Logo src={sponsor4} alt="Lacuna" />
          </a>
        </LogoContainer>
        <LogoContainer>
          <a href="https://airg.nitda.gov.ng/" target="_blank" rel="noopener noreferrer" aria-label="Visit NAIRS">
            <Logo src={sponsor5} alt="NAIRS" />
          </a>
        </LogoContainer>
      </Slider>
    </SliderWrapper>
  );
}

const SliderWrapper = styled.div`
  margin: 50px auto;
  padding: 0 5%;
  max-width: 1200px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: 36px;
  font-weight: bold;
  color: #0F172A;
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

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  opacity: 0.8;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Logo = styled.img`
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

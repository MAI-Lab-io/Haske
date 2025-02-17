import React from "react";
import Slider from "react-slick";
import styled from "styled-components";
// Assets
import ClientLogo01 from "../../assets/img/clients/logo01.svg";
import ClientLogo02 from "../../assets/img/clients/logo02.svg";
import ClientLogo03 from "../../assets/img/clients/logo03.svg";
import ClientLogo04 from "../../assets/img/clients/logo04.svg";
import ClientLogo05 from "../../assets/img/clients/logo05.svg";
import ClientLogo06 from "../../assets/img/clients/logo06.svg";
import sponsor1 from "../../assets/sponsor1.png";
import sponsor2 from "../../assets/sponsor2.png";
import sponsor3 from "../../assets/sponsor3.png";
import sponsor4 from "../../assets/sponsor4.png";
import sponsor5 from "../../assets/sponsor5.png";

export default function ClientSlider() {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 2,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
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
    <div>
      <Slider {...settings}>
        {/* Sponsors */}
        <LogoWrapper className="flexCenter">
          <a href="https://www.med.upenn.edu/globalhealth/" target="_blank" rel="noopener noreferrer">
            <ImgStyle src={sponsor1} alt="Upenn" />
          </a>
        </LogoWrapper>
        <LogoWrapper className="flexCenter">
          <a href="https://aws.amazon.com/" target="_blank" rel="noopener noreferrer">
            <ImgStyle src={sponsor2} alt="AWS" />
          </a>
        </LogoWrapper>
        <LogoWrapper className="flexCenter">
          <a href="https://crestviewradiology.org/" target="_blank" rel="noopener noreferrer">
            <ImgStyle src={sponsor3} alt="CrestView" />
          </a>
        </LogoWrapper>
        <LogoWrapper className="flexCenter">
          <a href="https://lacunafund.org/" target="_blank" rel="noopener noreferrer">
            <ImgStyle src={sponsor4} alt="Lacuna" />
          </a>
        </LogoWrapper>
        <LogoWrapper className="flexCenter">
          <a href="https://airg.nitda.gov.ng/" target="_blank" rel="noopener noreferrer">
            <ImgStyle src={sponsor5} alt="NAIRS" />
          </a>
        </LogoWrapper>

       
      </Slider>
    </div>
  );
}

const LogoWrapper = styled.div`
  width: 100%;
  height: 100px;
  cursor: pointer;
  :focus-visible {
    outline: none;
    border: 0px;
  }
`;
const ImgStyle = styled.img`
  width: 100%;
  height: 100%;
  padding: 10%;
`;

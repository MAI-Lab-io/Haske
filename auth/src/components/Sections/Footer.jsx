import React from "react";
import styled from "styled-components";
import { Link } from "react-scroll";
// Assets
import LogoImg from "../../assets/haske.png";

export default function Contact() {

  const getCurrentYear = () => {
    return new Date().getFullYear();
  }

  return (
    <Wrapper>
      <div className="darkBg">
        <div className="container">
          <InnerWrapper className="flexSpaceCenter" style={{ padding: "30px 0" }}>
            <Link className="flexCenter animate pointer" to="home" smooth={true} offset={-80}>
              <LogoImage src={LogoImg} alt="Haske Logo" />
              
            </Link>
            <StyleP className="whiteColor font13">
              © {getCurrentYear()} - <span className="orangeColor font13">Haske</span> All Rights Reserved
            </StyleP>

            <Link className="whiteColor animate pointer font13" to="home" smooth={true} offset={-80}>
              Back to top
            </Link>
          </InnerWrapper>
        </div>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
`;

const InnerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 550px) {
    flex-direction: column;
    text-align: center;
  }
`;

const LogoImage = styled.img`
  max-width: 100px;
`;

const StyleP = styled.p`
  font-size: 13px;
  margin: 0;
  @media (max-width: 550px) {
    margin: 20px 0;
  }
`;

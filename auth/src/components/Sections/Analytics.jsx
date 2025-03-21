import React from "react";
import styled from "styled-components";
// Components
import ProjectBox from "../Elements/ProjectBox";
import FullButton from "../Buttons/FullButton";
// Assets
import AddImage2 from "../../assets/img/add/add2.png";

export default function Analytics() {
  return (
    <Wrapper id="analytics">
      <div className="whiteBg">
        <div className="container">
          <HeaderInfo>
            <h1 className="font40 extraBold">Analytics</h1>
            <p className="font13">
              View key metrics and insights from our ongoing efforts and growth. 
              We are proud of our journey in scaling up the platform's impact.
            </p>
          </HeaderInfo>
          <div className="row textCenter">
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                metric={150} // Pass a number
                title="Institutions Deployed"
                text="Currently deployed in over 150 institutions globally."
                action={() => alert("clicked")}
                suffix="+" // Add "+" suffix
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                metric={2} // Pass a number
                title="Total Images Processed"
                text="We've processed over 2 million images across various platforms."
                action={() => alert("clicked")}
                suffix="M+" // Add "M+" suffix
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                metric={10} // Pass a number
                title="Total Active Regions"
                text="Currently operational in 10 active regions worldwide."
                action={() => alert("clicked")}
                suffix="+" // Add "+" suffix
              />
            </div>
          </div>
          <div className="row textCenter">
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                metric={30} // Pass a number
                title="Users Engaged"
                text="Over 30,000 active users engaging daily with our platform."
                action={() => alert("clicked")}
                suffix="K+" // Add "K+" suffix
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                metric={500} // Pass a number
                title="Images Uploaded Monthly"
                text="On average, over 500,000 images are uploaded monthly."
                action={() => alert("clicked")}
                suffix="K+" // Add "K+" suffix
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <ProjectBox
                metric={99.9} // Pass a number
                title="Platform Uptime"
                text="Our platform boasts 99.9% uptime, ensuring seamless access."
                action={() => alert("clicked")}
                suffix="%" // Add "%" suffix
              />
            </div>
          </div>
          
        </div>
      </div>
      <div className="lightBg">
        <div className="container">
          <Advertising className="flexSpaceCenter">
            <AddLeft>
              <AddLeftInner>
                <ImgWrapper className="flexCenter">
                  <img className="radius8" src={AddImage2} alt="add" />
                </ImgWrapper>
              </AddLeftInner>
            </AddLeft>
            <AddRight>
              <h4 className="font15 semiBold">A few words about us</h4>
              <h2 className="font40 extraBold">Medical Artificial Intelligence Laboratory (MAI Lab) </h2>
              <p className="font12">
                MAI Lab aims to enable the rapid adoption of AI solutions in resource-limited clinics in Africa by addressing gaps in AI infrastructure, capacity, and policy to improve health outcomes.
                Our holistic approach tackles complex AI challenges in healthcare by strengthening the entire AI ecosystem in Africa.
              </p>
              <ButtonsRow className="flexNullCenter" style={{ margin: "30px 0" }}>
                <div style={{ width: "190px" }}>
                  <a href="https://mailab.io/" style={{ textDecoration: "none" }}>
                    <FullButton title="Learn More" />
                  </a>
                </div>
                <div style={{ width: "190px", marginLeft: "15px" }}>
                  <a href="https://mailab.io/contact-us/" style={{ textDecoration: "none" }}>
                    <FullButton title="Contact Us" border />
                  </a>
                </div>
              </ButtonsRow>
            </AddRight>
          </Advertising>
        </div>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  width: 100%;
`;
const HeaderInfo = styled.div`
  @media (max-width: 860px) {
    text-align: center;
  }
`;
const Advertising = styled.div`
  padding: 100px 0;
  margin: 100px 0;
  position: relative;
  @media (max-width: 1160px) {
    padding: 60px 0 40px 0;
  }
  @media (max-width: 860px) {
    flex-direction: column;
    padding: 0 0 30px 0;
    margin: 80px 0 0px 0;
  }
`;
const ButtonsRow = styled.div`
  @media (max-width: 860px) {
    justify-content: space-between;
  }
`;
const AddLeft = styled.div`
  position: relative;
  width: 50%;
  p {
    max-width: 475px;
  }
  @media (max-width: 860px) {
    width: 80%;
    order: 2;
    text-align: center;
    h2 {
      line-height: 3rem;
      margin: 15px 0;
    }
    p {
      margin: 0 auto;
    }
  }
`;
const AddRight = styled.div`
  width: 50%;
  @media (max-width: 860px) {
    width: 80%;
    order: 2;
  }
`;
const AddLeftInner = styled.div`
  width: 100%;
  position: absolute;
  top: -300px;
  left: 0;
  @media (max-width: 1190px) {
    top: -250px;
  }
  @media (max-width: 920px) {
    top: -200px;
  }
  @media (max-width: 860px) {
    order: 1;
    position: relative;
    top: -60px;
    left: 0;
  }
`;
const ImgWrapper = styled.div`
  width: 100%;
  padding: 0 15%;
  img {
    width: 100%;
    height: auto;
  }
  @media (max-width: 400px) {
    padding: 0;
  }
`;

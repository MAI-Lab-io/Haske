import React from "react";
import styled from "styled-components";
// Components
import BlogBox from "../Elements/BlogBox";
import FullButton from "../Buttons/FullButton";
import TestimonialSlider from "../Elements/TestimonialSlider";

export default function Blog() {
  return (
    <Wrapper id="blog">
      <div className="whiteBg">
        <div className="container">
          <HeaderInfo>
            <h1 className="font40 extraBold">Our Impacts</h1>
            <p className="font13">
              Our Current and Proposed sites of deployments.
              <br />
            </p>
          </HeaderInfo>
          <div className="row textCenter">
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
    <BlogBox
        title="Crestview Radiology, Igbogbi"
        text="National Orthopaedic Hospital Crestview Place 120/124 Ikorodu Road, Onipanu Igbobi, Lagos, Nigeria."
        tag="company"
        author="Deployed 2 months ago"
        action={() => window.open("https://crestviewradiology.org/", "_blank")} // Open URL in a new tab
    />
</div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <BlogBox
                title="Crestview Radiology, VI"
                text="302A, Jide Oki Street, Off Ligali Ayorinde Street, Victoria Island, Lagos Nigeria"
                tag="company"
                author="Proposed Site"
                action={() => alert("clicked")}
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <BlogBox
                title="Crestview Radiology, Ikeja"
                text="Ground Floor, Aviation Plaza,
Opposite LASUTH
Ikeja,
Lagos, Nigeria."
                tag="company"
                author="Proposed Site"
                action={() => alert("clicked")}
              />
            </div>
          </div>
          <div className="row textCenter">
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <BlogBox
                title="Crestview Radiology, Ilorin"
                text="University of Ilorin Teaching Hospital
Crestview Place
Old Jebba Road,
Oke – Ose,
Ilorin,
Kwara, Nigeria."
                tag="company"
                author="Luke Skywalker, 2 days ago"
                action={() => alert("clicked")}
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <BlogBox
                title="New Office!"
                text="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor."
                tag="company"
                author="Proposed Site"
                action={() => alert("clicked")}
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
              <BlogBox
                title="New Office!"
                text="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor."
                tag="company"
                author="Proposed Site"
                action={() => alert("clicked")}
              />
            </div>
          </div>
          <div className="row flexCenter">
            <div style={{ margin: "50px 0", width: "200px" }}>
              <FullButton title="Load More" action={() => alert("clicked")} />
            </div>
          </div>
        </div>
      </div>
      <div className="darkBg" style={{padding: '50px 0'}}>
        <div className="container">
          <HeaderInfo>
            <h1 className="font40 extraBold">What They Say?</h1>
            <p className="font15">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
              <br />
              labore et dolore magna aliquyam erat, sed diam voluptua.
            </p>
          </HeaderInfo>
          <TestimonialSlider />
        </div>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  width: 100%;
  padding-top: 20px;
`;

const HeaderInfo = styled.div`
  margin-bottom: 30px;
  color: #0F172A; /* Ensures text inside HeaderInfo is white */
  
  @media (max-width: 860px) {
    text-align: center;
  }
`;

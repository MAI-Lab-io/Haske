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
      <div className="lightBg">
        <div className="container">
          <HeaderInfo>
            <h1 className="font40 extraBold">We’d Love to Partner with You</h1>
            <p className="font13">
              At Haske, we are actively seeking institutions interested in integrating advanced digital imaging solutions. 
              If you would like to explore how Haske can support your institution, or if you're interested in a partnership, 
              please get in touch with us.
            </p>
            <p className="font13">
              Do you currently use digitizers or any form of digital imaging tools in your facility? If so, we would love to hear 
              about the tools you use and how we might be able to enhance your current setup with Haske.
            </p>
          </HeaderInfo>
          <div className="row" style={{ paddingBottom: "30px" }}>
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
              <Form>
                <label className="font13">Institution Name:</label>
                <input type="text" id="institution" name="institution" className="font20 extraBold" />
                
                <label className="font13">Contact Person's Full Name:</label>
                <input type="text" id="contact" name="contact" className="font20 extraBold" />
                
                <label className="font13">Email Address:</label>
                <input type="email" id="email" name="email" className="font20 extraBold" />
                
                <label className="font13">Are you currently using any digital imaging tools or digitizers in your institution?</label>
                <textarea rows="4" cols="50" type="text" id="tools" name="tools" className="font20 extraBold" placeholder="Please provide details of the tools you currently use." />

                <label className="font13">Inquiry/Request Details:</label>
                <textarea rows="6" cols="50" type="text" id="inquiry" name="inquiry" className="font20 extraBold" placeholder="Please describe your inquiry or request for partnership." />
              </Form>
              <SumbitWrapper className="flex">
                <ButtonInput type="submit" value="Submit Inquiry" className="pointer animate radius8" style={{ maxWidth: "220px" }} />
              </SumbitWrapper>
            </div>
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 flex">
              <div style={{ width: "50%" }} className="flexNullCenter flexColumn">
                <ContactImgBox>
                  <img src={ContactImg1} alt="office" className="radius6" />
                </ContactImgBox>
                <ContactImgBox>
                  <img src={ContactImg2} alt="office" className="radius6" />
                </ContactImgBox>
              </div>
              <div style={{ width: "50%" }}>
                <div style={{ marginTop: "100px" }}>
                  <img src={ContactImg3} alt="office" className="radius6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterWrapper>
        <div className="container">
          <InnerWrapper className="flexSpaceCenter" style={{ padding: "30px 0" }}>
            <Link className="flexCenter animate pointer" to="home" smooth={true} offset={-80}>
              <LogoImg />
              <h1 className="font15 extraBold whiteColor" style={{ marginLeft: "15px" }}>
                Haske
              </h1>
            </Link>
            <StyleP className="whiteColor font13">
              © {getCurrentYear()} - <span className="purpleColor font13">Haske</span> All Rights Reserved
            </StyleP>

            <Link className="whiteColor animate pointer font13" to="home" smooth={true} offset={-80}>
              Back to top
            </Link>
          </InnerWrapper>
        </div>
      </FooterWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.section`
  width: 100%;
`;
const HeaderInfo = styled.div`
  padding: 70px 0 30px 0;
  @media (max-width: 860px) {
    text-align: center;
  }
`;
const Form = styled.form`
  padding: 70px 0 30px 0;
  input,
  textarea {
    width: 100%;
    background-color: transparent;
    border: 0px;
    outline: none;
    box-shadow: none;
    border-bottom: 1px solid #707070;
    height: 30px;
    margin-bottom: 30px;
  }
  textarea {
    min-height: 100px;
  }
  @media (max-width: 860px) {
    padding: 30px 0;
  }
`;
const ButtonInput = styled.input`
  border: 1px solid #7620ff;
  background-color: #7620ff;
  width: 100%;
  padding: 15px;
  outline: none;
  color: #fff;
  :hover {
    background-color: #580cd2;
    border: 1px solid #7620ff;
    color: #fff;
  }
  @media (max-width: 991px) {
    margin: 0 auto;
  }
`;
const ContactImgBox = styled.div`
  max-width: 180px; 
  align-self: flex-end; 
  margin: 10px 30px 10px 0;
`;
const SumbitWrapper = styled.div`
  @media (max-width: 991px) {
    width: 100%;
    margin-bottom: 50px;
  }
`;

const FooterWrapper = styled.div`
  background-color: #262626;
  padding: 30px 0;
`;

const InnerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 550px) {
    flex-direction: column;
  }
`;

const StyleP = styled.p`
  @media (max-width: 550px) {
    margin: 20px 0;
  }
`;

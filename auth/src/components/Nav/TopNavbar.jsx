import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-scroll";
// Components
import Sidebar from "../Nav/Sidebar";
import Backdrop from "../Elements/Backdrop";
// Assets
import LogoIcon from "../../assets/haske.png";
import BurgerIcon from "../../assets/svg/BurgerIcon";

export default function TopNavbar() {
  const [y, setY] = useState(window.scrollY);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scroll event handler
  const handleScroll = () => setY(window.scrollY);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      {sidebarOpen && <Backdrop toggleSidebar={setSidebarOpen} />}
      <Wrapper
        className="flexCenter animate"
        style={y > 100 ? { height: "60px" } : { height: "80px" }}
      >
        <NavInner className="container flexSpaceCenter">
          <Link className="pointer flexNullCenter" to="home" smooth={true}>
            <img src={LogoIcon} alt="Logo" style={{ height: "40px" }} />
          </Link>
          <BurgerWrapper className="pointer" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <BurgerIcon />
          </BurgerWrapper>
          <UlWrapper className="flexNullCenter">
            {["home", "services", "analytics", "blog", "contact"].map((item) => (
              <li key={item} className="semiBold font15 pointer">
                <Link
                  activeClass="active"
                  style={{ padding: "10px 15px" }}
                  to={item}
                  spy={true}
                  smooth={true}
                  offset={-80}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Link>
              </li>
            ))}
          </UlWrapper>
          <UlWrapperRight className="flexNullCenter">
            <li className="semiBold font15 pointer">
              <a href="/signin" style={{ padding: "10px 30px 10px 0" }}>Log in</a>
            </li>
           <li className="semiBold font15 pointer flexCenter">
              <a href="/register" className="radius8 lightBg" style={{ padding: "10px 15px", color: "#0F172A" }}>
                Get Started
              </a>
            </li>
          </UlWrapperRight>
        </NavInner>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.nav`
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  background: linear-gradient(90deg,  #ffffff 0%,  #E5E7EB 0%, #0F172A 75%);
  transition: background 0.3s ease-in-out;
`;



const NavInner = styled.div`
  position: relative;
  height: 100%;
`;

const BurgerWrapper = styled.button`
  outline: none;
  border: 0;
  background-color: transparent;
  height: 100%;
  padding: 0 15px;
  display: none;
  @media (max-width: 760px) {
    display: block;
  }
`;

const UlWrapper = styled.ul`
  display: flex;
  @media (max-width: 760px) {
    display: none;
  }
`;

const UlWrapperRight = styled.ul`
  @media (max-width: 760px) {
    display: none;
  }
`;

import React from "react";
import styled from "styled-components";
import { Link } from "react-scroll";
// Assets
import CloseIcon from "../../assets/svg/CloseIcon";
import LogoIcon from "../../assets/haske.png";

export default function Sidebar({ sidebarOpen, toggleSidebar }) {
  return (
    <Wrapper sidebarOpen={sidebarOpen}>
      <SidebarHeader>
        <div className="logo-container">
          <img src={LogoIcon} alt="logo" className="logo" />
          <h1 className="whiteColor">Haske</h1>
        </div>
        <CloseBtn 
          onClick={() => toggleSidebar(!sidebarOpen)} 
          className="animate pointer" 
          aria-label="Close Sidebar"
        >
          <CloseIcon />
        </CloseBtn>
      </SidebarHeader>

      <NavLinks>
        {["home", "services", "analytics", "blog", "contact"].map((item) => (
          <li key={item}>
            <Link
              onClick={() => toggleSidebar(!sidebarOpen)}
              activeClass="active"
              className="whiteColor"
              to={item}
              spy={true}
              smooth={true}
              offset={-60}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          </li>
        ))}
      </NavLinks>

      <AuthLinks>
        <li>
          <a href="/signin" className="whiteColor">Log in</a>
        </li>
        <li>
          <a href="/register" className="radius8 darkBg">Get Started</a>
        </li>
      </AuthLinks>
    </Wrapper>
  );
}

const Wrapper = styled.nav`
  width: 400px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: ${({ sidebarOpen }) => (sidebarOpen ? "0px" : "-400px")};
  background: linear-gradient(180deg, #eff5ff  0%, #0F172A 100%);
  padding: 30px;
  z-index: 9999;
  overflow-y: auto;
  transition: right 0.3s ease-in-out;

  @media (max-width: 400px) {
    width: 100%;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;

  .logo-container {
    display: flex;
    align-items: center;
  }

  .logo {
    width: 40px;
    height: auto;
    margin-right: 15px;
  }

  h1 {
    font-size: 20px;
  }
`;

const CloseBtn = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px;
`;

const NavLinks = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 40px 0;

  li {
    list-style: none;

    a {
      font-size: 15px;
      font-weight: 600;
      padding: 10px 15px;
      display: block;
      color: #eff5ff;
      transition: color 0.3s ease-in-out;

      &:hover {
        color: #FFAC1C;
      }
    }
  }
`;

const AuthLinks = styled.ul`
  display: flex;
  justify-content: space-between;
  padding: 20px 0;

  li {
    list-style: none;

    a {
      font-size: 15px;
      font-weight: 600;
      padding: 10px 15px;
      color: #eff5ff;
      transition: background 0.3s ease-in-out;

      &.radius8 {
        background-color: #FFAC1C;
        border-radius: 8px;
        padding: 10px 15px;
      }

      &:hover {
        background-color: #dd841a;
      }
    }
  }
`;

import styled from "styled-components";
import { theme } from "../../theme";

export const Wrapper = styled.div`
  color: ${theme.colors.textColor4};
  font-size: ${theme.sizes.h4};
  font-weight: 500;
  position: relative;
  .prev,
  .next {
    cursor: pointer;
    position: absolute;
    top: 50%;
    width: auto;
    margin-top: -22px;
    color: ${theme.colors.textColor};
    font-weight: bold;
    font-size: 18px;
    transition: 0.6s ease;
    user-select: none;
    border: none;
    background: ${theme.colors.mainBackground};
  }

  .next {
    right: 8px;
  }

  .intro-img {
    margin: 4px;
  }
  .img1 {
    width: 80px;
    height: 128px;
  }
  .img12 {
    width: 120px;
    height: 170px;
  }
  .img21 {
    width: 114px;
    height: 121px;
  }
  .img22 {
    width: 127px;
    height: 127px;
  }
  .img23 {
    width: 185px;
    height: 181px;
  }
  .imgIntroLogo {
    width: 100px;
    height: 175px;
    display: block;
    margin: 0 auto;
  }
  .slides {
    display: block;
    height: 350px;
    .heading-info {
      text-align: center;
      margin-bottom: 2rem;
    }
    .intro1-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .intro2-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .dot {
    cursor: pointer;
    height: 15px;
    width: 15px;
    margin: 0 2px;
    background: linear-gradient(
      228.17deg,
      rgba(122, 182, 211, 0.4) 0.03%,
      rgba(41, 68, 96, 0.4) 95.55%
    );

    border-radius: 50%;
    display: inline-block;
    transition: background-color 0.6s ease;
  }

  .active,
  .dot:hover {
    background: ${theme.colors.secondaryColor};
  }

  .col-flex {
    display: flex;
    flex-direction: column;
  }
  .action-btn-wrapper {
    padding: 1rem;

    .custom-btn {
      height: 48px;
    }
    .mid-p {
      font-size: ${theme.sizes.h8};
      font-weight: 400;
      margin: 1rem 0;
      text-align: center;
    }
  }

  .fade {
    -webkit-animation-name: fade;
    -webkit-animation-duration: 1.5s;
    animation-name: fade;
    animation-duration: 1.5s;
  }

  @media (min-width: 769px) {
    .img1 {
      width: 100px;
      height: 168px;
    }
    .img12 {
      width: 150px;
      height: 200px;
    }
  }
`;

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Wrapper } from "./styles";
import Button from "../Button";
import Modal from "../Modal";
import useModal from "../useModal";
import { useWindowDimensions } from "../../utils";
import Signup from "../../pages/signup";
import Login from "../../pages/login";

export default function Intro() {
  const {
    ModalContainer: SignupModalContainer,
    isShow: isSignupShow,
    show: showSignup,
    hide: hideSignup,
  } = useModal();
  const {
    ModalContainer: LoginModalContainer,
    isShow: isLoginShow,
    show: showLogin,
    hide: hideLogin,
  } = useModal();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [slideIndex, setSlideIndex] = useState(0);
  const next = () => {
    const nextIndex = slideIndex + 1;
    if (nextIndex > 2) {
      setSlideIndex(0);
    } else {
      setSlideIndex(nextIndex);
    }
  };
  const previous = () => {
    const previousIndex = slideIndex - 1;
    if (previousIndex < 0) {
      setSlideIndex(2);
    } else {
      setSlideIndex(previousIndex);
    }
  };

  const pageHandler = (type) => {
    if (type === "signup" && width > 769) {
      showSignup();
    }
    if (type === "signup" && width < 769) {
      router.push("/signup");
    }
    if (type === "login" && width > 769) {
      showLogin();
    }
    if (type === "login" && width < 769) {
      router.push("/login");
    }
  };

  return (
    <>
      <Wrapper>
        {slideIndex === 0 && (
          <div className="slides fade">
            <p className="heading-info">
              Discover and book unique experiences hosted in your home.
            </p>
            <div className="intro1-wrapper">
              <img
                className="intro-img img1"
                src="/assets/images/intro1_1.png"
                alt="into-1-1-img"
              />
              <img
                className="intro-img img12"
                src="/assets/images/intro1_2.png"
                alt="into-1-2-img"
              />
              <img
                className="intro-img img1"
                src="/assets/images/intro1_3.png"
                alt="into-1-3-img"
              />
            </div>
          </div>
        )}
        {slideIndex === 1 && (
          <div className="slides fade">
            <p className="heading-info">
              Led by experts who bring the entertainment to you.
            </p>
            <div className="intro2-wrapper">
              <div className="col-flex">
                <img
                  className="intro-img img21"
                  src="/assets/images/intro2_1.png"
                  alt="into-2-1-img"
                />
                <img
                  className="intro-img img22"
                  src="/assets/images/intro2_2.png"
                  alt="into-2-2-img"
                />
              </div>
              <img
                className="intro-img img23"
                src="/assets/images/intro2_3.png"
                alt="into-2-3-img"
              />
            </div>
          </div>
        )}
        {slideIndex === 2 && (
          <div className="slides fade">
            <p className="heading-info">
              Join our flock and unlock exclusive interactive experiences.
              StayIn, socialize, support.
            </p>
            <div className="intro3-wrapper">
              <img
                className="intro-img imgIntroLogo"
                src="/assets/images/introLogo.png"
                alt="into-logo-img"
              />
            </div>
          </div>
        )}
        <div style={{ margin: "1rem  0", textAlign: "center" }}>
          <span
            className={slideIndex === 0 ? "dot active" : "dot"}
            onClick={() => setSlideIndex(0)}
          />
          <span
            className={slideIndex === 1 ? "dot active" : "dot"}
            onClick={() => setSlideIndex(1)}
          />
          <span
            className={slideIndex === 2 ? "dot active" : "dot"}
            onClick={() => setSlideIndex(2)}
          />
        </div>
        <div className="action-btn-wrapper">
          <Button onClick={() => pageHandler("signup")} className="custom-btn">
            Sign Up
          </Button>
          <p className="mid-p">Already have an account?</p>
          <Button onClick={() => pageHandler("login")} className="custom-btn">
            Log In
          </Button>
        </div>
        <button className="prev" href onClick={previous}>
          &#10094;
        </button>
        <button className="next" onClick={next}>
          &#10095;
        </button>
      </Wrapper>
      {width > 769 && (
        <>
          <SignupModalContainer isShow={isSignupShow}>
            <Modal type="sideDrawer" isOpen={isSignupShow} close={hideSignup}>
              <Signup />
            </Modal>
          </SignupModalContainer>
          <LoginModalContainer isShow={isLoginShow}>
            <Modal type="sideDrawer" isOpen={isLoginShow} close={hideLogin}>
              <Login />
            </Modal>
          </LoginModalContainer>
        </>
      )}
    </>
  );
}

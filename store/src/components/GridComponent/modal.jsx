import React from "react";
import { Flex } from "@dailykit/ui";
import { ModalDiv } from "./modalStyle";
import ReactPlayer from "react-player";
import { theme } from "../../theme";
import { CrossIcon, ChevronLeft, ChevronRight } from "../Icons";

const Modal = ({ open, close, urls }) => {
  const [showIndex, setShowIndex] = React.useState(0);
  const next = () => {
    if (showIndex === urls.length - 1) {
      setShowIndex(urls.length - 1);
    } else {
      setShowIndex((prev) => prev + 1);
    }
  };
  const previous = () => {
    if (showIndex === 0) {
      setShowIndex(0);
    } else {
      setShowIndex((prev) => prev - 1);
    }
  };

  return (
    <ModalDiv open={open}>
      <div className="div-flex">
        <button onClick={close}>
          <Flex container alignItems="center">
            <CrossIcon size={theme.sizes.h8} color={theme.colors.textColor4} />{" "}
            <span> Close</span>
          </Flex>
        </button>
        <p>
          {showIndex + 1}/{urls.length}
        </p>
      </div>
      <div className="img-show-wrap">
        {urls.map((url, index) => {
          if (showIndex === index && url.type === "image") {
            return (
              <div key={index} className="outter-div">
                <img src={url.path} alt="immg" />;
              </div>
            );
          } else if (showIndex === index && url.type === "video") {
            return (
              <div key={index} className="outter-div">
                <ReactPlayer
                  controls
                  width="100%"
                  height="100%"
                  url={url.path}
                />
              </div>
            );
          }
        })}
        <div className="actionBtn">
          {showIndex > 0 && (
            <button onClick={previous} className="arrowBtn">
              <ChevronLeft
                size={theme.sizes.h8}
                color={theme.colors.textColor4}
              />
            </button>
          )}
          <div className="spacer" />
          {showIndex < urls.length - 1 && (
            <button onClick={next} className="arrowBtn">
              <ChevronRight
                size={theme.sizes.h8}
                color={theme.colors.textColor4}
              />
            </button>
          )}
        </div>
      </div>
    </ModalDiv>
  );
};

export default Modal;

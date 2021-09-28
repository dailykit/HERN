import React, { useEffect } from "react";
import { theme } from "../../theme";
import { CrossIcon } from "../Icons";
import Button from "../Button";
import { ModalDiv } from "./styles";

export default function Modal({
  children,
  type,
  close,
  showActionButton = false,
  disabledActionButton = false,
  actionHandler,
  actionButtonTitle,
  ...props
}) {
  const bottomDrawerStyle = {
    width: "100%",
    height: "100%",
    transform: props.isOpen
      ? "translate3d(0px, 5%, 0px)"
      : "translate3d(0px, 110%, 0px)",
    borderRadius: "50px 50px 0 0",
    boxShadow:
      props.isOpen &&
      "-31px 31px 62px rgba(20, 23, 30, 0.2), -31px -31px 78px rgba(20, 23, 30, 0.9)",
  };
  const sideDrawerStyle = {
    width: "30%",
    height: "780px",
    transform: props.isOpen
      ? "translate3d(0%, 0px, 0px)"
      : "translate3d(200%, 0px, 0px)",
  };

  // useEffect(() => {
  //   if (props.isOpen) {
  //     document.body.scrollTop = "4rem";
  //     document.documentElement.scrollTop = "4rem";
  //     document.body.style.overflowY = "hidden";
  //   } else {
  //     document.body.style.overflowY = "auto";
  //   }
  //   return () => (document.body.style.overflowY = "auto");
  // }, [props.isOpen]);
  return (
    <ModalDiv
      id="modall"
      {...props}
      style={type === "bottomDrawer" ? bottomDrawerStyle : sideDrawerStyle}
    >
      <div className="modal-header">
        <button className="closeBtn" onClick={close}>
          <CrossIcon size="18" color={theme.colors.textColor} />
        </button>
        {showActionButton && (
          <Button
            className="actionBtn"
            disabled={disabledActionButton}
            onClick={actionHandler}
          >
            {actionButtonTitle}
          </Button>
        )}
      </div>
      <div className="modal-body">{children}</div>
    </ModalDiv>
  );
}

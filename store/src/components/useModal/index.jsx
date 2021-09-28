import React, { useCallback } from "react";
import usePortal from "react-cool-portal";
import BackDrop from "../BackDrop";
// Customize your hook based on react-cool-portal
const useModal = (options = {}) => {
  const { Portal, hide, ...rest } = usePortal({
    ...options,
    containerId: "modal-root",
    defaultShow: false,
    internalShowHide: false,
  });

  const ModalContainer = useCallback(
    ({ children, isShow }) => (
      <Portal>
        <BackDrop show={isShow} close={hide}>
          {children}
        </BackDrop>
      </Portal>
    ),
    [hide]
  );

  return { ModalContainer, hide, ...rest };
};

export default useModal;

import styled from "styled-components";

export const ModalDiv = styled.div`
  background: #000;
  contain: content !important;
  height: 100% !important;
  left: 0px !important;
  position: absolute !important;
  z-index: 12;
  top: 0px !important;
  width: 100% !important;
  animation-fill-mode: both !important;
  animation-delay: 0.4s !important;
  animation-duration: 0.3s !important;
  animation-iteration-count: 1 !important;
  animation-timing-function: ease-in-out !important;
  animation-name: keyframe_18jn58a !important;
  transform: ${({ open }) => (open ? "translateY(0%)" : "translateY(-100%)")};
  .div-flex {
    display: flex;
    button {
      cursor: pointer !important;

      position: relative !important;
      text-align: center !important;
      text-decoration: none !important;
      width: auto !important;
      touch-action: manipulation !important;
      font-size: 14px !important;
      line-height: 18px !important;
      font-weight: 600 !important;
      border-radius: 8px !important;
      outline: none !important;
      padding: 8px 16px !important;
      transition: box-shadow 0.2s ease 0s, -ms-transform 0.1s ease 0s,
        transform 0.1s ease 0s, transform 0.1s ease 0s !important;
      background: transparent none repeat scroll 0% 0% !important;
      color: rgb(255, 255, 255) !important;
      border: medium none !important;
      margin-left: 8px !important;
      margin-top: 8px !important;
      &:hover {
        background: rgb(74, 74, 74) none repeat scroll 0% 0% !important;
      }
    }
    p {
      color: #fff;
      flex: 1;
      text-align: center;
      padding-top: 1rem;
    }
  }
  .img-show-wrap {
    padding: 0 24px;
    padding-top: 112px;
    position: relative;
    .outter-div {
      /* border-radius: 8px;
      overflow: hidden !important;
      position: relative !important;
      max-height: 440px !important;
      max-width: 1128px;
      margin: 0 auto; */
      height: 440px !important;
      width: calc(100% - 192px) !important;
      margin: 0px auto !important;
      position: relative !important;
      img {
        object-fit: contain;
        height: 100% !important;
        width: 100% !important;
      }
    }
    @media (min-width: 1128px) {
      padding: 0 80px;
      padding-top: 112px;
    }
    @media (min-width: 950px) {
      padding: 0 40px;
      padding-top: 112px;
    }
    @media (min-width: 744px) {
      padding: 0 40px;
      padding-top: 112px;
    }
  }
  .actionBtn {
    display: flex !important;
    justify-content: space-between !important;
    position: absolute;
    top: 50%;
    z-index: 2;
    width: 92%;
    .spacer {
      flex: 1;
    }
    .arrowBtn {
      border-radius: 50% !important;
      border: 2px solid #fff;
      background: #000;
      padding: 1rem;
      width: 50px;
      height: 50px;
      color: rgb(255, 255, 255) !important;
      position: relative !important;
      transition: -ms-transform 0.25s ease 0s, transform 0.25s ease 0s,
        transform 0.25s ease 0s !important;
      outline: none;
      cursor: pointer;
    }
  }
`;

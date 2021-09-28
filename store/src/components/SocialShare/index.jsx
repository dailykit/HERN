import React from "react";
import { Wrapper } from "./styles";
import {
  FacebookShareButton,
  FacebookIcon,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import { theme } from "../../theme";

export default function ShareWith({ url, title, quote, hashtag }) {
  return (
    <Wrapper>
      <FacebookShareButton url={url} quote={quote} hashtag={hashtag}>
        <FacebookIcon size={theme.sizes.h1} round={true} />
      </FacebookShareButton>

      <WhatsappShareButton url={url} title={title} separator=":: ">
        <WhatsappIcon size={theme.sizes.h1} round={true} />
      </WhatsappShareButton>

      <LinkedinShareButton url={url}>
        <LinkedinIcon size={theme.sizes.h1} round={true} />
      </LinkedinShareButton>

      <TwitterShareButton url={url} title={title}>
        <TwitterIcon size={theme.sizes.h1} round={true} />
      </TwitterShareButton>

      <FacebookMessengerShareButton url={url} appId="521270401588372">
        <FacebookMessengerIcon size={theme.sizes.h1} round={true} />
      </FacebookMessengerShareButton>
    </Wrapper>
  );
}

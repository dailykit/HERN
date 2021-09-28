import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Loader } from "@dailykit/ui";

import styled from "styled-components";
import { useSubscription, useMutation } from "@apollo/client";
import ReactHtmlParser from "react-html-parser";
import { Tags, Layout, SEO } from "../../components";
import { theme } from "../../theme";
import { useWindowDimensions, fileParser } from "../../utils";
import { getNavigationMenuItems, getBannerData } from "../../lib";
import { useAuth } from "../../Providers";
import {
  TAGS,
  CUSTOMER_SELECTED_TAGS,
  UPSERT_CUSTOMER_TAGS,
} from "../../graphql";

export default function CategoryTagPage({
  navigationMenuItems,
  parsedData = [],
}) {
  const { width } = useWindowDimensions();
  const tagTop01 = useRef();
  const tagBottom01 = useRef();

  return (
    <Layout navigationMenuItems={navigationMenuItems}>
      {width < 769 && <SEO title="Tags" />}
      <div ref={tagTop01} id="tag-top-01">
        {Boolean(parsedData.length) &&
          ReactHtmlParser(
            parsedData.find((fold) => fold.id === "tag-top-01")?.content
          )}
      </div>
      <Tags />
      <div ref={tagBottom01} id="tag-bottom-01">
        {Boolean(parsedData.length) &&
          ReactHtmlParser(
            parsedData.find((fold) => fold.id === "tag-bottom-01")?.content
          )}
      </div>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const domain = "primanti.dailykit.org";
  const where = {
    id: { _in: ["tag-top-01", "tag-bottom-01"] },
  };
  const navigationMenuItems = await getNavigationMenuItems(domain);
  const bannerData = await getBannerData(where);
  const parsedData = await fileParser(bannerData);

  return {
    props: {
      navigationMenuItems,
      parsedData,
    },
  };
};

const Wrapper = styled.div`
  .heading {
    font-size: ${theme.sizes.h3};
    font-weight: 400;
    color: ${theme.colors.textColor4};
    text-align: center;
    margin: 2rem 4rem;
    line-height: 35px;
  }
  .customInput {
    margin-bottom: 1.5rem;
    color: ${theme.colors.textColor2};
  }
  .categoryTag {
    height: 48px;
    font-size: ${theme.sizes.h8};
    width: auto;
    padding: 1rem;
    margin: 8px;
  }

  .skip {
    display: flex;
    align-items: center;
    color: ${theme.colors.textColor2};
    font-size: ${theme.sizes.h6};
    margin-bottom: 6rem;
    justify-content: right;
    margin-right: 1rem;
    a {
      text-decoration: none;
      text-transform: uppercase;
      color: ${theme.colors.textColor};
      font-weight: 800;
    }
  }

  .getStartedBtnWrap {
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 1rem;
    margin: 1rem 0;
    z-index: 3;
  }
  .getStartedBtn {
    height: 48px;
    font-size: ${theme.sizes.h8};
    &:disabled {
      background: #ccc;
      height: 48px;
      font-size: ${theme.sizes.h8};
      cursor: not-allowed;
      color: #aaa;
    }
  }

  .center-div-wrapper {
    width: 100%;
    margin: auto;
  }

  @media (min-width: 769px) {
    .skip {
      display: none;
    }
    .getStartedBtnWrap {
      position: relative;
      padding: 0;
    }
    .center-div-wrapper {
      width: 80%;
    }
  }
`;

const CategoryTagWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

import React from "react";
import { LoginComp, Layout, SEO } from "../../components";
import ReactHtmlParser from "react-html-parser";
import { useWindowDimensions, fileParser } from "../../utils";
import { getNavigationMenuItems, getBannerData } from "../../lib";

export default function Login({
  isClicked,
  authBtnClassName,
  navigationMenuItems,
  parsedData = [],
  ...rest
}) {
  const { width } = useWindowDimensions();

  return (
    <Layout navigationMenuItems={navigationMenuItems}>
      {width < 769 && <SEO title="Login" />}
      <div id="login-top-01">
        {Boolean(parsedData.length) &&
          ReactHtmlParser(
            parsedData.find((fold) => fold.id === "login-top-01")?.content
          )}
      </div>
      <div style={{ width: width > 769 ? "50%" : "100%", margin: "0 auto" }}>
        <LoginComp />
      </div>
      <div id="login-bottom-01">
        {Boolean(parsedData.length) &&
          ReactHtmlParser(
            parsedData.find((fold) => fold.id === "login-bottom-01")?.content
          )}
      </div>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const domain = "primanti.dailykit.org";
  const where = {
    id: { _in: ["login-top-01", "login-bottom-01"] },
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

import React from "react";
import ReactHtmlParser from "react-html-parser";
import { SignupComp, SEO, Layout } from "../../components";
import { useWindowDimensions, fileParser } from "../../utils";
import { getNavigationMenuItems, getBannerData } from "../../lib";
export default function Signup({
  authBtnClassName,
  navigationMenuItems,
  parsedData = [],
  ...props
}) {
  const { width } = useWindowDimensions();

  return (
    <Layout navigationMenuItems={navigationMenuItems}>
      {width < 769 && <SEO title="Signup" />}
      <div id="signup-top-01">
        {Boolean(parsedData.length) &&
          ReactHtmlParser(
            parsedData.find((fold) => fold.id === "signup-top-01")?.content
          )}
      </div>
      <div style={{ width: width > 769 ? "50%" : "100%", margin: "0 auto" }}>
        <SignupComp />
      </div>
      <div id="signup-bottom-01">
        {Boolean(parsedData.length) &&
          ReactHtmlParser(
            parsedData.find((fold) => fold.id === "signup-bottom-01")?.content
          )}
      </div>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const domain = "primanti.dailykit.org";
  const where = {
    id: { _in: ["signup-top-01", "signup-bottom-01"] },
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

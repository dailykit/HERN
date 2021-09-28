import React from "react";
import { Intro, Layout, SEO } from "../../components";
import { getNavigationMenuItems } from "../../lib";

export default function IntroPage({ navigationMenuItems }) {
  return (
    <Layout navigationMenuItems={navigationMenuItems}>
      <SEO title="Intro" />
      <div style={{ padding: "1rem" }}>
        <Intro />
      </div>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const domain = "primanti.dailykit.org";
  const navigationMenuItems = await getNavigationMenuItems(domain);
  return {
    props: {
      navigationMenuItems,
    },
  };
};

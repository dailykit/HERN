import React from "react";
import { useRouter } from "next/router";
import ReactHtmlParser from "react-html-parser";
import { Layout, SEO } from "../../components";
import { fileParser } from "../../utils";
import { getNavigationMenuItems, getWebPageModule } from "../../lib";

const CustomPage = ({ navigationMenuItems = [], parsedData = [] }) => {
  const router = useRouter();
  const seoTitle = navigationMenuItems.find(({ url }) =>
    url.includes(router.asPath)
  ).label;
  React.useEffect(() => {
    try {
      if (parsedData.length && typeof document !== "undefined") {
        const scripts = parsedData.flatMap((fold) => fold.scripts);
        const fragment = document.createDocumentFragment();
        console.log({ scripts });
        scripts.forEach((script) => {
          const s = document.createElement("script");
          s.setAttribute("type", "text/javascript");
          s.setAttribute("src", script);
          fragment.appendChild(s);
        });
        document.body.appendChild(fragment);
      }
    } catch (err) {
      console.log("Failed to render page: ", err);
    }
  }, [parsedData]);

  return (
    <Layout navigationMenuItems={navigationMenuItems}>
      <SEO title={seoTitle} />
      <div id="custom-page-div">
        {Boolean(parsedData.length) &&
          parsedData.map((fold) => ReactHtmlParser(fold?.content))}
      </div>
    </Layout>
  );
};

export default CustomPage;

export const getStaticProps = async ({ params }) => {
  const domain = "primanti.dailykit.org";
  const route = `/${params.customPage[0]}`;
  let parsedData = [];
  const navigationMenuItems = await getNavigationMenuItems(domain);
  const websitePages = await getWebPageModule({ domain, route });

  if (websitePages.length > 0) {
    //parsed data of page
    parsedData = await fileParser(websitePages[0]["websitePageModules"]);
  }
  return {
    props: {
      navigationMenuItems,
      parsedData,
    },
  };
};

export const getStaticPaths = async () => {
  const domain = "primanti.dailykit.org";
  const navigationMenuItems = await getNavigationMenuItems(domain);
  const paths = navigationMenuItems.map((item) => ({
    params: { customPage: [item.url.substring(1)] },
  }));
  console.log({ checkPath: paths });
  return {
    paths,
    fallback: false,
  };
};

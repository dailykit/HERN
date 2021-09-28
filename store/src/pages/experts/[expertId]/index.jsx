import React, { useState, useEffect, useRef } from "react";
import { useSubscription } from "@apollo/client";
import { useRouter } from "next/router";
import { Flex, Loader } from "@dailykit/ui";
import ReactHtmlParser from "react-html-parser";
import styled from "styled-components";
import { EXPERT_INFO, EXPERTS } from "../../../graphql";
import { useWindowDimensions, isEmpty, fileParser } from "../../../utils";
import { useCustomWebpageModuleQuery } from "../../../Providers";
import { theme } from "../../../theme.js";
import {
  getNavigationMenuItems,
  graphqlClient,
  getBannerData,
} from "../../../lib";
import {
  ChevronDown,
  ChevronRight,
  Card,
  Masonry,
  AboutExpert,
  SEO,
  Layout,
} from "../../../components";

export default function Expert({
  navigationMenuItems,
  expert,
  category,
  parsedData = [],
}) {
  const router = useRouter();
  const expertTop01 = useRef();
  const expertBottom01 = useRef();
  const { expertId } = router.query;
  const { width } = useWindowDimensions();
  const [iconSize, setIconSize] = useState("14px");
  // const [expert, setExpert] = useState({});
  // const [category, setCategory] = useState("");
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  useEffect(() => {
    if (width > 769) {
      setIconSize("24px");
    } else {
      setIconSize("14px");
    }
  }, [width]);

  return (
    <Layout navigationMenuItems={navigationMenuItems}>
      <SEO title={`${expert?.firstName} ${expert?.lastName}`} />
      <Wrapper>
        <div ref={expertTop01} id="expert-top-01">
          {Boolean(parsedData.length) &&
            ReactHtmlParser(
              parsedData.find((fold) => fold.id === "expert-top-01")?.content
            )}
        </div>
        <AboutExpert expert={expert} expertCategory={category} />
        <GridViewWrapper>
          <Flex
            container
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding="1rem 0"
          >
            <h3 className="experienceHeading">
              {Object.keys(expert).length && expert.experience_experts.length}{" "}
              Experiences
            </h3>
            <ChevronDown size={iconSize} color={theme.colors.textColor4} />
          </Flex>
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {Object.keys(expert).length &&
              expert?.experience_experts.map((data, index) => {
                return (
                  <Card
                    onClick={() =>
                      router.push(`/experiences/${data?.experience?.id}`)
                    }
                    key={index}
                    type="experience"
                    data={data}
                  />
                );
              })}
          </Masonry>
        </GridViewWrapper>
        <div ref={expertBottom01} id="expert-bottom-01">
          {Boolean(parsedData.length) &&
            ReactHtmlParser(
              parsedData.find((fold) => fold.id === "expert-bottom-01")?.content
            )}
        </div>
      </Wrapper>
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  const domain = "primanti.dailykit.org";
  const navigationMenuItems = await getNavigationMenuItems(domain);
  const where = {
    id: {
      _in: ["expert-top-01", "expert-bottom-01"],
    },
    _or: [
      { expertId: { _eq: +params.expertId } },
      { expertId: { _is_null: true } },
    ],
  };
  const bannerData = await getBannerData(where);
  const parsedData = await fileParser(bannerData);
  const {
    data: { experts_expert_by_pk: expert = {} } = {},
  } = await graphqlClient.query({
    query: EXPERT_INFO,
    variables: { expertId: +params.expertId },
  });
  const category =
    expert.experience_experts[0]?.experience.experience_experienceCategories[0]
      ?.experienceCategoryTitle;
  return {
    props: {
      navigationMenuItems,
      expert,
      category,
      parsedData,
    },
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem;
  overflow: auto;
`;

const GridViewWrapper = styled.div`
  margin-bottom: 168px;
  .experienceHeading {
    font-size: ${theme.sizes.h3};
    color: ${theme.colors.textColor4};
    font-weight: 400;
    text-align: center;
    margin-bottom: 20px;
  }

  .explore {
    text-align: center;
    font-size: ${theme.sizes.h4};
    color: ${theme.colors.textColor};
    font-weight: 800;
    margin-right: 8px;
  }
  .my-masonry-grid {
    display: -webkit-box; /* Not needed if autoprefixing */
    display: -ms-flexbox; /* Not needed if autoprefixing */
    display: flex;
    width: auto;
    margin-right: 40px;
  }

  .my-masonry-grid_column > div {
    margin: 0 0 40px 40px;
  }

  @media (min-width: 769px) {
    .exploreExperience {
      text-align: center;
      font-size: ${theme.sizes.h1};
      color: ${theme.colors.textColor};
      font-weight: 800;
    }
    .experienceHeading {
      font-size: ${theme.sizes.h1};
    }
  }
  @media (max-width: 800px) {
    .my-masonry-grid {
      margin-right: 1rem;
    }
    .my-masonry-grid_column > div {
      margin: 0 0 1rem 1rem;
    }
  }
`;

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import ReactHtmlParser from "react-html-parser";
import styled from "styled-components";
import SendPollComp from "../../pageComponents/sendPollComponents";
import { SEO, Layout, InlineLoader } from "../../components";
import { theme } from "../../theme";
import { useExperienceInfo } from "../../Providers";
import { getNavigationMenuItems, getBannerData } from "../../lib";
import { useWindowDimensions, fileParser } from "../../utils";

export default function SendPoll({ navigationMenuItems, parsedData = [] }) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { experienceId } = router.query;
  const { setExperienceId, isLoading } = useExperienceInfo();

  useEffect(() => {
    if (experienceId) {
      setExperienceId(+experienceId);
    }
  }, [experienceId]);

  if (isLoading) return <InlineLoader />;

  return (
    <Layout navigationMenuItems={navigationMenuItems}>
      <Wrapper>
        {width < 769 && <SEO title="Send poll" />}
        <div id="sendPoll-top-01">
          {Boolean(parsedData.length) &&
            ReactHtmlParser(
              parsedData.find((fold) => fold.id === "sendPoll-top-01")?.content
            )}
        </div>
        <SendPollComp experienceId={+experienceId} />
        <div id="sendPoll-top-01">
          {Boolean(parsedData.length) &&
            ReactHtmlParser(
              parsedData.find((fold) => fold.id === "sendPoll-top-01")?.content
            )}
        </div>
      </Wrapper>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const domain = "primanti.dailykit.org";
  const where = {
    id: { _in: ["sendPoll-top-01", "sendPoll-bottom-01"] },
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
  width: 100%;
  height: 100%;
  padding: 1rem;
  margin-bottom: 2rem;
  overflow-y: auto;
  position: relative;
  background-color: ${theme.colors.mainBackground};
`;

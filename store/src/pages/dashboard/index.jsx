import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSubscription, useMutation } from "@apollo/client";
import { useToasts } from "react-toast-notifications";
import styled from "styled-components";
import ReactHtmlParser from "react-html-parser";
import { Layout, SEO, Masonry, Card } from "../../components";
import {
  PollRecyclerView,
  BookingRecyclerView,
} from "../../pageComponents/homeComponents";
import { theme } from "../../theme";
import { WISHLISTED_EXPERIENCES } from "../../graphql";
import { useWindowDimensions, fileParser, isEmpty } from "../../utils";
import { useAuth } from "../../Providers";
import { getNavigationMenuItems, getBannerData } from "../../lib";

export default function DashboardPage({
  navigationMenuItems,
  parsedData = [],
}) {
  const router = useRouter();
  const { addToast } = useToasts();
  const { state: userState } = useAuth();
  const { user = {} } = userState;
  const { width } = useWindowDimensions();
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  // subscription query for getting all wishlisted experiences of the user
  const {
    data: { experiences_experience: wishlistedExperience = [] } = {},
    loading: isLoadingWishlistedExperience,
    error: hasWishlistExperienceError,
  } = useSubscription(WISHLISTED_EXPERIENCES, {
    variables: {
      where: {
        customer_savedEntities: {
          keycloakId: {
            _eq: user?.keycloakId,
          },
          experienceId: {
            _is_null: false,
          },
        },
      },
      params: {
        keycloakId: user?.keycloakId,
      },
    },
  });

  if (hasWishlistExperienceError) {
    console.log(hasWishlistExperienceError);
    addToast("Something went wrong!", { appearance: "error" });
  }

  return (
    <Layout navigationMenuItems={navigationMenuItems}>
      <SEO title="Dashboard" />
      <div id="tag-top-01">
        {Boolean(parsedData.length) &&
          ReactHtmlParser(
            parsedData.find((fold) => fold.id === "dashboard-top-01")?.content
          )}
      </div>
      <Wrapper>
        <h1 className="heading">Dashboard</h1>
        <div className="flex-wrapper">
          <div className="dashboard-left-div">
            <h1 className="heading">User profile</h1>
            <div className="image-wrapper">
              <Image
                src={`https://ui-avatars.com/api/?name=${user?.email}&background=fff&color=15171F&size=500&rounded=true`}
                alt="user-profile"
                width={100}
                height={100}
                objectFit="cover"
              />
              <h5>{user?.name || user?.email || "User"}</h5>
            </div>
            <ul className="nav-list">
              <li className="nav-list-item">
                <Link href="/myPolls">
                  <a>My Polls</a>
                </Link>
              </li>
              <li className="nav-list-item">
                <Link href="/myBookings">
                  <a>My Bookings</a>
                </Link>
              </li>
            </ul>
          </div>
          <div className="dashboard-right-div">
            <div className="recycler-div">
              <PollRecyclerView keycloakId={user?.keycloakId} />
              <BookingRecyclerView keycloakId={user?.keycloakId} />
            </div>
            <div className="wishlist-card-div">
              <h1 className="experienceHeading">Wishlisted experiences</h1>
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                {wishlistedExperience.map((experience) => {
                  return (
                    <Card
                      onClick={() =>
                        router.push(`/experiences/${experience?.id}`)
                      }
                      boxShadow="true"
                      key={`${experience?.title}-${experience?.id}`}
                      type="experience"
                      data={{ experience }}
                    />
                  );
                })}
              </Masonry>
            </div>
          </div>
        </div>
      </Wrapper>
      <div id="tag-bottom-01">
        {Boolean(parsedData.length) &&
          ReactHtmlParser(
            parsedData.find((fold) => fold.id === "dashboard-bottom-01")
              ?.content
          )}
      </div>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const domain = "primanti.dailykit.org";
  const where = {
    id: { _in: ["dashboard-top-01", "dashboard-bottom-01"] },
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
  padding: 1rem;
  .heading {
    font-size: ${theme.sizes.h3};
    font-weight: 600;
    color: ${theme.colors.textColor4};
    text-align: center;
    margin: 2rem 0;
    line-height: 35px;
  }
  .flex-wrapper {
    display: flex;
    .dashboard-left-div {
      width: 20%;
      box-shadow: -12px 12px 24px rgba(18, 21, 27, 0.2),
        12px -12px 24px rgba(18, 21, 27, 0.2),
        -12px -12px 24px rgba(48, 53, 69, 0.9),
        12px 12px 30px rgba(18, 21, 27, 0.9),
        inset 1px 1px 2px rgba(48, 53, 69, 0.3),
        inset -1px -1px 2px rgba(18, 21, 27, 0.5);
      margin-right: 1rem;
      .image-wrapper {
        width: 100%;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        h5 {
          font-size: ${theme.sizes.h9};
          font-weight: 500;
          color: ${theme.colors.textColor4};
          text-align: center;
          margin: 1rem;
          line-height: 35px;
        }
      }
      .nav-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        margin: 0;
      }
      .nav-list-item {
        list-style: none;
        font-size: ${theme.sizes.h4};
        position: relative;
        display: flex;
        flex-direction: column;
        &:hover {
          a {
            color: ${theme.colors.textColor4};
          }
          background: ${theme.colors.secondaryColor};
        }
        &:last-child {
          margin-bottom: 32px;
        }
        a {
          position: relative;
          padding: 8px;
          text-decoration: none;
          color: ${theme.colors.textColor};
          text-align: center;
        }
      }
    }
    .dashboard-right-div {
      width: 80%;
      .experienceHeading {
        font-size: ${theme.sizes.h4};
        color: ${theme.colors.textColor4};
        font-weight: 600;
        text-align: center;
        margin-bottom: 20px;
      }
      .recycler-div {
        padding: 16px;
      }
      .wishlist-card-div {
        padding: 16px;
      }
      .my-masonry-grid {
        display: flex;
      }
      .my-masonry-grid_column > div {
        margin: 0 0 16px 16px;
      }
    }
  }

  @media (max-width: 769px) {
    .flex-wrapper {
      flex-direction: column;
      .dashboard-left-div {
        width: 100%;
      }
      .dashboard-right-div {
        width: 100%;
        .my-masonry-grid {
          margin-right: 1rem;
        }
        .my-masonry-grid_column > div {
          margin: 0 0 1rem 1rem;
        }
      }
    }
  }
`;

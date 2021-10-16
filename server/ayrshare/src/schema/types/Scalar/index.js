const { gql } = require('apollo-server-express')

const typeDefs = gql`
   type platformDetails {
      displayName: String
      platform: String
   }
   type createdDetails {
      _seconds: Int
      _nanoseconds: Int
   }
   type User {
      email: String
      created: createdDetails
      activeSocialAccounts: [String]
      displayNames: [platformDetails]
      usedMonthlyQuota: Int
      monthlyQuota: Int
   }

   type countEventDetails {
      count: Int
      event: String
      platform: String
   }

   type Analytics {
      linkEventStats: [countEventDetails]
      link: String
      shortlink: String
      created: createdDetails
   }

   type postInfo {
      status: String
      id: String
      platform: String
      postUrl: String
      usedQuota: Int
   }

   type errorDetails {
      action: String
      status: String
      code: Int
      message: String
      post: String
      platform: String
   }

   type PostResponse {
      status: String
      errors: [errorDetails]
      postIds: [postInfo]
      id: String
   }

   type reactions {
      impressionUnique: Int
      engagedUsers: Int
      clicksUnique: Int
      linkReaction: Int
   }

   type platformResponse {
      id: String
      analytics: [reactions]
   }

   type facebookAanalyticsResponse {
      impressionsUnique: Int
      engagedUsers: Int
      clicksUnique: Int
      likeReaction: Int
   }

   type facebookDetails {
      id: String
      analytics: facebookAanalyticsResponse
   }

   type instagramAnalyticsResponse {
      engagementCount: Int
      impressionsCount: Int
      reachCount: Int
      savedCount: Int
   }

   type instagramDetails {
      id: String
      analytics: instagramAnalyticsResponse
   }

   type nonPublicMetricsDetails {
      userProfileClicks: Int
      impressionCount: Int
   }

   type organicMetricsDetails {
      likeCount: Int
      retweetCount: Int
      userProfileClicks: Int
      replyCount: Int
      impressionCount: Int
   }

   type twitterAnalyticsResponse {
      text: String
      nonPublicMetrics: nonPublicMetricsDetails
      organicMetrics: organicMetricsDetails
      id: String
   }

   type twitterDetails {
      id: String
      analytics: twitterAnalyticsResponse
   }

   type linkedinAnalyticsResponse {
      shareCount: Int
      likeCount: Int
      engagement: Int
      clickCount: Int
      impressionCount: Int
      commentCount: Int
   }

   type linkedinDetails {
      id: String
      analytics: linkedinAnalyticsResponse
   }

   type youtubeAnalyticsDetails {
      viewCount: Int
      commentCount: Int
      likeCount: Int
      dislikeCount: Int
      clickCount: Int
      estimatedMinutesWatched: Int
   }

   type youtubeDetails {
      id: String
      analytics: youtubeAnalyticsDetails
   }

   type analyticsResponse {
      facebook: facebookDetails
      instagram: instagramDetails
      twitter: twitterDetails
      linkedin: linkedinDetails
      youtube: youtubeDetails
      status: String
      code: Int
      id: String
   }

   type instagramSocialAnalyticsResponse {
      name: String
      username: String
      website: String
      biography: String
      followersCount: Int
      mediaCoun: Int
      id: String
   }

   type instagramSocialDetails {
      analytics: instagramSocialAnalyticsResponse
   }

   type facebookLocation {
      zip: String
   }

   type facebookSocialAnalyticsResponse {
      name: String
      about: String
      location: facebookLocation
      website: String
      followersCount: Int
      fanCount: Int
      username: String
      id: String
   }

   type facebookSocialDetails {
      analytics: facebookSocialAnalyticsResponse
   }

   type twitterSocialAnalyticsResponse {
      name: String
      displayName: String
      location: String
      description: String
      followersCount: Int
      friendsCount: Int
      created_at: String
      id: Int
      username: String
   }

   type twitterSocialDetails {
      analytics: twitterSocialAnalyticsResponse
   }

   type analyticsSocialResponse {
      instagram: instagramSocialDetails
      facebook: facebookSocialDetails
      twitter: twitterSocialDetails
      status: String
   }

   type commentDetails {
      status: String
      commentId: String
      comment: String
      platform: String
   }

   type postCommentResponse {
      facebook: commentDetails
      instagram: commentDetails
      status: String
      id: String
   }

   type fromDetails {
      name: String
      id: String
   }

   type facebookGetCommentDetails {
      from: fromDetails
      commentId: String
      comment: String
      created: String
      platform: String
   }

   type instagramGetCommentDetails {
      commentId: String
      comment: String
      created: String
      platform: String
   }

   type Comments {
      facebook: facebookGetCommentDetails
      instagram: instagramGetCommentDetails
      status: String
      id: String
   }

   type deletePostDetails {
      action: String
      status: String
      id: String
   }

   type deletePostResponse {
      twitter: deletePostDetails
      facebook: deletePostDetails
      status: String
   }
`

module.exports = typeDefs

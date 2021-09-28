module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  images: {
    domains: [
      "dailykit-239-primanti.s3.us-east-2.amazonaws.com",
      "via.placeholder.com",
      "ui-avatars.com",
    ],
  },
};

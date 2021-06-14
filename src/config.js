import React from "react";

const config = {
  SERVER_URL: process.env.SERVER_URL || 'ws://localhost:9000',
  GOOGLE_ANALYTICS_CODE: process.env.REACT_APP_GOOGLE_ANALYTICS_CODE,
  SENTRY_URI: process.env.REACT_APP_SENTRY_URI
};

export default config;

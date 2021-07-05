module.exports = {
  webpack: (config, { isServer }) => {
    // console.log("config", config);
    // console.log("config.node", config.node);
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      // if you miss it, all the other options in fallback,
      // specified by next.js will be dropped. Doesn't make
      // much sense, but how it is the solution
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
};

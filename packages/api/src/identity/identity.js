export let cache = {};

export default {
  get: request => {
    if (typeof request !== "undefined") {
      return request.__SK__.identity || {};
    }

    return cache;
  },

  set: ({ segment, version, request }) => {
    if (typeof request !== "undefined") {
      return (request.__SK__.identity = { segment, version });
    }

    cache.segment = segment;
    cache.version = version;
  }
};

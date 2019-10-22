export let cache = {};

export default {
  get: request => {
    if (typeof request !== "undefined") {
      return request.__SK__.context || {};
    }

    return cache;
  },

  /**
   * TODO: Remove the request object from the first argument in 3.0.0.
   *       It is there only for backward compability.
   */
  set: ({ segment, version, request }, req) => {
    const _req = request || req;

    if (typeof _req !== "undefined") {
      return (_req.__SK__.context = { segment, version });
    }

    cache.segment = segment;
    cache.version = version;
  }
};

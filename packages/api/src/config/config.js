import cookies from "../cookies";

// Client side calls will be cached.
let cache;

/**
 * Export a function to retrieve the application's remote config.
 */
export default req => {
  if (typeof cache !== "undefined") {
    return cache;
  }

  const cks = cookies(req);

  if (cks.sk_settings) {
    try {
      const decoded =
        typeof atob !== "undefined"
          ? atob(cks.sk_settings)
          : Buffer.from(cks.sk_settings, "base64").toString();

      const settings = JSON.parse(decoded);

      if (typeof window !== "undefined") {
        cache = settings;
      }

      return settings;
    } catch (e) {}
  }

  return {};
};

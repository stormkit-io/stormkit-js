/**
 * Given a cookie string, this function returns an object of key-value pairs.
 *
 * @param {String} cookie The cookie header.
 */
function parse(cookie = "") {
  return cookie.split("; ").reduce((obj, cookie) => {
    const index = cookie.indexOf("=");
    const name = cookie.substr(0, index);
    const val = cookie.substr(index + 1);

    if (name != "") {
      obj[name] = val;
    }

    return obj;
  }, {});
}

// Client side calls will be cached.
export let cache;

export default {
  /**
   * Parses the cookies header and returns a key-value object.
   */
  parse: req => {
    // Client-Side
    if (typeof document !== "undefined") {
      if (typeof cache !== "undefined") {
        return cache;
      }

      return (cache = parse(document.cookie));
    }

    if (typeof req === "undefined") {
      throw new Error(
        "@stormkit/api: Server side calls require to pass down the request object."
      );
    }

    // Server-Side
    return parse(req.header("cookie"));
  },

  /**
   * Sets a cookie value.
   */
  set: ({ name, value, days, response }) => {
    let expires = "";

    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }

    const cookie = name + "=" + (value || "") + expires + "; path=/";

    if (typeof document !== "undefined") {
      document.cookie = cookie;
    } else if (typeof response !== "undefined") {
      response.setHeader("Set-Cookie", cookie);
    } else {
      throw new Error(
        "@stormkit/api: The cookie set method expects either a global document object or a response object."
      );
    }
  }
};

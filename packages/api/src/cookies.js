let cookies;

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
let cache;

/**
 * Export a function to retrieve the cookies.
 */
export default req => {
  // Client-Side
  if (typeof document !== "undefined") {
    if (typeof cache !== "undefined") {
      return cache;
    }

    return (cache = parse(document.cookie));
  }

  if (typeof req === "undefined") {
    throw new Error(
      "[sk.config]: Server side calls require to pass down the request object."
    );
  }

  // Server-Side
  return parse(req.header("cookie"));
};

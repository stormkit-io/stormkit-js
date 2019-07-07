import headers from "../headers";

/**
 * Helper function to log data to Stormkit. This function is async to make
 * it non-blocking. Currently, this implementation is server-side only. It
 * accepts a label argument which is used to categorize logs, and the subsequent
 * arguments will be used as log data.
 */
export default (label, ...data) => {
  const postData = JSON.stringify({
    label,
    data,
    timestamp: Date.now(),
    requestId: global.SK_REQUEST_ID,
    hostName: global.SK_HOST_NAME,
    appId: parseInt(process.env.SK_APP_ID, 10)
  });

  return new Promise((resolve, reject) => {
    const opts = {
      host: "api.stormkit.io",
      port: 443,
      path: `/app/log`,
      method: "POST",
      headers: Object.assign(headers(), {
        "Content-Length": postData.length
      })
    };

    const post = require("https").request(opts, res => res.on("end", resolve));
    post.on("error", reject);
    post.write(postData);
    post.end();
  });
};

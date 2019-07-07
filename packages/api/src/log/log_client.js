import headers from "../headers";

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const requestId = uuidv4();

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
    requestId,
    timestamp: Date.now(),
    hostName: window.location.hostname,
    appId: parseInt(process.env.SK_APP_ID, 10)
  });

  return fetch(`https://api.stormkit.io/app/log`, {
    method: "POST",
    headers: Object.assign(headers(), {
      "Content-Length": postData.length
    }),
    body: JSON.stringify(postData)
  });
};

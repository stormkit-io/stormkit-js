/**
 * Helper function to log data to Stormkit. This function is async to make
 * it non-blocking. Currently, this implementation is server-side only. It
 * accepts a label argument which is used to categorize logs, and the subsequent
 * arguments will be used as log data.
 */
export default (label, ...data) => {
  if (process.env.NODE_ENV !== "production") {
    return console.log(label, ...data);
  }

  if (typeof window !== "undefined") {
    return require("./log_client.js")(label, ...data);
  } else {
    return require("./log_server.js")(label, ...data);
  }
};

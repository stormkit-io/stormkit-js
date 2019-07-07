/**
 * Headers to be used to identify an application in Stormkit API.
 */
export default () => ({
  "Content-Type": "application/json",
  "X-Auth-Client-Id": process.env.SK_CLIENT_ID,
  "X-Auth-Client-Secret": process.env.SK_CLIENT_SECRET
});

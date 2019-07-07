import config from "./config/config";

export default {
  config: req => (config(req) || {}).config || {}
};

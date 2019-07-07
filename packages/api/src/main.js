import log from "./log/log";
import config from "./config/config";

export default {
  log,
  config: req => (config(req) || {}).config
};

import config from "./config/config";
import context from "./context/context";

export default {
  config,

  /**
   * @deprecated This is renamed as context.
   * TODO: Remove this in version 3.0.0.
   */
  user: (...args) => {
    if (args.length) {
      return context.set(...args);
    } else {
      return context.get();
    }
  },

  context: (...args) => {
    if (args.length) {
      return context.set(...args);
    } else {
      return context.get();
    }
  }
};

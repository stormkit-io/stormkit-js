import config from "./config/config";
import identity from "./identity/identity";

export default {
  config,

  user: (...args) => {
    if (args.length) {
      return identity.set(...args);
    } else {
      return identity.get();
    }
  }
};

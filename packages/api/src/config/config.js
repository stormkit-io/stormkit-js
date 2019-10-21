import cookies from "../cookies";
import identity from "../identity/identity";

/**
 * Checks whether the given value is an object or not.
 */
function isObject(val) {
  return typeof val !== "undefined" && val !== null;
}

/**
 * Parse the remote config cookie values and return an object
 * that represents values already being set for the given user.
 */
function parseCookieValue(request) {
  const raw = cookies.parse(request).sk_rc;
  const parsed = {};

  if (!raw) {
    return parsed;
  }

  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch (e) {
    return parsed;
  }
}

class Config {
  constructor(config, request, response) {
    this.config = config || {};
    this.cookie = parseCookieValue(request);
    this.request = request;
    this.response = response;
  }

  /**
   * Returns the configuration that matches the key. If the config object
   * has a corresponding key, the targetings will be checked. The first
   * targeting that matches the conditions will be returned. If no value
   * is returned, the defaultValue is returned.
   */
  get(key, defaultValue) {
    const obj = this.config[key];

    if (isObject(obj) === false || Array.isArray(obj.targetings) === false) {
      return defaultValue;
    }

    const id = identity.get(this.request);
    const segment = id.segment || "";
    const version = +id.version || 0;
    let rand = this.cookie[key] || Math.random(0, 1) * 100;
    let value;

    // Otherwise check the targetings, try to find the first matching one.
    for (let i = 0; i < obj.targetings.length; i++) {
      const targeting = obj.targetings[i];

      if (isObject(targeting) === false) {
        continue;
      }

      // Match segment
      if (targeting.segment && segment.match(targeting.segment) === null) {
        continue;
      }

      // Match app version. The application version needs to be a numeric value.
      if (targeting.appVersion) {
        const op = targeting.appVersion[0];
        const targetedVersion = +targeting.appVersion.replace(/[^0-9]+/g, "");

        if (isNaN(+op)) {
          if (op === "<" && !(version < targetedVersion)) {
            continue;
          } else if (op === ">" && !(version > targetedVersion)) {
            continue;
          }
        } else if (version !== targetedVersion) {
          continue;
        }
      }

      // Match percentile
      if (
        targeting.percentile !== "" &&
        typeof targeting.percentile !== "undefined"
      ) {
        rand = rand - +targeting.percentile;

        if (rand >= 0) {
          continue;
        }

        // Save the value to the cookie so that next time we re-use it.
        // If the user falls in a bucket, say for instance 80%, we save
        // the percentile 80. When the application owner changes the experiment
        // and increases the percentage, the user in the control group
        // will stay in the same bucket.
        this.cookie[key] = targeting.percentile;
        cookies.set({
          name: "sk_rc",
          value: encodeURIComponent(JSON.stringify(this.cookie)),
          days: 15,
          response: this.response
        });
      }

      value = targeting.value;
      break;
    }

    if (typeof value !== "undefined") {
      return value;
    }

    return defaultValue;
  }
}

export let cache = {};

/**
 * Export a function to retrieve the application's remote config.
 */
export default (req, res) => {
  if (typeof cache.obj !== "undefined") {
    return cache.obj;
  }

  let cnf;

  if (typeof window !== "undefined" && isObject(window.__SK__)) {
    cnf = new Config(window.__SK__.config);
    cache.obj = cnf;
  } else if (typeof req === "object" && isObject(req.__SK__)) {
    cnf = new Config(req.__SK__.config, req, res);
  } else {
    cnf = new Config();
  }

  return cnf;
};

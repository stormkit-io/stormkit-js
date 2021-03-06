import jsdom from "jsdom";
import cookies, { clientSideCache as cookieCache } from "../cookies";
import context from "../context/context";
import config, { cache } from "./config";

jest.useFakeTimers();

describe("config", () => {
  const removeCookies = () => {
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    delete cookieCache.obj;
  };

  let mathRandom;

  beforeAll(() => {
    mathRandom = global.Math.random;
  });

  afterAll(() => {
    global.Math.random = mathRandom;
  });

  describe("client-side", () => {
    const cnf = () => {
      cache.obj = undefined;
      removeCookies();
      return config();
    };

    beforeAll(() => {
      global.window = new jsdom.JSDOM(``);
      global.window.__SK__ = {
        config: {
          feature1: {
            targetings: [
              { value: "value1-a", segment: "my-segment", appVersion: "> 10" },
              {
                value: "value1-b",
                segment: "my-other-segment",
                appVersion: "< 10"
              },
              { value: "value1-c", appVersion: "10" }
            ]
          },
          feature2: {
            targetings: [{ value: "value2", appVersion: "< 10" }]
          },
          feature3: {
            experimentId: "xGabX41",
            targetings: [{ value: "value3" }]
          },
          feature4: {
            targetings: [
              { value: "value4-a", percentile: "25" },
              { value: "value4-b", percentile: "75" }
            ]
          }
        }
      };
    });

    afterAll(() => {
      delete global.window;
      delete global.document;
    });

    beforeEach(() => {
      cache.obj = undefined;
    });

    afterEach(() => {
      delete window.ga;
      removeCookies();
    });

    test("single value, no condition", () => {
      expect(cnf().get("feature3")).toBe("value3");
    });

    test("should save the value into a cookie only when percentile is matched", () => {
      global.Math.random = jest.fn().mockReturnValue(0.8);
      context.set({ version: "7" });
      expect(cnf().get("feature3")).toBe("value3");
      expect(decodeURIComponent(document.cookie)).toBe("");
      expect(cnf().get("feature4")).toBe("value4-b");
      delete cookieCache.obj;

      expect(
        JSON.parse(decodeURIComponent(cookies.parse(document.cookie).sk_rc))
      ).toEqual({
        feature4: 80
      });

      expect(config().get("feature4")).toBe("value4-b"); // Should return the same value
    });

    test("multiple values, different segments and appVersions", () => {
      context.set({ segment: "invalid-segment", version: "16" });
      expect(cnf().get("feature1", "")).toBe("");

      context.set({ segment: "my-segment-match", version: "16" });
      expect(cnf().get("feature1", "")).toBe("value1-a");
      context.set({ segment: "my-segment-match" }); // misses version
      expect(cnf().get("feature1", "")).toBe("");

      context.set({ segment: "my-other-segment", version: "8" }); // segment and version matches
      expect(cnf().get("feature1", "")).toBe("value1-b");
      context.set({ segment: "my-other-segment", version: "16" }); // segment matches, version does not
      expect(cnf().get("feature1", "")).toBe("");

      context.set({ version: "10" }); // version matches
      expect(cnf().get("feature1", "")).toBe("value1-c");
      context.set({ version: "11" }); // version does not matches
      expect(cnf().get("feature1", "")).toBe("");
    });

    test("percentile", () => {
      global.Math.random = jest.fn().mockReturnValue(0.75);
      expect(cnf().get("feature4")).toBe("value4-b");
      global.Math.random = jest.fn().mockReturnValue(0.5);
      expect(cnf().get("feature4")).toBe("value4-b");
      global.Math.random = jest.fn().mockReturnValue(0.26);
      expect(cnf().get("feature4")).toBe("value4-b");
      global.Math.random = jest.fn().mockReturnValue(0.1);
      expect(cnf().get("feature4")).toBe("value4-a");
      global.Math.random = jest.fn().mockReturnValue(0.0001);
      expect(cnf().get("feature4")).toBe("value4-a");
    });

    test("should use the cached version for client-side calls", () => {
      expect(config()).toBe(config());
    });

    test("should sync with Google Optimize", async done => {
      window.ga = jest.fn();
      cnf().get("feature3");
      const expId = cnf().config.feature3.experimentId;
      jest.advanceTimersByTime(1000);

      // Flush promises
      await (() => new Promise(setImmediate))();

      expect(window.ga).toHaveBeenCalledWith("set", "exp", `${expId}.value3`);
      done();

      // Subsequent calls should not sync the value.
      cnf().get("feature3");
      jest.advanceTimersByTime(1000);
      expect(window.ga).toHaveBeenCalledTimes(1);

      // Also no experiments should not trigger
      cnf().get("feature1");
      jest.advanceTimersByTime(1000);
      expect(window.ga).toHaveBeenCalledTimes(1);
    });

    test("should not throw when Google Optimize is not loaded", async done => {
      delete window.ga;
      cnf().get("feature3");
      jest.advanceTimersByTime(20000);

      // Flush promises
      await (() => new Promise(setImmediate))();

      // Should not throw
      done();
    });
  });

  describe("server-side", () => {
    beforeAll(() => {
      delete global.window;
      delete global.document;
      cache.obj = undefined;
    });

    test("should load the config, the rest is the same functionality with client-side", () => {
      global.Math.random = jest.fn().mockReturnValue(0.75);

      const req = {
        header: jest.fn(),
        __SK__: {
          config: {
            feature: {
              targetings: [{ value: "value", percentile: "90" }]
            }
          }
        }
      };

      const res = {
        setHeader: jest.fn()
      };

      expect(config(req, res).get("feature")).toBe("value");
      expect(req.header).toHaveBeenCalledWith("cookie");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringMatching("sk_rc=%7B%22feature%22%3A75%7D;")
      );
    });
  });
});

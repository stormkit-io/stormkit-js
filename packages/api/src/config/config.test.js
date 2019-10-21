import jsdom from "jsdom";
import cookies, { cache as cookieCache } from "../cookies";
import identity from "../identity/identity";
import config, { cache } from "./config";

describe("config", () => {
  const encoded = encodeURIComponent(
    JSON.stringify({ feature1: "value1-a", feature2: "value2" })
  );

  describe("client-side", () => {
    let mathRandom;

    const cnf = () => {
      cache.obj = undefined;
      return config();
    };

    beforeAll(() => {
      mathRandom = global.Math.random;
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
      global.Math.random = mathRandom;
    });

    beforeEach(() => {
      cache.obj = undefined;
    });

    afterEach(() => {
      document.cookie = "";

      cookieCache &&
        Object.keys(cookieCache).forEach(k => {
          delete cookieCache[k];
        });
    });

    test("should return the cookie values when the cookie is there", () => {
      cookies.set({ name: "sk_rc", days: 10, value: encoded });
      expect(cnf().get("feature1")).toBe("value1-a");
      expect(cnf().get("feature2")).toBe("value2");
    });

    test("single value, no condition", () => {
      expect(cnf().get("feature3")).toBe("value3");
    });

    test("should save the value into a cookie", () => {
      const conf = config();
      identity.set({ version: "7" });
      expect(conf.get("feature3")).toBe("value3");
      expect(decodeURIComponent(document.cookie)).toBe(
        `sk_rc={"feature3":"value3"}; `
      );
      expect(conf.get("feature2")).toBe("value2");
      expect(decodeURIComponent(document.cookie)).toBe(
        `sk_rc={"feature3":"value3","feature2":"value2"}; `
      );
    });

    test("multiple values, different segments and appVersions", () => {
      identity.set({ segment: "invalid-segment", version: "16" });
      expect(cnf().get("feature1", "")).toBe("");

      identity.set({ segment: "my-segment-match", version: "16" });
      expect(cnf().get("feature1", "")).toBe("value1-a");
      identity.set({ segment: "my-segment-match" }); // misses version
      expect(cnf().get("feature1", "")).toBe("");

      identity.set({ segment: "my-other-segment", version: "8" }); // segment and version matches
      expect(cnf().get("feature1", "")).toBe("value1-b");
      identity.set({ segment: "my-other-segment", version: "16" }); // segment matches, version does not
      expect(cnf().get("feature1", "")).toBe("");

      identity.set({ version: "10" }); // version matches
      expect(cnf().get("feature1", "")).toBe("value1-c");
      identity.set({ version: "11" }); // version does not matches
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
  });

  describe("server-side", () => {
    beforeAll(() => {
      delete global.window;
      delete global.document;
      cache.obj = undefined;
    });

    test("should load the config, the rest is the same functionality with client-side", () => {
      const req = {
        header: jest.fn(),
        __SK__: {
          config: {
            feature: {
              targetings: [{ value: "value" }]
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
        expect.stringMatching("sk_rc=%7B%22feature%22%3A%22value%22%7D;")
      );
    });
  });
});

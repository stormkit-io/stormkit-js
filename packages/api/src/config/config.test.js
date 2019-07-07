import jsdom from "jsdom";

describe("config", () => {
  const encoded = btoa(JSON.stringify({ feature1: true, feature2: "value2" }));
  const variantId = "1154651250402";
  const settings = `sk_settings=${encoded}`;
  const variant = `sk_variant=${variantId}`;

  describe("client-side", () => {
    beforeAll(() => {
      global.window = new jsdom.JSDOM(``);
      document.cookie = settings;
      document.cookie = variant;
    });

    afterAll(() => {
      delete global.window;
      delete global.document;
    });

    test("should return an object when the cookie header is there", () => {
      const { default: config } = require("./config");
      expect(config().feature1).toBe(true);
      expect(config().feature2).toBe("value2");
      expect(Object.keys(config()).length).toBe(2);
    });
  });

  describe("server-side", () => {
    beforeEach(() => {
      jest.resetModules();
    });

    test("should return an object when the cookie header is there", () => {
      const { default: config } = require("./config");

      // Mock the request object
      const req = {
        header: name => {
          if (name === "cookie") {
            return [settings, variant].join("; ");
          }
        }
      };

      expect(typeof config).toBe("function");
      expect(config(req).feature1).toBe(true);
      expect(config(req).feature2).toBe("value2");
      expect(Object.keys(config(req)).length).toBe(2);
    });

    test("atob is not defined on server side environments, so test Buffer", () => {
      expect(Buffer.from(encoded, "base64").toString()).toBe(
        `{\"feature1\":true,\"feature2\":\"value2\"}`
      );
    });
  });
});

import jsdom from "jsdom";

describe("cookies", () => {
  const encoded = btoa(JSON.stringify({ feature1: true, feature2: false }));
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
      const { default: cookies } = require("./cookies");
      const cks = cookies.parse();
      expect(cks.sk_settings).toBe(encoded);
      expect(cks.sk_variant).toBe(variantId);
      expect(Object.keys(cks).length).toBe(2);
    });
  });

  describe("server-side", () => {
    beforeEach(() => {
      jest.resetModules();
    });

    test("should return an object when the cookie header is there", () => {
      const { default: cookies } = require("./cookies");

      // Mock the request object
      const req = {
        header: name => {
          if (name === "cookie") {
            return [settings, variant].join("; ");
          }
        }
      };

      const cks = cookies.parse(req);
      expect(cks.sk_settings).toBe(encoded);
      expect(cks.sk_variant).toBe(variantId);
      expect(Object.keys(cks).length).toBe(2);
    });
  });
});

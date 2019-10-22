import context, { cache } from "./context";

describe("context", () => {
  afterEach(() => {
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
  });

  describe("client-side", () => {
    test("should set and return the context", () => {
      context.set({ segment: "my-segment", version: 15 });
      expect(context.get().segment).toBe("my-segment");
      expect(context.get().version).toBe(15);
    });
  });

  describe("server-side", () => {
    test("should set and return the context", () => {
      const request = { __SK__: {} };
      context.set({ segment: "my-segment", version: 15 }, request);
      expect(context.get(request).segment).toBe("my-segment");
      expect(context.get(request).version).toBe(15);
      expect(request.__SK__.context).toEqual({
        segment: "my-segment",
        version: 15
      });
    });
  });
});

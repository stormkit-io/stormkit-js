import identity, { cache } from "./identity";

describe("identity", () => {
  describe("client-side", () => {
    test("should set and return the identity", () => {
      identity.set({ segment: "my-segment", version: 15 });
      expect(identity.get().segment).toBe("my-segment");
      expect(identity.get().version).toBe(15);
    });
  });

  describe("server-side", () => {
    test("should set and return the identity", () => {
      const request = { __SK__: {} };
      identity.set({ segment: "my-segment", version: 15, request });
      expect(identity.get(request).segment).toBe("my-segment");
      expect(identity.get(request).version).toBe(15);
      expect(request.__SK__.identity).toEqual({
        segment: "my-segment",
        version: 15
      });
    });
  });
});

import { mapGetSetDefault } from "./map";

describe("mapGetSetDefault", () => {
  test("returns the value and does not mutate the map if the key is in the map", () => {
    const map = { prop1: "val1", prop2: "val2" };
    expect(mapGetSetDefault(map, "prop1", "default")).toEqual("val1");
    expect(map).toEqual({ prop1: "val1", prop2: "val2" });
  });

  test("returns the default value and add it to the map if the key is not in the map", () => {
    const map = { prop1: "val1", prop2: "val2" };
    expect(mapGetSetDefault(map, "prop3", "default")).toEqual("default");
    expect(map).toEqual({ prop1: "val1", prop2: "val2", prop3: "default" });
  });
});

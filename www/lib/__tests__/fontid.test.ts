import { describe, test, expect } from "@jest/globals";
import { familyToId, idToFamily } from "../fontid";

describe("familyToId", () => {
  test("should convert simple family names to IDs", () => {
    expect(familyToId("Roboto")).toBe("roboto");
    expect(familyToId("Inter")).toBe("inter");
    expect(familyToId("Lato")).toBe("lato");
  });

  test("should handle family names with spaces", () => {
    expect(familyToId("Open Sans")).toBe("open-sans");
    expect(familyToId("Source Sans Pro")).toBe("source-sans-pro");
    expect(familyToId("Noto Sans JP")).toBe("noto-sans-jp");
  });

  test("should handle family names with special characters", () => {
    expect(familyToId("Roboto & Friends")).toBe("roboto-friends");
    expect(familyToId("Font@Home")).toBe("font-home");
    expect(familyToId("Test#Font")).toBe("test-font");
    expect(familyToId("Font (Bold)")).toBe("font-bold");
  });

  test("should handle mixed case", () => {
    expect(familyToId("ROBOTO")).toBe("roboto");
    expect(familyToId("Open SANS")).toBe("open-sans");
    expect(familyToId("MiXeD cAsE")).toBe("mixed-case");
  });

  test("should handle multiple consecutive spaces", () => {
    expect(familyToId("Font   With   Spaces")).toBe("font-with-spaces");
    expect(familyToId("  Leading Spaces")).toBe("leading-spaces");
    expect(familyToId("Trailing Spaces  ")).toBe("trailing-spaces");
  });

  test("should handle empty string", () => {
    expect(familyToId("")).toBe("");
  });
});

describe("idToFamily", () => {
  test("should convert simple IDs to family names", () => {
    expect(idToFamily("roboto")).toBe("Roboto");
    expect(idToFamily("inter")).toBe("Inter");
    expect(idToFamily("lato")).toBe("Lato");
  });

  test("should handle IDs with dashes", () => {
    expect(idToFamily("open-sans")).toBe("Open Sans");
    expect(idToFamily("source-sans-pro")).toBe("Source Sans Pro");
    expect(idToFamily("noto-sans-jp")).toBe("Noto Sans Jp");
  });

  test("should handle single character words", () => {
    expect(idToFamily("a-b-c")).toBe("A B C");
    expect(idToFamily("x-y-z")).toBe("X Y Z");
  });

  test("should handle empty string", () => {
    expect(idToFamily("")).toBe("");
  });

  test("should handle single word", () => {
    expect(idToFamily("roboto")).toBe("Roboto");
  });
});

describe("round-trip conversion", () => {
  test("should maintain consistency for simple names", () => {
    const original = "Roboto";
    const id = familyToId(original);
    const converted = idToFamily(id);
    expect(converted).toBe(original);
  });

  test("should maintain consistency for names with spaces", () => {
    const original = "Open Sans";
    const id = familyToId(original);
    const converted = idToFamily(id);
    expect(converted).toBe(original);
  });

  test("should handle special characters (may lose some info)", () => {
    const original = "Font & Friends";
    const id = familyToId(original);
    const converted = idToFamily(id);
    expect(converted).toBe("Font Friends"); // Special characters are removed
  });

  test("should handle complex names", () => {
    const original = "Source Sans Pro";
    const id = familyToId(original);
    const converted = idToFamily(id);
    expect(converted).toBe(original);
  });
});

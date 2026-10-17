import { describe, it, expect } from "vitest";
import { ping } from "../src/index.js";

describe("Engine verification test", () => {
  it("should return pong message when target is provided", () => {
    const result = ping("192.168.1.1");
    expect(result).toBe("pong from 192.168.1.1");
  });

  it("should throw error when target is empty", () => {
    expect(() => ping("")).toThrow("Target is required");
  });
});

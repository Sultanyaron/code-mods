import { API, FileInfo } from "jscodeshift";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.Identifier, (path) => path.name === "test")
    .forEach((path) => {
      path.node.name = "it";
    });

  return root.toSource({ quote: "single" });
}

// This is the actual code that we run it against:

import { test } from "vitest";

describe("MyAwesomeComponent", () => {
  test("Should be false", () => {
    expect(false).toBe(false);
  });

  test("Should be true", () => {
    expect(true).toBe(true);
  });
});

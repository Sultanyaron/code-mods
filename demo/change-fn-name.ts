import { API, FileInfo } from "jscodeshift";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.Identifier, (identifier) => identifier.name === "test")
    .forEach((path) => {
      path.node.name = "it";
    });

  return root.toSource({ quote: "single" });
}

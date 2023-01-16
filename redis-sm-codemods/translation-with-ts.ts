import { API, FileInfo } from "jscodeshift";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const fixImport = () => {
    root
      .find(j.ImportDeclaration)
      .filter(
        (path) =>
          path.node.specifiers[0].local.name === "usePrefixedTranslation"
      )
      .forEach((path) => {
        path.node.specifiers[0] = j.importSpecifier(
          j.identifier("useTranslation")
        );

        path.value.source.value = "react-i18next";
      });
  };

  const fixTFunctionCall = () => {
    root
      .find(j.CallExpression)
      .filter((path) => path.node.callee.name === "prefixedT")
      .forEach((path) => {
        path.node.callee.name = "t";
      });
  };

  const fixTFunctionIdentifier = () => {
    root
      .find(j.Identifier)
      .filter((path) => path.node.name === "prefixedT")
      .forEach((path) => {
        path.node.name = "t";
      });
  };

  const fixUseTranslationNameAndArguments = () => {
    root
      .find(j.CallExpression)
      .filter((path) => path.node.callee.name === "usePrefixedTranslation")
      .forEach((path) => {
        path.node.callee.name = "useTranslation";

        const keyPrefix = path.node.arguments[0].value;

        path.node.arguments[1] = j.objectExpression([
          j.property(
            "init",
            j.identifier("keyPrefix"),
            j.stringLiteral(keyPrefix)
          ),
        ]);

        path.node.arguments[0].value = "translation";
      });
  };

  fixImport();
  fixUseTranslationNameAndArguments();
  fixTFunctionIdentifier();
  fixTFunctionCall();

  return root.toSource({ quote: "single" });
}

import { API, FileInfo } from "jscodeshift";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const fixImportAndInsertNewImport = () => {
    const usePrefixedTranslationImports = root.find(
      j.ImportDeclaration,
      (importDeclaration) =>
        importDeclaration.specifiers[0].local.name === "usePrefixedTranslation"
    );

    const didFindUsePrefixedTranslationImport =
      !!usePrefixedTranslationImports.length;

    if (didFindUsePrefixedTranslationImport) {
      usePrefixedTranslationImports.replaceWith(
        j.importDeclaration(
          [j.importSpecifier(j.identifier("useTranslation"))],
          j.stringLiteral("react-i18next")
        )
      );
      usePrefixedTranslationImports.insertAfter(
        j.importDeclaration(
          [j.importSpecifier(j.identifier("i18translation"))],
          j.stringLiteral("locale/translations/i18NsPaths")
        )
      );
    }

    return didFindUsePrefixedTranslationImport;
  };

  const fixUseTranslationNameDeclaration = () => {
    let keyPrefix = "";

    const usePrefixedTranslationVariableDeclaration = root
      .find(j.VariableDeclaration)
      .filter((path) => {
        return (
          path.node.declarations[0].init.callee &&
          path.node.declarations[0].init.callee.name ===
            "usePrefixedTranslation"
        );
      });

    usePrefixedTranslationVariableDeclaration
      .find(j.CallExpression)
      .forEach((node) => {
        node.value.callee.name = "useTranslation";
        keyPrefix = node.node.arguments[0].value;
        node.node.arguments = [];
      });

    usePrefixedTranslationVariableDeclaration
      .find(j.Identifier)
      .filter((path) => path.node.name === "prefixedT")
      .forEach((path) => {
        path.node.name = "t";
      });

    usePrefixedTranslationVariableDeclaration.insertAfter(
      `const keyPrefix = i18translation.${keyPrefix};`
    );
  };

  const fixTFunctionCall = () => {
    root
      .find(j.CallExpression)
      .filter((path) => path.node.callee.name === "prefixedT")
      .forEach((path) => {
        path.node.callee.name = "t";
        const tPath = path.value.arguments[0].value;

        if (tPath) {
          const newArgument = j.memberExpression(
            j.identifier("keyPrefix"),
            j.identifier(tPath)
          );

          path.value.arguments[0] = newArgument;
        }
      });
  };

  const didFindImport = fixImportAndInsertNewImport();

  if (didFindImport) {
    fixUseTranslationNameDeclaration();
    fixTFunctionCall();
  }

  return root.toSource({ quote: "single" });
}

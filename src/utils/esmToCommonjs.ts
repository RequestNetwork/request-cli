export function esmToCommonjs(code: string): string {
  // Convert import statements
  let modifiedCode = code.replace(
    /import\s+{\s*([^}]+)\s*}\s+from\s+['"](.+?)['"]/g,
    (match, imports, path) => {
      const cleanImports = imports
        .split(",")
        .map((i: string) => i.trim().split(" as "))
        .map(([name, alias]: [string, string]) =>
          alias ? `${name}: ${alias}` : name
        )
        .join(", ");
      return `const { ${cleanImports} } = require('${path}');`;
    }
  );

  // Convert export statements
  modifiedCode = modifiedCode.replace(
    /export\s+async\s+function\s+(\w+)/g,
    "async function $1"
  );
  modifiedCode = modifiedCode.replace(
    /export\s+function\s+(\w+)/g,
    "function $1"
  );

  // Add module.exports at the end of the file
  const exportedFunctions = Array.from(
    modifiedCode.matchAll(/(?:async\s+)?function\s+(\w+)/g)
  ).map((match) => match[1]);
  if (exportedFunctions.length > 0) {
    const exportStatements = exportedFunctions
      .map((name) => `  ${name},`)
      .join("\n");
    modifiedCode += `\nmodule.exports = {\n${exportStatements}\n};\n`;
  }

  return modifiedCode;
}

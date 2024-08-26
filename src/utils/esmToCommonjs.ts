export function esmToCommonjs(code: string): string {
  // Convert import statements
  code = code.replace(
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
  code = code.replace(
    /export\s+async\s+function\s+(\w+)/g,
    "async function $1"
  );
  code = code.replace(/export\s+function\s+(\w+)/g, "function $1");

  // Add module.exports at the end of the file
  const exportedFunctions = Array.from(
    code.matchAll(/(?:async\s+)?function\s+(\w+)/g)
  ).map((match) => match[1]);
  if (exportedFunctions.length > 0) {
    const exportStatements = exportedFunctions
      .map((name) => `  ${name},`)
      .join("\n");
    code += `\nmodule.exports = {\n${exportStatements}\n};\n`;
  }

  return code;
}

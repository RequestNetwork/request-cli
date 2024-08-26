import * as fs from "fs";
import * as path from "path";
import { removeTypes } from "remove-types";

import {
  prepareRequestJSDoc,
  createRequestJSDoc,
  payRequestJSDoc,
  persistInMemoryRequestJSDoc,
  getRequestByIDJSDoc,
  getRequestsByWalletAdderessJSDoc,
} from "./methods/jsDoc";
import {
  prepareRequestMethod,
  createRequestMethod,
  payRequestMethod,
  persistInMemoryRequestMethod,
  getRequestByIDMethod,
  getRequestsByWalletAdderessMethod,
} from "./methods";
import { typesContent } from "./types";
import { esmToCommonjs } from "./utils/esmToCommonjs";

interface FunctionInfo {
  implementation: string;
  jsDoc: string;
  imports: string[];
  packages: string[];
}

const functionInfoMap: { [key: string]: FunctionInfo } = {
  prepareRequest: {
    implementation: prepareRequestMethod,
    jsDoc: prepareRequestJSDoc,
    imports: ["RequestNetwork", "types"],
    packages: ["@requestnetwork/request-client.js"],
  },
  createRequest: {
    implementation: createRequestMethod,
    jsDoc: createRequestJSDoc,
    imports: ["RequestNetwork", "Web3SignatureProvider"],
    packages: [
      "@requestnetwork/request-client.js",
      "@requestnetwork/web3-signature",
    ],
  },
  payRequest: {
    implementation: payRequestMethod,
    jsDoc: payRequestJSDoc,
    imports: ["RequestPaymentProcessor", "RequestNetwork"],
    packages: [
      "@requestnetwork/request-client.js",
      "@requestnetwork/payment-processor",
    ],
  },
  persistInMemoryRequest: {
    implementation: persistInMemoryRequestMethod,
    jsDoc: persistInMemoryRequestJSDoc,
    imports: ["RequestNetwork"],
    packages: ["@requestnetwork/request-client.js"],
  },
  getRequestByID: {
    implementation: getRequestByIDMethod,
    jsDoc: getRequestByIDJSDoc,
    imports: ["RequestNetwork"],
    packages: ["@requestnetwork/request-client.js"],
  },
  getRequestsByWalletAdderess: {
    implementation: getRequestsByWalletAdderessMethod,
    jsDoc: getRequestsByWalletAdderessJSDoc,
    imports: ["RequestNetwork"],
    packages: ["@requestnetwork/request-client.js"],
  },
};

const imports: { [key: string]: string } = {
  RequestNetwork:
    "import { Types, Utils, RequestNetwork } from '@requestnetwork/request-client.js';",
  types: "import { Currency, IContentData } from './types';",
  Web3SignatureProvider:
    "import { Web3SignatureProvider } from '@requestnetwork/web3-signature';",
  RequestPaymentProcessor:
    "import {approveErc20, hasErc20Approval, hasSufficientFunds, payRequest as processPayment} from '@requestnetwork/payment-processor'",
};

export async function generateCode(
  selectedFunctions: string[],
  language: string,
  jsModuleType: "esm" | "cjs" = "esm"
): Promise<{ code: string; packages: Set<string> }> {
  const requiredImports = new Set<string>();
  const requiredPackages = new Set<string>();
  selectedFunctions.forEach((func) => {
    functionInfoMap[func].imports.forEach((imp) => requiredImports.add(imp));
    functionInfoMap[func].packages.forEach((pkg) => requiredPackages.add(pkg));
  });

  const importStatements = Array.from(requiredImports)
    .map((imp) => imports[imp])
    .join("\n");

  const selectedImplementations = selectedFunctions
    .map((func) => {
      const { jsDoc, implementation } = functionInfoMap[func];
      const cleanJsDoc = jsDoc
        .replace(`export const ${func}JSDoc = \`\n`, "")
        .replace("`;", "");
      return `${cleanJsDoc}\n${implementation}`;
    })
    .join("\n\n");

  let code = `${importStatements}\n\n${selectedImplementations}\n`;

  if (language === "javascript") {
    code = await removeTypes(code);
    if (jsModuleType === "cjs") {
      code = await esmToCommonjs(code);
    }
  }

  return { code, packages: requiredPackages };
}

export async function injectCode(
  injectionPath: string,
  selectedFunctions: string[],
  language: string,
  jsModuleType: "esm" | "cjs" = "esm"
): Promise<{ filePath: string; packages: Set<string> }> {
  const fullPath = path.join(process.cwd(), injectionPath, "requestNetwork");
  fs.mkdirSync(fullPath, { recursive: true });

  const fileName = `index.${language === "typescript" ? "ts" : "js"}`;
  const filePath = path.join(fullPath, fileName);

  const { code, packages } = await generateCode(
    selectedFunctions,
    language,
    jsModuleType
  );

  fs.writeFileSync(filePath, code);

  if (language === "typescript") {
    const typesDestPath = path.join(fullPath, "types", "index.ts");
    fs.mkdirSync(path.dirname(typesDestPath), { recursive: true });
    fs.writeFileSync(typesDestPath, typesContent.trim());
  }

  return { filePath, packages };
}

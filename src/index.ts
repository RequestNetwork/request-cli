#!/usr/bin/env node

// @ts-nocheck
import * as p from "@clack/prompts";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { injectCode } from "./injector";

async function main() {
  console.clear();
  p.intro(`Welcome to the Request Network Injector`);

  // Step 1: Check if running inside a project
  if (!fs.existsSync("package.json")) {
    p.note("This tool must be run inside a project with a package.json file.");
    process.exit(1);
  }

  // Step 2: Detect package manager
  const packageManager = await detectPackageManager();

  // Step 3: Show list of functions
  const functionOptions = [
    {
      value: "prepareRequest",
      label:
        "prepareRequest | Method to prepare the input needed to create a request",
    },
    { value: "createRequest", label: "createRequest | Create a request" },
    { value: "payRequest", label: "payRequest | Pay request" },
    {
      value: "persistInMemoryRequest",
      label: "persistInMemoryRequest | Persist in Memory requests",
    },
    {
      value: "getRequestByID",
      label: "getRequestByID | Get request data by request id",
    },
    {
      value: "getRequestsByWalletAdderess",
      label:
        "getRequestsByWalletAdderess | Get requests data that belong to a wallet address",
    },
  ];

  const defaultSelected = ["prepareRequest", "createRequest", "payRequest"];

  const selectedFunctions = await p.multiselect({
    message: "Select the functions you want to inject:",
    options: functionOptions,
    initialValues: defaultSelected,
  });

  // Step 4: Choose TypeScript or JavaScript
  const language = await p.select({
    message: "Choose the language:",
    options: [
      { value: "typescript", label: "TypeScript" },
      { value: "javascript", label: "JavaScript" },
    ],
  });

  let jsModuleType: "esm" | "cjs" = "esm";

  if (language === "javascript") {
    jsModuleType = await p.select({
      message: "Choose the JavaScript module type:",
      options: [
        { value: "esm", label: "ECMAScript Modules (ESM)" },
        { value: "cjs", label: "CommonJS" },
      ],
    });
  }

  // Step 5: Choose injection path
  const injectionPath = await p.text({
    message:
      "Enter the path where you want to inject the requestNetwork directory:",
    initialValue: "src",
    validate: (value) => {
      if (value.trim() === "") return "Path cannot be empty";
      return;
    },
  });

  // Step 6: Inject the code
  try {
    const { filePath, packages } = await injectCode(
      injectionPath,
      selectedFunctions,
      language,
      jsModuleType
    );
    p.note(
      `Request Network functionality has been successfully injected into your project at ${filePath}!`
    );

    // Step 7: Install necessary packages
    await installPackages(packageManager, packages);
  } catch (error) {
    p.note(`Error: Code injection failed. Details: ${error.message}`);
  }
}

async function detectPackageManager(): Promise<string> {
  const checkLockFile = (file: string) =>
    fs.existsSync(path.join(process.cwd(), file));

  if (checkLockFile("bun.lockb")) return "bun";
  if (checkLockFile("pnpm-lock.yaml")) return "pnpm";
  if (checkLockFile("yarn.lock")) return "yarn";
  if (checkLockFile("package-lock.json")) return "npm";

  return await p.select({
    message: "We couldn't detect your package manager. Please choose one:",
    options: [
      { value: "npm", label: "npm" },
      { value: "yarn", label: "Yarn" },
      { value: "pnpm", label: "pnpm" },
      { value: "bun", label: "Bun" },
    ],
  });
}

async function installPackages(packageManager: string, packages: Set<string>) {
  const installCommands = {
    bun: "bun add",
    pnpm: "pnpm add",
    yarn: "yarn add",
    npm: "npm install",
  };

  const installCommand = installCommands[packageManager];

  const spinner = p.spinner();
  spinner.start(`Installing packages using ${packageManager}`);

  try {
    await new Promise<void>((resolve, reject) => {
      exec(`${installCommand} ${Array.from(packages).join(" ")}`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    spinner.stop(`Packages installed successfully using ${packageManager}`);
  } catch (error) {
    spinner.stop(`Failed to install packages: ${error.message}`);
    throw error;
  }
}

main().catch(console.error);

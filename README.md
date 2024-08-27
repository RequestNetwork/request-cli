# Request Network Injector CLI

## Problem

Integrating the Request Network Protocol into your application can be a complex and time-consuming process, especially for new developers. It requires understanding the protocol, setting up the necessary dependencies, and implementing various functions to interact with the network.

## Solution

The Request Network Injector CLI simplifies this process by automatically injecting pre-built, customizable functions into your project. This tool allows both new and experienced builders to quickly integrate the Request Network Protocol into their applications with minimal setup.

## Features

- Automatic injection of essential Request Network functions
- Support for both TypeScript and JavaScript projects
- Customizable function selection
- Automatic package installation
- Support for various package managers (npm, yarn, pnpm, bun)

## How It Works

1. The CLI analyzes your project structure
2. You select the functions you want to inject
3. You choose your preferred language (TypeScript or JavaScript)
4. The tool injects the selected functions into your project
5. Necessary dependencies are automatically installed

## Usage

To use the Request Network Injector CLI, follow these steps:

1. Navigate to your project directory
2. Run the following command:

   ```
   npx request-cli
   ```

3. Follow the prompts to select your desired functions and configurations
4. The CLI will inject the code and install necessary dependencies

## Available Functions

- `prepareRequest`: Prepare the input needed to create a request
- `createRequest`: Create a new request
- `payRequest`: Pay an existing request
- `persistInMemoryRequest`: Persist in-memory requests
- `getRequestByID`: Get request data by request ID
- `getRequestsByWalletAddress`: Get requests data that belong to a wallet address

## Benefits

- Rapid integration of Request Network Protocol
- Reduced development time and complexity
- Customizable to fit your project needs
- Automatic setup of dependencies
- Supports multiple project configurations

Start building with the Request Network Protocol quickly and efficiently using the Request Network Injector CLI!

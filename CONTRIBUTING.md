# Contributing to @flowoverstack/uistate

First off, thank you for considering contributing to @flowoverstack/uistate! It's people like you that make our library such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the TypeScript styleguide
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Process

1. Fork the repo
2. Create a new branch from `main`
3. Make your changes
4. Run the tests (`npm test`)
5. Push to your fork and submit a pull request

### Setup Development Environment

```bash
# Clone your fork
git clone git@github.com:your-username/uistate.git

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Build the performance package
cd packages/performance
npm install
npm run build
```

### Project Structure

The project is organized into two main packages:

1. `@flowoverstack/uistate`: The core state management library
2. `@flowoverstack/uistate-performance`: Optional performance monitoring tools

Each package has its own:
- `package.json` with dependencies
- TypeScript configuration
- Build process
- Tests

### Coding Style

* 2 spaces for indentation
* Semicolons at the end of statements
* Single quotes for strings
* Trailing commas in objects and arrays
* Explicit type annotations for function parameters and return types

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

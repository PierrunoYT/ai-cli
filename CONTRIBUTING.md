# Contributing to CodeCraft

Thank you for your interest in contributing to CodeCraft! We welcome contributions from the community and appreciate your effort to make this project better.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it to understand the expectations for all contributors.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js >= 18.0.0
- npm, yarn, or pnpm (package manager)
- Git

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/codecraft.git
   cd codecraft
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branch Naming Conventions

Use descriptive branch names with prefixes:
- `feature/` - New features (e.g., `feature/add-config-support`)
- `fix/` - Bug fixes (e.g., `fix/resolve-parsing-error`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/simplify-cli-logic`)
- `test/` - Test additions or updates (e.g., `test/add-unit-tests`)

### Making Changes

1. **Write clear, atomic commits** - Each commit should represent a single logical change
2. **Follow coding standards** - Use ESLint and Prettier configurations
3. **Write or update tests** - Ensure your changes are covered by tests
4. **Update documentation** - If you add features, update the README and other relevant docs

### Running Tests and Linting

Before submitting your changes, make sure all tests pass and code is properly formatted:

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run type checking
npm run type-check

# Run tests
npm test

# Run build
npm run build
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This leads to more readable messages and helps with automated changelog generation.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Changes to build process or auxiliary tools
- `ci:` - Changes to CI configuration files and scripts

### Examples

```
feat(cli): add support for configuration files

Implement JSON and YAML configuration file parsing to allow
users to define default options in a config file.

Closes #123
```

```
fix(parser): handle edge case with empty input

Previously, empty input would cause a crash. Now it returns
an appropriate error message.
```

## Pull Request Process

1. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Link to related issues (e.g., "Closes #123")
   - Screenshots or examples if applicable

3. **Ensure CI passes** - All automated checks must pass

4. **Request review** - Wait for maintainers to review your PR

5. **Address feedback** - Make requested changes if needed

6. **Merge** - Once approved, a maintainer will merge your PR

## Coding Standards

- **TypeScript**: Use TypeScript for all source code
- **ESLint**: Follow the ESLint configuration in `.eslintrc.json`
- **Prettier**: Code formatting is handled by Prettier (`.prettierrc`)
- **Type Safety**: Avoid using `any` types when possible
- **Comments**: Add comments for complex logic, but prefer self-documenting code
- **Naming**: Use descriptive variable and function names

## Testing Guidelines

- Write unit tests for new features and bug fixes
- Aim for high test coverage (>80%)
- Test edge cases and error conditions
- Use descriptive test names that explain what is being tested

## Documentation

- Update the README.md if you add new features or change existing behavior
- Add JSDoc comments for public APIs
- Update CHANGELOG.md following the existing format
- Include code examples in documentation when helpful

## Questions or Need Help?

- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check the README and existing documentation first

Thank you for contributing to CodeCraft! 🚀

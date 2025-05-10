# Contributing Guidelines

## Pull Request Title Format

When creating pull requests, please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for your PR titles. The PR title should be prefixed with one of the following types:

- `feat`: A new feature
- `fix`: A bug fix
- `chore`: Other changes that don't modify src or test files

Example PR titles:
- feat: add support for AWS CDK v2.x
- fix: resolve dependency conflicts
- chore: update documentation

For this project, we enforce these prefixes through our CI pipeline using the semantic-pull-request action.
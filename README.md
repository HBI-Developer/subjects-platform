# subjects-platform

React + TypeScript + Vite app with Firebase (hosting, firestore, functions).

## Tooling

- [Biome](https://biomejs.dev/) handles linting, formatting, and import sorting (`biome.json`).
- [Knip](https://knip.dev/) finds unused files, dependencies, and exports (`knip.json`).

## Scripts

| Script         | Command                  |
| -------------- | ------------------------ |
| `pnpm dev`     | Start the dev server     |
| `pnpm build`   | Typecheck and build      |
| `pnpm lint`    | `biome check .`          |
| `pnpm lint:fix`| `biome check --write .`  |
| `pnpm format`  | `biome format --write .` |
| `pnpm knip`    | Find unused code/deps    |
| `pnpm check`   | Biome check + Knip       |
| `pnpm preview` | Preview the build        |

## React Compiler

The React Compiler is not enabled because of its impact on dev & build performance. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

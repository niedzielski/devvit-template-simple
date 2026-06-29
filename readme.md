# devvit-template-simple

A practical Devvit app template with few dependencies. A little simpler at the expense of a little code.

## Features

- A plain Node.js server with front and backend typing.
- Tests using the builtin Node.js test runner.
- Promise misuse linter.
- Formatter and bundler.
- TypeScript project skeleton split by environment (frontend, backend, test, etc).

## NPM Scripts

- `npm run playtest [r/sub]`: primary dev loop; watches changes, builds, uploads, and installs. Accepts an optional subreddit.
- `npm run build`: builds client and server, including esbuild metafiles.
- `npm run test`: runs all tests.
- `npm run lint`: checks lints and formatting.
- `npm run format`: fixes lints and formatting.
- `npm run clean`: removes build outputs.
- `npm run publish`: cleans, builds, uploads, and files a new app review request.
- `npm run watch`: monitors changes and rebuilds.

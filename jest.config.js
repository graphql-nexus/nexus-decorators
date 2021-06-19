// @ts-check
/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 *
 *
 * @type {import('jest').C}
 */

/**
 * @type {import('@jest/types/build/Config').GlobalConfig}
 */
module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  transform: {
    "^.+\\.ts$": "jest-esbuild",
  },
};

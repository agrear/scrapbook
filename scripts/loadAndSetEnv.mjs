/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { loadEnv } from 'vite';

/**
 * Load variables from `.env.[mode]` files in cwd
 * and set it to `process.env`
 *
 * @param {string} mode
 * @param {string} cwd
 *
 * @return {void}
 */
export function loadAndSetEnv(mode, cwd) {
  const env = loadEnv(mode, cwd);
  for (const envKey in env) {
    if (
      process.env[envKey] === undefined &&
      Object.prototype.hasOwnProperty.call(env, envKey)
    ) {
      process.env[envKey] = env[envKey];
    }
  }
}

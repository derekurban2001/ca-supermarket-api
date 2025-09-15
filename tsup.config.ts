import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  sourcemap: true,
  clean: true,
  dts: true,
  minify: false,
  skipNodeModulesBundle: true,
  tsconfig: 'tsconfig.build.json'
});

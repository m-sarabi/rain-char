import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/RainChar.js'),
            name: 'RainChar', // The name for the UMD global variable
            formats: ['es', 'umd'],
            fileName: (format) => `rain-char.${format}.js`,
        },
        sourcemap: true,
        rollupOptions: {
            external: [],
            output: {
                globals: {},
            },
        },
    },
});
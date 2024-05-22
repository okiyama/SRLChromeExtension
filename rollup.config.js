import { chromeExtension } from 'rollup-plugin-chrome-extension'

export default {
    input: 'manifest.json',
    output: {
        dir: 'dist',
        format: 'esm',
    },
    plugins: [
        // always put chromeExtension() before other plugins
        chromeExtension(),
    ],
}
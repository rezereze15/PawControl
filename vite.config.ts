
import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, lazyPlugins } from 'vite-plus';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';

// This PC's LAN IP, so a phone on the same network can load the dev assets.
// Detected on each `npm run dev` (Wi-Fi adapter preferred) so a new IP from the
// router doesn't leave pages blank. Override with DEV_HOST=x.x.x.x if needed.
function detectLanIp(): string {
    const nets = Object.entries(networkInterfaces());
    const ipv4 = (name: string) =>
        (nets.find(([n]) => n === name)?.[1] ?? []).find(
            (a) => a.family === 'IPv4' && !a.internal,
        )?.address;
    const wifi = nets.find(([n]) => /wi-?fi|wlan/i.test(n))?.[0];
    if (wifi && ipv4(wifi)) return ipv4(wifi)!;
    for (const [name] of nets) {
        if (/virtual|vethernet|vmware|bluetooth|loopback/i.test(name)) continue;
        const ip = ipv4(name);
        if (ip && !ip.startsWith('169.254.')) return ip;
    }
    return 'localhost';
}

const DEV_HOST = process.env.DEV_HOST || detectLanIp();

export default defineConfig({
    plugins: lazyPlugins(() => [
        laravel({
            input: ['resources/css/landingpage.css', 'resources/js/app.jsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    // 700 gives bold/extrabold headings a real bold face instead of a browser-faked one.
                    weights: [400, 500, 600, 700],
                }),
                bunny('Plus Jakarta Sans', {
                    weights: [500, 600],
                    fallbacks: ['system-ui', 'sans-serif'],
                }),
            ],
        }),
        inertia(),
        react(),
        babel({
            presets: [reactCompilerPreset()],
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ]),
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        origin: `http://${DEV_HOST}:5173`,
        hmr: {
            host: DEV_HOST,
        },
        // Pages may be opened as localhost (PC) or the Wi-Fi IP (phone); both may load dev assets.
        cors: {
            origin: [
                /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/,
                `http://${DEV_HOST}:8000`,
            ],
        },
        watch: {
            ignored: [
                '**/.agents/**',
                '**/.claude/**',
                '**/.cursor/**',
                '**/.junie/**',
                '**/vendor/**',
            ],
        },
    },
    lint: {
        ignorePatterns: [
            'vendor/**',
            'node_modules/**',
            'public/**',
            'bootstrap/ssr/**',
            'tailwind.config.js',
            'resources/js/actions/**',
            'resources/js/components/ui/*',
            'resources/js/routes/**',
            'resources/js/wayfinder/**',
        ],
        options: {
            denyWarnings: true,
            typeAware: true,
        },
    },
    fmt: {
        printWidth: 80,
        tabWidth: 4,
        singleQuote: true,
        semi: true,
        singleAttributePerLine: false,
        htmlWhitespaceSensitivity: 'css',
        ignorePatterns: [
            '.github/**',
            'composer.json',
            'resources/js/components/ui/*',
            'resources/views/mail/*',
        ],
        sortTailwindcss: {
            functions: ['clsx', 'cn', 'cva'],
            entryPoint: 'resources/css/landingpage.css',
        },
    },
});

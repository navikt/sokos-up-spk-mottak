import { resolve } from "node:path";
import terser from "@rollup/plugin-terser";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import EnvironmentPlugin from "vite-plugin-environment";

export default defineConfig(({ mode }) => ({
	base: "/spk-mottak",
	build: {
		rollupOptions: {
			input: resolve(__dirname, "src/App.tsx"),
			preserveEntrySignatures: "exports-only",
			external: ["react", "react-dom"],
			output: {
				entryFileNames: "bundle.js",
				format: "esm",
			},
		},
	},
	css: {
		modules: {
			generateScopedName: "[name]__[local]___[hash:base64:5]",
		},
	},
	server: {
		proxy: {
			...((mode === "backend" || /^.*-q1$/.test(mode)) && {
				"/spk-mottak-api/api/v1": {
					target: /^.*-q1$/.test(mode)
						? "https://sokos-spk-mottak.intern.dev.nav.no"
						: "http://localhost:8080",
					rewrite: (path: string) => path.replace(/^\/spk-mottak-api/, ""),
					changeOrigin: true,
					secure: /^.*-q1$/.test(mode),
				},
			}),
			...(mode === "mock" && {
				"/mockServiceWorker.js": {
					target: "http://localhost:5173",
					rewrite: () => "spk-mottak/mockServiceWorker.js",
				},
			}),
		},
	},
	plugins: [
		react(),
		cssInjectedByJsPlugin(),
		EnvironmentPlugin({
			NODE_ENV: process.env.NODE_ENV || "development",
		}),
		terser(),
	],
}));

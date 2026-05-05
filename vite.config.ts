import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, esmExternalRequirePlugin } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig(({ mode }) => ({
	base: "/spk-mottak",
	build: {
		rolldownOptions: {
			input: resolve(import.meta.dirname, "src/App.tsx"),
			preserveEntrySignatures: "exports-only",
			plugins: [
				esmExternalRequirePlugin({
					external: ["react", "react-dom"],
				}),
			],
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
	plugins: [react(), cssInjectedByJsPlugin()],
}));

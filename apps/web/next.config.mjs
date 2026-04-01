import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	turbopack: {
		root: configDir,
	},
	...(process.env.WEB_E2E_NEXT_DIST_DIR
		? { distDir: process.env.WEB_E2E_NEXT_DIST_DIR }
		: {}),
};

export default nextConfig;

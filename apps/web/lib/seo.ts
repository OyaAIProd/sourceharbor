import type { Metadata } from "next";

type SeoRoute =
	| "dashboard"
	| "ops"
	| "settings"
	| "mcp"
	| "knowledge"
	| "ingestRuns"
	| "search"
	| "watchlists"
	| "trends"
	| "proof"
	| "playground"
	| "jobs"
	| "useCases";

const CORE_KEYWORDS = [
	"SourceHarbor",
	"AI knowledge control tower",
	"AI knowledge pipeline",
	"operator command center",
	"grounded retrieval",
	"evidence bundle",
	"MCP server",
	"Model Context Protocol",
	"Codex workflow",
	"Claude Code workflow",
];

const ROUTE_KEYWORDS: Record<SeoRoute, string[]> = {
	dashboard: [
		"AI operator dashboard",
		"knowledge intake",
		"retrieval front door",
		"builder command center",
	],
	ops: [
		"Ops inbox",
		"delivery readiness",
		"provider health",
		"AI workflow triage",
	],
	settings: [
		"notification delivery",
		"alert configuration",
		"daily digest settings",
	],
	mcp: [
		"MCP quickstart",
		"agent control plane",
		"Codex MCP",
		"Claude Code MCP",
	],
	knowledge: [
		"knowledge cards",
		"AI research memory",
		"job-linked evidence",
	],
	ingestRuns: [
		"ingest ledger",
		"source intake",
		"pipeline intake trace",
	],
	search: [
		"grounded search",
		"Ask your sources",
		"retrieval API",
		"citation-first AI",
	],
	watchlists: [
		"AI trend watchlist",
		"Codex updates tracking",
		"Claude Code tracking",
		"compounder workflow",
	],
	trends: [
		"cross-run trend",
		"topic diff",
		"claim change tracking",
		"AI workflow trend",
	],
	proof: [
		"proof boundary",
		"runtime proof",
		"local supervisor proof",
		"release readiness",
	],
	playground: [
		"sample playground",
		"demo corpus",
		"evidence bundle example",
	],
	jobs: [
		"job trace",
		"pipeline trace",
		"run compare",
		"artifact index",
	],
	useCases: [
		"AI research pipeline",
		"builder workflow",
		"Codex use case",
		"Claude Code use case",
	],
};

function dedupeKeywords(keywords: string[]): string[] {
	return [...new Set(keywords.map((item) => item.trim()).filter(Boolean))];
}

export function buildProductMetadata({
	title,
	description,
	route,
	keywords = [],
}: {
	title: string;
	description?: string;
	route: SeoRoute;
	keywords?: string[];
}): Metadata {
	const mergedKeywords = dedupeKeywords([
		...CORE_KEYWORDS,
		...ROUTE_KEYWORDS[route],
		...keywords,
	]);

	return {
		title,
		description,
		keywords: mergedKeywords,
		category: "software",
		openGraph: {
			title,
			description,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
	};
}

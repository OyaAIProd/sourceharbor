import { describe, expect, it } from "vitest";

import { metadata as askMetadata } from "@/app/ask/page";
import { metadata as feedMetadata } from "@/app/feed/page";
import { metadata as jobsMetadata } from "@/app/jobs/page";
import { metadata as mcpMetadata } from "@/app/mcp/page";
import { metadata as playgroundMetadata } from "@/app/playground/page";
import { metadata as proofMetadata } from "@/app/proof/page";
import { metadata as searchMetadata } from "@/app/search/page";
import { metadata as subscriptionsMetadata } from "@/app/subscriptions/page";
import { metadata as trendsMetadata } from "@/app/trends/page";
import { generateMetadata as generateUseCaseMetadata } from "@/app/use-cases/[slug]/page";
import { metadata as watchlistsMetadata } from "@/app/watchlists/page";
import { buildAppShellMetadata } from "@/lib/seo";

function toKeywordList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.filter((item): item is string => typeof item === "string");
	}
	if (typeof value === "string") {
		return value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return [];
}

describe("route metadata", () => {
	it("keeps app-shell metadata aligned to the command-center control-tower story", () => {
		const metadata = buildAppShellMetadata();

		expect(metadata.title).toMatchObject({
			default: "SourceHarbor Command Center",
		});
		expect(metadata.description).toMatch(/AI knowledge control tower/i);
		expect(toKeywordList(metadata.keywords)).toEqual(
			expect.arrayContaining([
				"AI knowledge control tower",
				"MCP server",
				"AI coding agent",
				"agentic coding workflow",
				"Codex workflow",
				"Codex MCP server",
				"Claude Code workflow",
				"Claude Code MCP server",
				"job trace",
				"evidence bundle",
			]),
		);
	});

	it("keeps search and ask metadata grounded, retrieval-first, and keyword-rich", () => {
		expect(searchMetadata.title).toBe("Search");
		expect(searchMetadata.description).toMatch(/Grounded search/i);
		expect(toKeywordList(searchMetadata.keywords)).toEqual(
			expect.arrayContaining([
				"grounded search",
				"retrieval API",
				"citation-first AI",
				"AI search for source artifacts",
				"Codex workflow",
				"Claude Code workflow",
			]),
		);

		expect(askMetadata.title).toBe("Ask your sources");
		expect(askMetadata.description).toMatch(/Wave 1 Ask MVP/i);
		expect(toKeywordList(askMetadata.keywords)).toEqual(
			expect.arrayContaining([
				"Ask your sources",
				"grounded Ask",
				"citation-first Ask",
				"MCP server",
			]),
		);
	});

	it("keeps MCP/feed/subscriptions metadata on the same product line", () => {
		expect(mcpMetadata.title).toBe("MCP");
		expect(mcpMetadata.description).toMatch(/MCP quickstart/i);
		expect(toKeywordList(mcpMetadata.keywords)).toEqual(
			expect.arrayContaining([
				"MCP quickstart",
				"Codex MCP",
				"Claude Code MCP",
				"agentic coding control plane",
			]),
		);

		expect(feedMetadata.title).toBe("Digest Feed");
		expect(feedMetadata.description).toMatch(/digest feed/i);
		expect(toKeywordList(feedMetadata.keywords)).toEqual(
			expect.arrayContaining([
				"digest feed",
				"reading flow",
				"operator reading pane",
			]),
		);

		expect(subscriptionsMetadata.title).toBe("Subscriptions");
		expect(subscriptionsMetadata.description).toMatch(/subscription/i);
		expect(toKeywordList(subscriptionsMetadata.keywords)).toEqual(
			expect.arrayContaining([
				"source subscriptions",
				"source intake settings",
				"subscription control plane",
			]),
		);
	});

	it("keeps use-case metadata ready for promised params and ecosystem keywords", async () => {
		const metadata = await generateUseCaseMetadata({
			params: Promise.resolve({ slug: "claude-code" }),
		});

		expect(metadata.title).toBe("Claude Code workflow");
		expect(metadata.description).toMatch(/Claude Code-style local workflows/i);
		expect(toKeywordList(metadata.keywords)).toEqual(
			expect.arrayContaining([
				"Claude Code workflow",
				"Claude Code MCP",
				"Codex workflow",
				"AI coding workflow",
				"AI research pipeline",
			]),
		);
	});

	it("keeps compounder and proof metadata aligned to the reusable control-tower story", () => {
		expect(watchlistsMetadata.title).toBe("Watchlists");
		expect(watchlistsMetadata.description).toMatch(/watchlists/i);
		expect(toKeywordList(watchlistsMetadata.keywords)).toEqual(
			expect.arrayContaining([
				"AI trend watchlist",
				"Codex updates tracking",
				"Claude Code tracking",
			]),
		);

		expect(trendsMetadata.title).toBe("Trends");
		expect(trendsMetadata.description).toMatch(/Cross-run trend/i);
		expect(toKeywordList(trendsMetadata.keywords)).toEqual(
			expect.arrayContaining([
				"cross-run trend",
				"topic diff",
				"AI workflow trend",
			]),
		);

		expect(proofMetadata.title).toBe("Proof");
		expect(proofMetadata.description).toMatch(/proof boundary/i);
		expect(toKeywordList(proofMetadata.keywords)).toEqual(
			expect.arrayContaining([
				"proof boundary",
				"local supervisor proof",
				"release readiness",
			]),
		);

		expect(playgroundMetadata.title).toBe("Playground");
		expect(playgroundMetadata.description).toMatch(/sample corpus/i);
		expect(toKeywordList(playgroundMetadata.keywords)).toEqual(
			expect.arrayContaining([
				"sample playground",
				"demo corpus",
				"evidence bundle example",
			]),
		);

		expect(jobsMetadata.title).toBe("Job Trace");
		expect(jobsMetadata.description).toMatch(/job trace/i);
		expect(toKeywordList(jobsMetadata.keywords)).toEqual(
			expect.arrayContaining(["job trace", "pipeline trace", "artifact index"]),
		);
	});
});

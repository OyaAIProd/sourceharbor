import { describe, expect, it } from "vitest";

import { metadata as askMetadata } from "@/app/ask/page";
import { metadata as feedMetadata } from "@/app/feed/page";
import { metadata as mcpMetadata } from "@/app/mcp/page";
import { metadata as searchMetadata } from "@/app/search/page";
import { metadata as subscriptionsMetadata } from "@/app/subscriptions/page";
import { generateMetadata as generateUseCaseMetadata } from "@/app/use-cases/[slug]/page";

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
	it("keeps search and ask metadata grounded, retrieval-first, and keyword-rich", () => {
		expect(searchMetadata.title).toBe("Search");
		expect(searchMetadata.description).toMatch(/Grounded search/i);
		expect(toKeywordList(searchMetadata.keywords)).toEqual(
			expect.arrayContaining([
				"grounded search",
				"retrieval API",
				"citation-first AI",
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
				"AI research pipeline",
			]),
		);
	});
});

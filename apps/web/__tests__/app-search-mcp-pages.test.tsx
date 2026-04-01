import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AskPage from "@/app/ask/page";
import McpPage from "@/app/mcp/page";
import SearchPage from "@/app/search/page";

const mockSearchRetrieval = vi.fn();

vi.mock("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: React.ReactNode;
	}) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));

vi.mock("@/lib/api/client", () => ({
	apiClient: {
		searchRetrieval: (...args: unknown[]) => mockSearchRetrieval(...args),
	},
}));

describe("search and MCP front doors", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders grounded search results with citation jumps", async () => {
		mockSearchRetrieval.mockResolvedValue({
			query: "agent workflows",
			top_k: 8,
			filters: { platform: "youtube" },
			items: [
				{
					job_id: "job-1",
					video_id: "video-1",
					platform: "youtube",
					video_uid: "vid-1",
					source_url: "https://www.youtube.com/watch?v=abc",
					title: "AI Weekly",
					kind: "video_digest_v1",
					mode: "full",
					source: "knowledge_cards",
					snippet: "Agent workflows with retry and review loops.",
					score: 2.4,
				},
			],
		});

		render(
			await SearchPage({
				searchParams: {
					q: "agent workflows",
					mode: "keyword",
				},
			}),
		);

		expect(mockSearchRetrieval).toHaveBeenCalledWith({
			query: "agent workflows",
			mode: "keyword",
			top_k: 8,
			filters: {},
		});
		expect(screen.getByRole("heading", { name: "Search" })).toBeInTheDocument();
		expect(screen.getByText("AI Weekly")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Open job trace" }),
		).toHaveAttribute("href", "/jobs?job_id=job-1");
		expect(
			screen.getByRole("link", { name: "Open knowledge cards" }),
		).toHaveAttribute("href", "/knowledge?job_id=job-1");
		expect(
			screen.getByRole("link", { name: "Open feed entry" }),
		).toHaveAttribute("href", "/feed?item=job-1");
	});

	it("renders Ask truthful MVP without pretending a generated answer exists", async () => {
		mockSearchRetrieval.mockResolvedValue({
			query: "What changed this week?",
			top_k: 6,
			filters: {},
			items: [],
		});

		render(
			await AskPage({
				searchParams: {
					question: "What changed this week?",
					mode: "keyword",
				},
			}),
		);

		expect(mockSearchRetrieval).toHaveBeenCalledWith({
			query: "What changed this week?",
			mode: "keyword",
			top_k: 6,
		});
		expect(
			screen.getByRole("heading", { name: "Ask your sources" }),
		).toBeInTheDocument();
		expect(
			screen.getByText(/Current contract: retrieval-first, citation-first/i),
		).toBeInTheDocument();
		expect(screen.getByText(/No cited evidence yet/i)).toBeInTheDocument();
	});

	it("renders MCP quickstart with real startup commands and tool examples", () => {
		render(<McpPage />);

		expect(
			screen.getByRole("heading", { name: "MCP Quickstart" }),
		).toBeInTheDocument();
		expect(screen.getByText("./bin/dev-mcp")).toBeInTheDocument();
		expect(
			screen.getByText("sourceharbor.retrieval.search"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Open Search" }),
		).toHaveAttribute("href", "/search");
		expect(screen.getByRole("link", { name: "Open Ask" })).toHaveAttribute(
			"href",
			"/ask",
		);
	});
});

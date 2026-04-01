import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PlaygroundPage from "@/app/playground/page";
import TrendsPage from "@/app/trends/page";
import { default as UseCasePage } from "@/app/use-cases/[slug]/page";
import WatchlistsPage from "@/app/watchlists/page";

const mockListWatchlists = vi.fn();
const mockGetWatchlistTrend = vi.fn();
const mockGetOpsInbox = vi.fn();

vi.mock("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: AnchorHTMLAttributes<HTMLAnchorElement> & {
		href: string;
		children: ReactNode;
	}) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));

vi.mock("@/lib/api/client", () => ({
	apiClient: {
		listWatchlists: (...args: unknown[]) => mockListWatchlists(...args),
		getWatchlistTrend: (...args: unknown[]) => mockGetWatchlistTrend(...args),
		getOpsInbox: (...args: unknown[]) => mockGetOpsInbox(...args),
	},
}));

describe("compounder pages", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockListWatchlists.mockResolvedValue([
			{
				id: "wl-1",
				name: "Retry policy",
				matcher_type: "topic_key",
				matcher_value: "retry-policy",
				delivery_channel: "dashboard",
				enabled: true,
				created_at: "2026-03-31T10:00:00Z",
				updated_at: "2026-03-31T10:00:00Z",
			},
		]);
		mockGetWatchlistTrend.mockResolvedValue({
			watchlist: {
				id: "wl-1",
				name: "Retry policy",
				matcher_type: "topic_key",
				matcher_value: "retry-policy",
				delivery_channel: "dashboard",
				enabled: true,
				created_at: "2026-03-31T10:00:00Z",
				updated_at: "2026-03-31T10:00:00Z",
			},
			summary: {
				recent_runs: 2,
				matched_cards: 4,
				matcher_type: "topic_key",
				matcher_value: "retry-policy",
			},
			timeline: [
				{
					job_id: "job-1",
					video_id: "video-1",
					platform: "youtube",
					title: "AI Weekly",
					source_url: "https://example.com",
					created_at: "2026-03-31T10:00:00Z",
					matched_card_count: 2,
					cards: [],
					topics: ["retry-policy"],
					claim_kinds: ["recommendation"],
					added_topics: ["retry-policy"],
					removed_topics: [],
					added_claim_kinds: ["recommendation"],
					removed_claim_kinds: [],
				},
			],
		});
		mockGetOpsInbox.mockResolvedValue({
			gates: {
				notifications: {
					status: "blocked",
					summary:
						"Notification send paths exist, but live delivery is blocked by missing Resend secrets.",
					next_step: "Provide RESEND_API_KEY.",
					details: {},
				},
			},
		});
	});

	it("renders watchlists page with persistent objects and readiness hint", async () => {
		render(
			await WatchlistsPage({
				searchParams: { watchlist_id: "wl-1" },
			}),
		);

		expect(
			screen.getByRole("heading", { name: "Watchlists" }),
		).toBeInTheDocument();
		expect(screen.getByText("Retry policy")).toBeInTheDocument();
		expect(
			screen.getByText(
				/Notification send paths exist, but live delivery is blocked/i,
			),
		).toBeInTheDocument();
	});

	it("renders trend page from real watchlist trend payload", async () => {
		render(
			await TrendsPage({
				searchParams: { watchlist_id: "wl-1" },
			}),
		);

		expect(
			screen.getByRole("heading", { name: "Cross-run trend" }),
		).toBeInTheDocument();
		expect(screen.getByText("AI Weekly")).toBeInTheDocument();
		expect(screen.getByText(/Added topics: retry-policy/i)).toBeInTheDocument();
	});

	it("renders read-only playground as sample-labeled surface", async () => {
		render(await PlaygroundPage());

		expect(
			screen.getByRole("heading", { name: "Read-only sample playground" }),
		).toBeInTheDocument();
		expect(screen.getByText(/Sample boundary/i)).toBeInTheDocument();
	});

	it("renders truthful use-case page", async () => {
		render(
			await UseCasePage({
				params: Promise.resolve({ slug: "youtube" }),
			}),
		);

		expect(
			screen.getByRole("heading", { name: "YouTube to AI digest" }),
		).toBeInTheDocument();
		expect(screen.getByText(/discoverability surfaces/i)).toBeInTheDocument();
	});
});

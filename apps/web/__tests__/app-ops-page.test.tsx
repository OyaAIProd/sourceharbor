import type { AnchorHTMLAttributes, ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OpsPage from "@/app/ops/page";

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
		getOpsInbox: (...args: unknown[]) => mockGetOpsInbox(...args),
	},
}));

describe("ops inbox page", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the ops inbox with aggregated diagnostics", async () => {
		mockGetOpsInbox.mockResolvedValue({
			generated_at: "2026-03-31T10:00:00Z",
			overview: {
				attention_items: 3,
				failed_jobs: 1,
				failed_ingest_runs: 1,
				notification_or_gate_issues: 2,
			},
			failed_jobs: {
				status: "ok",
				total: 1,
				error: null,
				items: [
					{
						id: "job-1",
						title: "AI Weekly",
						platform: "youtube",
						status: "failed",
						pipeline_final_status: "failed",
						error_message: "llm step failed",
						degradation_count: 0,
						updated_at: "2026-03-31T09:30:00Z",
					},
				],
			},
			failed_ingest_runs: {
				status: "ok",
				total: 1,
				error: null,
				items: [],
			},
			notification_deliveries: {
				status: "ok",
				total: 0,
				error: null,
				items: [],
			},
			provider_health: {
				window_hours: 24,
				providers: [
					{
						provider: "gemini",
						ok: 0,
						warn: 1,
						fail: 0,
						last_status: "warn",
						last_checked_at: "2026-03-31T09:40:00Z",
						last_error_kind: "timeout",
						last_message: "Provider timeout",
					},
				],
			},
			gates: {
				retrieval: {
					status: "blocked",
					summary:
						"Retrieval routes are alive, but the current corpus is still effectively empty.",
					next_step: "Seed one real job.",
					details: {},
				},
				notifications: {
					status: "blocked",
					summary:
						"Notification send paths exist, but live delivery is blocked by missing Resend secrets.",
					next_step: "Provide RESEND_API_KEY.",
					details: {},
				},
				ui_audit: {
					status: "ready",
					summary: "Base UI audit is ready today.",
					next_step: "Use a valid artifact root.",
					details: {},
				},
				computer_use: {
					status: "blocked",
					summary:
						"Computer use is implemented, but the live run is currently blocked by a missing Gemini API key.",
					next_step: "Provide GEMINI_API_KEY.",
					details: {},
				},
			},
			inbox_items: [
				{
					kind: "job_failed",
					severity: "critical",
					title: "AI Weekly",
					detail: "llm step failed",
					status_label: "failed",
					last_seen_at: "2026-03-31T09:30:00Z",
					href: "/jobs?job_id=job-1",
					action_label: "查看任务",
				},
			],
		});

		render(await OpsPage());

		expect(screen.getByRole("heading", { name: "运营诊断" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Ops inbox" })).toBeInTheDocument();
		expect(screen.getByText("AI Weekly")).toBeInTheDocument();
		expect(
			screen.getByText(
				/Retrieval routes are alive, but the current corpus is still effectively empty/i,
			),
		).toBeInTheDocument();
		expect(screen.getByText("Provider timeout")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "查看任务 →" })).toHaveAttribute(
			"href",
			"/jobs?job_id=job-1",
		);
	});
});

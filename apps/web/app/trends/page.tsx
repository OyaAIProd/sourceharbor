import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import { getLocaleMessages } from "@/lib/i18n/messages";
import {
	resolveSearchParams,
	type SearchParamsInput,
} from "@/lib/search-params";

export const metadata: Metadata = {
	title: "Trends",
	description:
		"Cross-run trend and diff view for recent watchlist matches across jobs and knowledge cards.",
};

type TrendsPageProps = {
	searchParams?: SearchParamsInput;
};

export default async function TrendsPage({ searchParams }: TrendsPageProps) {
	const copy = getLocaleMessages().trendsPage;
	const { watchlist_id: watchlistId } = await resolveSearchParams(
		searchParams,
		["watchlist_id"] as const,
	);
	const watchlists = await apiClient.listWatchlists().catch(() => []);
	const selectedWatchlist =
		watchlists.find((item) => item.id === watchlistId.trim()) ??
		watchlists[0] ??
		null;
	const trend = selectedWatchlist
		? await apiClient
				.getWatchlistTrend(selectedWatchlist.id, {
					limit_runs: 4,
					limit_cards: 16,
				})
				.catch(() => null)
		: null;

	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">SourceHarbor Trends</p>
				<h1 className="folo-page-title" data-route-heading>
					Cross-run trend
				</h1>
				<p className="folo-page-subtitle">{copy.heroSubtitle}</p>
			</div>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<CardTitle>Choose a watchlist</CardTitle>
					<CardDescription>{copy.chooseDescription}</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					{watchlists.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							{copy.empty}
						</p>
					) : (
						watchlists.map((item) => (
							<Button
								key={item.id}
								asChild
								variant={selectedWatchlist?.id === item.id ? "hero" : "outline"}
								size="sm"
							>
								<Link
									href={`/trends?watchlist_id=${encodeURIComponent(item.id)}`}
								>
									{item.name}
								</Link>
							</Button>
						))
					)}
				</CardContent>
			</Card>

			{selectedWatchlist && trend ? (
				<Card className="folo-surface border-border/70">
					<CardHeader>
						<CardTitle>{selectedWatchlist.name}</CardTitle>
						<CardDescription>
							Matcher: {trend.summary.matcher_type} ={" "}
							<code>{trend.summary.matcher_value}</code> · Recent runs:{" "}
							{trend.summary.recent_runs} · Matched cards:{" "}
							{trend.summary.matched_cards}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{trend.timeline.map((run) => (
							<div
								key={run.job_id}
								className="rounded-lg border border-border/60 bg-muted/20 p-4"
							>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div className="space-y-1">
										<p className="font-medium">{run.title}</p>
										<p className="text-sm text-muted-foreground">
											{run.platform} · {formatDateTime(run.created_at)} ·
											matched cards: {run.matched_card_count}
										</p>
									</div>
									<div className="flex flex-wrap gap-3">
										<Button
											asChild
											variant="link"
											size="sm"
											className="h-auto px-0"
										>
											<Link
												href={`/jobs?job_id=${encodeURIComponent(run.job_id)}`}
											>
												Open job
											</Link>
										</Button>
										<Button
											asChild
											variant="link"
											size="sm"
											className="h-auto px-0"
										>
											<Link
												href={`/knowledge?job_id=${encodeURIComponent(run.job_id)}`}
											>
												Open knowledge
											</Link>
										</Button>
									</div>
								</div>
								<div className="mt-3 grid gap-2 text-sm text-muted-foreground lg:grid-cols-2">
									<p>Added topics: {run.added_topics.join(", ") || "none"}</p>
									<p>
										Removed topics: {run.removed_topics.join(", ") || "none"}
									</p>
									<p>
										Added claim kinds:{" "}
										{run.added_claim_kinds.join(", ") || "none"}
									</p>
									<p>
										Removed claim kinds:{" "}
										{run.removed_claim_kinds.join(", ") || "none"}
									</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}

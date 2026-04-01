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
import { buildProductMetadata } from "@/lib/seo";

const trendsCopy = getLocaleMessages().trendsPage;

export const metadata: Metadata = buildProductMetadata({
	title: trendsCopy.metadataTitle,
	description: trendsCopy.metadataDescription,
	route: "trends",
});

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
				<p className="folo-page-kicker">{copy.kicker}</p>
				<h1 className="folo-page-title" data-route-heading>
					{copy.heroTitle}
				</h1>
				<p className="folo-page-subtitle">{copy.heroSubtitle}</p>
			</div>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<CardTitle>{copy.chooseTitle}</CardTitle>
					<CardDescription>{copy.chooseDescription}</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					{watchlists.length === 0 ? (
						<p className="text-sm text-muted-foreground">{copy.empty}</p>
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
							{copy.matcherLabel}: {trend.summary.matcher_type} ={" "}
							<code>{trend.summary.matcher_value}</code> ·{" "}
							{copy.recentRunsLabel}: {trend.summary.recent_runs} ·{" "}
							{copy.matchedCardsLabel}: {trend.summary.matched_cards}
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
											{run.platform} · {formatDateTime(run.created_at)} ·{" "}
											{copy.matchedCardsLabel}: {run.matched_card_count}
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
												{copy.openJobButton}
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
												{copy.openKnowledgeButton}
											</Link>
										</Button>
									</div>
								</div>
								<div className="mt-3 grid gap-2 text-sm text-muted-foreground lg:grid-cols-2">
									<p>
										{copy.addedTopicsPrefix}:{" "}
										{run.added_topics.join(", ") || copy.noneValue}
									</p>
									<p>
										{copy.removedTopicsPrefix}:{" "}
										{run.removed_topics.join(", ") || copy.noneValue}
									</p>
									<p>
										{copy.addedClaimKindsPrefix}:{" "}
										{run.added_claim_kinds.join(", ") || copy.noneValue}
									</p>
									<p>
										{copy.removedClaimKindsPrefix}:{" "}
										{run.removed_claim_kinds.join(", ") || copy.noneValue}
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

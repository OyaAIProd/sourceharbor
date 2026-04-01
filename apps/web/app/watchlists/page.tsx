import type { Metadata } from "next";
import Link from "next/link";

import { getActionSessionTokenForForm } from "@/app/action-security";
import { getFlashMessage } from "@/app/flash-message";
import {
	deleteWatchlistAction,
	upsertWatchlistAction,
} from "@/app/watchlists/actions";
import {
	FormCheckboxField,
	FormInputField,
	FormSelectField,
} from "@/components/form-field";
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
	title: "Watchlists",
	description:
		"Persisted topic and source watchlists for ongoing SourceHarbor tracking, with notification readiness and trend follow-through.",
};

type WatchlistsPageProps = {
	searchParams?: SearchParamsInput;
};

const MATCHER_OPTIONS = [
	{ value: "topic_key", label: "Topic key" },
	{ value: "claim_kind", label: "Claim kind" },
	{ value: "platform", label: "Platform" },
	{ value: "source_match", label: "Source match" },
];

const DELIVERY_OPTIONS = [
	{ value: "dashboard", label: "Dashboard only" },
	{ value: "email", label: "Email when ready" },
];

export default async function WatchlistsPage({
	searchParams,
}: WatchlistsPageProps) {
	const copy = getLocaleMessages().watchlistsPage;
	const {
		status,
		code,
		watchlist_id: watchlistId,
	} = await resolveSearchParams(searchParams, [
		"status",
		"code",
		"watchlist_id",
	] as const);
	const sessionToken = getActionSessionTokenForForm();

	const [watchlistsResult, opsResult] = await Promise.all([
		apiClient
			.listWatchlists()
			.then((items) => ({ items, error: false }))
			.catch(() => ({ items: [], error: true })),
		apiClient
			.getOpsInbox({ limit: 4, window_hours: 24 })
			.then((payload) => ({ payload, error: false }))
			.catch(() => ({ payload: null, error: true })),
	]);

	const watchlists = watchlistsResult.items;
	const editingWatchlist = watchlistId.trim()
		? (watchlists.find((item) => item.id === watchlistId.trim()) ?? null)
		: null;
	const trendWatchlist = editingWatchlist ?? watchlists[0] ?? null;
	const trendResult = trendWatchlist
		? await apiClient
				.getWatchlistTrend(trendWatchlist.id, {
					limit_runs: 3,
					limit_cards: 12,
				})
				.then((payload) => ({ payload, error: false }))
				.catch(() => ({ payload: null, error: true }))
		: { payload: null, error: false };
	const notificationGate = opsResult.payload?.gates.notifications ?? null;

	const alert =
		status && code ? (
			<p
				className={
					status === "error"
						? "alert alert-enter error"
						: "alert alert-enter success"
				}
				role={status === "error" ? "alert" : "status"}
				aria-live={status === "error" ? "assertive" : "polite"}
			>
				{getFlashMessage(code)}
			</p>
		) : null;

	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">SourceHarbor Compounders</p>
				<h1 className="folo-page-title" data-route-heading>
					Watchlists
				</h1>
				<p className="folo-page-subtitle">{copy.heroSubtitle}</p>
			</div>

			{alert}

			<section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
				<Card className="folo-surface border-border/70">
					<CardHeader>
						<CardTitle>Save a watchlist</CardTitle>
						<CardDescription>{copy.saveDescription}</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={upsertWatchlistAction} className="grid gap-4">
							<input
								type="hidden"
								name="session_token"
								value={sessionToken}
								suppressHydrationWarning
							/>
							<input
								type="hidden"
								name="id"
								value={editingWatchlist?.id ?? ""}
								readOnly
							/>
							<FormInputField
								id="watchlist-name"
								name="name"
								label="Name"
								type="text"
								defaultValue={editingWatchlist?.name ?? ""}
								placeholder="Retry policy, Agent workflow, YouTube AI channel..."
								required
							/>
							<FormSelectField
								name="matcher_type"
								label="Watch type"
								defaultValue={editingWatchlist?.matcher_type ?? "topic_key"}
								options={MATCHER_OPTIONS}
							/>
							<FormInputField
								id="watchlist-value"
								name="matcher_value"
								label="Matcher value"
								type="text"
								defaultValue={editingWatchlist?.matcher_value ?? ""}
								placeholder="retry-policy, claim_kind, youtube, /channel-name ..."
								required
							/>
							<FormSelectField
								name="delivery_channel"
								label="Delivery"
								defaultValue={editingWatchlist?.delivery_channel ?? "dashboard"}
								options={DELIVERY_OPTIONS}
							/>
							<FormCheckboxField
								name="enabled"
								label="Enabled"
								defaultChecked={editingWatchlist?.enabled ?? true}
							/>
							<div className="flex flex-wrap gap-3">
								<Button type="submit" variant="hero" size="sm">
									{editingWatchlist ? "Update watchlist" : "Save watchlist"}
								</Button>
								{editingWatchlist ? (
									<Button asChild variant="outline" size="sm">
										<Link href="/watchlists">Create new</Link>
									</Button>
								) : null}
								<Button asChild variant="outline" size="sm">
									<Link href="/trends">Open trend view</Link>
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>

				<Card className="folo-surface border-border/70">
					<CardHeader>
						<CardTitle>Alert readiness</CardTitle>
						<CardDescription>{copy.alertDescription}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						{notificationGate ? (
							<>
								<p>{notificationGate.summary}</p>
								<p>{notificationGate.next_step}</p>
							</>
						) : (
							<p>{copy.alertFallback}</p>
						)}
						<Button asChild variant="outline" size="sm">
							<Link href="/settings">Open notification settings</Link>
						</Button>
					</CardContent>
				</Card>
			</section>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<CardTitle>Current watchlists</CardTitle>
					<CardDescription>{copy.currentDescription}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{watchlistsResult.error ? (
						<p className="text-sm text-muted-foreground">
							{copy.currentError}
						</p>
					) : watchlists.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							{copy.currentEmpty}
						</p>
					) : (
						<ul className="space-y-3">
							{watchlists.map((item) => (
								<li
									key={item.id}
									className="rounded-lg border border-border/60 bg-muted/20 p-4"
								>
									<div className="flex flex-wrap items-center justify-between gap-3">
										<div className="space-y-1">
											<p className="font-medium">{item.name}</p>
											<p className="text-sm text-muted-foreground">
												{item.matcher_type}: <code>{item.matcher_value}</code> ·{" "}
												{item.delivery_channel} ·{" "}
												{item.enabled ? "enabled" : "paused"}
											</p>
											<p className="text-xs text-muted-foreground">
												Updated: {formatDateTime(item.updated_at)}
											</p>
										</div>
										<div className="flex flex-wrap gap-3">
											<Button asChild variant="outline" size="sm">
												<Link
													href={`/watchlists?watchlist_id=${encodeURIComponent(item.id)}`}
												>
													Edit
												</Link>
											</Button>
											<Button asChild variant="outline" size="sm">
												<Link
													href={`/trends?watchlist_id=${encodeURIComponent(item.id)}`}
												>
													View trend
												</Link>
											</Button>
											<form action={deleteWatchlistAction}>
												<input
													type="hidden"
													name="session_token"
													value={sessionToken}
													suppressHydrationWarning
												/>
												<input
													type="hidden"
													name="watchlist_id"
													value={item.id}
													readOnly
												/>
												<Button type="submit" variant="ghost" size="sm">
													Delete
												</Button>
											</form>
										</div>
									</div>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			{trendWatchlist && trendResult.payload ? (
				<Card className="folo-surface border-border/70">
					<CardHeader>
					<CardTitle>Recent movement</CardTitle>
						<CardDescription>{copy.recentMovementDescription}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{trendResult.payload.timeline.map((run) => (
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
								</div>
								<p className="mt-3 text-sm text-muted-foreground">
									Added topics: {run.added_topics.join(", ") || "none"} ·
									Removed topics: {run.removed_topics.join(", ") || "none"}
								</p>
							</div>
						))}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}

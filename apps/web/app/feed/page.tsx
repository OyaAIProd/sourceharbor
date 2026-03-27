import type { Metadata } from "next";
import Link from "next/link";

import { getActionSessionTokenForForm } from "@/app/action-security";
import { getFlashMessage, toErrorCode } from "@/app/flash-message";
import { EntryList } from "@/components/entry-list";
import { FormSelectField } from "@/components/form-field";
import { ReadingPane } from "@/components/reading-pane";
import { SyncNowButton } from "@/components/sync-now-button";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import {
	resolveSearchParams,
	type SearchParamsInput,
} from "@/lib/search-params";

export const metadata: Metadata = { title: "Digest Feed" };

type FeedPageProps = {
	searchParams?: SearchParamsInput;
};

const CATEGORY_LABELS: Record<string, string> = {
	tech: "Tech",
	creator: "Creator",
	macro: "Macro",
	ops: "Ops",
	misc: "Misc",
};

const SOURCE_OPTIONS = [
	{ value: "", label: "All sources" },
	{ value: "youtube", label: "YouTube" },
	{ value: "bilibili", label: "Bilibili" },
	{ value: "rss", label: "RSS" },
] as const;

function toSourceSelectValue(
	source: string,
): (typeof SOURCE_OPTIONS)[number]["value"] {
	const normalized = source.trim().toLowerCase();
	if (
		normalized === "youtube" ||
		normalized === "bilibili" ||
		normalized === "rss"
	) {
		return normalized;
	}
	if (normalized === "rss_generic") {
		return "rss";
	}
	return "";
}

function toSourceLabel(source: string): string {
	const normalized = source.trim().toLowerCase();
	if (normalized === "youtube") return "YouTube";
	if (normalized === "bilibili") return "Bilibili";
	if (normalized === "rss" || normalized === "rss_generic") return "RSS";
	return source || "Unknown";
}

function formatPublishedDateLabel(
	value: string | undefined,
): string | undefined {
	if (!value) return undefined;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	}).format(parsed);
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
	const sessionToken = getActionSessionTokenForForm();
	const { source, category, sub, limit, cursor, prev_cursor, page, item } =
		await resolveSearchParams(searchParams, [
			"source",
			"category",
			"sub",
			"limit",
			"cursor",
			"prev_cursor",
			"page",
			"item",
		]);

	const parsedLimit = Number.parseInt(limit, 10);
	const safeLimit =
		Number.isFinite(parsedLimit) && parsedLimit > 0
			? Math.min(parsedLimit, 100)
			: 20;
	const safeCursor = cursor.trim() || undefined;
	const safePrevCursor = prev_cursor.trim() || undefined;
	const parsedPage = Number.parseInt(page, 10);
	const inferredPage = safeCursor ? 2 : 1;
	const safePage =
		Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : inferredPage;
	const normalizedSource = source.trim().toLowerCase();
	const safeSource = normalizedSource || undefined;
	const safeSubscriptionId = sub.trim() || undefined;
	const sourceSelectValue = toSourceSelectValue(source);
	const isFiltered = Boolean(safeSource || category || safeSubscriptionId);
	const hasVisibleFilterLabel = Boolean(
		safeSource || category || safeSubscriptionId,
	);
	const selectedJobId = item.trim() || null;

	let feed: Awaited<ReturnType<typeof apiClient.getDigestFeed>> | null = null;
	let errorCode: string | null = null;
	try {
		feed = await apiClient.getDigestFeed({
			source: safeSource,
			category:
				category === "tech" ||
				category === "creator" ||
				category === "macro" ||
				category === "ops" ||
				category === "misc"
					? category
					: undefined,
			subscription_id: safeSubscriptionId,
			limit: safeLimit,
			cursor: safeCursor,
		});
	} catch (err) {
		errorCode = toErrorCode(err);
	}

	const items = feed?.items ?? [];
	const nextCursor = feed?.next_cursor ?? null;
	const isFirstPage = !safeCursor;

	const buildPageUrl = ({
		cursorValue,
		prevCursorValue,
		pageValue,
		itemValue,
	}: {
		cursorValue?: string;
		prevCursorValue?: string;
		pageValue: number;
		itemValue?: string;
	}) => {
		const params = new URLSearchParams();
		if (safeSource) params.set("source", safeSource);
		if (category) params.set("category", category);
		if (safeSubscriptionId) params.set("sub", safeSubscriptionId);
		if (safeLimit !== 20) params.set("limit", String(safeLimit));
		if (pageValue > 1) params.set("page", String(pageValue));
		if (cursorValue) params.set("cursor", cursorValue);
		if (prevCursorValue) params.set("prev_cursor", prevCursorValue);
		if (itemValue) params.set("item", itemValue);
		const qs = params.toString();
		return `/feed${qs ? `?${qs}` : ""}`;
	};

	const buildItemUrl = ({ item: itemId }: { item?: string }) =>
		buildPageUrl({
			cursorValue: safeCursor,
			prevCursorValue: safePrevCursor,
			pageValue: safePage,
			itemValue: itemId ?? undefined,
		});

	const retryHref = buildPageUrl({
		cursorValue: safeCursor,
		prevCursorValue: safePrevCursor,
		pageValue: safePage,
		itemValue: selectedJobId ?? undefined,
	});

	const selectedItem = selectedJobId
		? items.find((feedItem) => feedItem.job_id === selectedJobId)
		: null;

	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<div className="folo-page-title-row">
					<div>
						<p className="folo-page-kicker">SourceHarbor Feed</p>
						<h1 className="folo-page-title" data-route-heading>
							Digest Feed
						</h1>
						<p className="folo-page-subtitle">
							Browse digest entries and body content in one reading flow, with
							quick source and category filtering when you need it.
						</p>
					</div>
					<div className="folo-page-toolbar">
						<SyncNowButton sessionToken={sessionToken} />
					</div>
				</div>
			</div>

			<section
				className="folo-panel folo-surface feed-filter-panel"
				aria-label="Digest filters"
			>
				<form method="GET" className="feed-filter-form">
					<input type="hidden" name="item" value={selectedJobId ?? ""} />
					<div className="feed-filter-selects">
						<FormSelectField
							name="source"
							label="Source"
							defaultValue={sourceSelectValue}
							options={SOURCE_OPTIONS.map((option) => ({
								value: option.value,
								label: option.label,
							}))}
							fieldClassName="feed-filter-field"
							labelClassName="sr-only"
							selectClassName="feed-filter-select"
						/>
						<FormSelectField
							name="category"
							label="Category"
							defaultValue={category}
							options={[
								{ value: "", label: "All categories" },
								...Object.entries(CATEGORY_LABELS).map(([key, value]) => ({
									value: key,
									label: value,
								})),
							]}
							fieldClassName="feed-filter-field"
							labelClassName="sr-only"
							selectClassName="feed-filter-select"
						/>
					</div>
					{safeSubscriptionId ? (
						<input type="hidden" name="sub" value={safeSubscriptionId} />
					) : null}
					<input type="hidden" name="limit" value={String(safeLimit)} />
					<div className="feed-filter-actions">
						<Button
							type="submit"
							variant="hero"
							size="sm"
							data-interaction="control"
							data-testid="feed-filter-submit"
						>
							Filter
						</Button>
						{isFiltered ? (
							<Button
								asChild
								variant="ghost"
								size="sm"
								className="feed-filter-clear"
								data-testid="feed-filter-clear"
							>
								<Link
									href={
										selectedJobId
											? `/feed?item=${encodeURIComponent(selectedJobId)}`
											: "/feed"
									}
								>
									Clear
								</Link>
							</Button>
						) : null}
					</div>
				</form>
			</section>

			{errorCode ? (
				<>
					<p
						className="alert alert-enter error"
						role="alert"
						aria-live="assertive"
					>
						{getFlashMessage(errorCode)}
					</p>
					<Button
						asChild
						variant="surface"
						size="sm"
						data-interaction="link-muted"
					>
						<Link href={retryHref}>Retry current page</Link>
					</Button>
				</>
			) : null}

			{!errorCode && items.length === 0 ? (
				<section className="folo-panel folo-surface folo-empty-panel">
					<p className="folo-empty-title">No AI digest entries yet</p>
					<p className="folo-empty-description">
						{isFiltered
							? "No results match the current filters. Try clearing them."
							: "There are no processed videos or articles yet. Add a subscription and trigger intake first."}
					</p>
					{!isFiltered ? (
						<Button asChild variant="hero" size="sm" data-interaction="cta">
							<Link href="/subscriptions">Go to subscriptions</Link>
						</Button>
					) : null}
				</section>
			) : (
				<div className="feed-main-flow">
					<EntryList
						items={items.map((feedItem) => ({
							...feedItem,
							href: buildItemUrl({ item: feedItem.job_id }),
						}))}
						selectedJobId={selectedJobId}
					/>
					<ReadingPane
						jobId={selectedJobId}
						title={selectedItem?.title}
						source={selectedItem?.source}
						sourceName={selectedItem?.source_name}
						videoUrl={selectedItem?.video_url}
						publishedAt={selectedItem?.published_at}
						publishedDateLabel={formatPublishedDateLabel(
							selectedItem?.published_at,
						)}
					/>
				</div>
			)}

			{!errorCode && items.length > 0 ? (
				<nav
					className="folo-panel folo-surface folo-pagination-shell"
					aria-label="Pagination"
				>
					<div className="folo-pagination-group">
						{!isFirstPage ? (
							<Button asChild variant="surface" size="sm">
								<Link
									href={buildPageUrl({
										cursorValue: safePrevCursor,
										pageValue: Math.max(1, safePage - 1),
										itemValue: selectedJobId ?? undefined,
									})}
								>
									← Previous page
								</Link>
							</Button>
						) : null}
						{isFiltered && hasVisibleFilterLabel ? (
							<span className="folo-filter-label">
								{safeSource && `${toSourceLabel(safeSource)}`}
								{safeSource && category ? " · " : ""}
								{category && `${CATEGORY_LABELS[category] ?? category}`}
								{(safeSource || category) && safeSubscriptionId ? " · " : ""}
								{safeSubscriptionId ? "Subscription" : ""}
							</span>
						) : null}
					</div>
					<div className="folo-pagination-group">
						<span className="folo-filter-label">Page {safePage}</span>
						{nextCursor !== null ? (
							<Button asChild variant="surface" size="sm">
								<Link
									href={buildPageUrl({
										cursorValue: nextCursor,
										prevCursorValue: safeCursor,
										pageValue: safePage + 1,
										itemValue: selectedJobId ?? undefined,
									})}
								>
									Next page →
								</Link>
							</Button>
						) : null}
					</div>
				</nav>
			) : null}
		</div>
	);
}

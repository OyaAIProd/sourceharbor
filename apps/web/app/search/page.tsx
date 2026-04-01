import type { Metadata } from "next";
import Link from "next/link";

import { FormInputField, FormSelectField } from "@/components/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { getLocaleMessages } from "@/lib/i18n/messages";
import {
	resolveSearchParams,
	type SearchParamsInput,
} from "@/lib/search-params";

export const metadata: Metadata = {
	title: "Search",
	description:
		"Operator-facing retrieval front door for digests, transcripts, outlines, and knowledge cards.",
};

type SearchPageProps = {
	searchParams?: SearchParamsInput;
};

const MODE_OPTIONS = [
	{ value: "keyword", label: "Keyword" },
	{ value: "semantic", label: "Semantic (experimental)" },
	{ value: "hybrid", label: "Hybrid (experimental)" },
];

function humanizeSource(source: string): string {
	return source
		.split(/[_-]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const copy = getLocaleMessages().searchPage;
	const { q, query, mode, top_k, intent, platform } = await resolveSearchParams(
		searchParams,
		["q", "query", "mode", "top_k", "intent", "platform"] as const,
	);
	const queryValue = query.trim() || q.trim();
	const normalizedMode =
		mode.trim() === "semantic" || mode.trim() === "hybrid"
			? mode.trim()
			: "keyword";
	const parsedTopK = Number.parseInt(top_k, 10);
	const safeTopK =
		Number.isFinite(parsedTopK) && parsedTopK > 0
			? Math.min(parsedTopK, 20)
			: 8;
	const askIntent = intent.trim() === "ask";
	const safePlatform = platform.trim().toLowerCase();

	let payload: Awaited<ReturnType<typeof apiClient.searchRetrieval>> | null =
		null;
	let error = false;
	if (queryValue) {
		try {
			payload = await apiClient.searchRetrieval({
				query: queryValue,
				mode: normalizedMode,
				top_k: safeTopK,
				filters: safePlatform ? { platform: safePlatform } : {},
			});
		} catch {
			error = true;
		}
	}

	const results = payload?.items ?? [];

	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">
					{askIntent ? copy.askKicker : copy.searchKicker}
				</p>
				<h1 className="folo-page-title" data-route-heading>
					{askIntent ? copy.askTitle : copy.searchTitle}
				</h1>
				<p className="folo-page-subtitle">
					{askIntent ? copy.askSubtitle : copy.searchSubtitle}
				</p>
			</div>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">
						{askIntent ? copy.askFormTitle : copy.searchFormTitle}
					</h2>
					<CardDescription>
						{askIntent ? copy.askFormDescription : copy.searchFormDescription}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						method="GET"
						className="grid gap-4 lg:grid-cols-[1.7fr_0.8fr_0.5fr_auto]"
					>
						<input type="hidden" name="intent" value={askIntent ? "ask" : ""} />
						<FormInputField
							name="q"
							label={askIntent ? "Question" : "Query"}
							placeholder={
								askIntent
									? "What did recent runs say about retry policy, agent workflow, or knowledge cards?"
									: "agent workflow, retry policy, knowledge cards..."
							}
							defaultValue={queryValue}
							hint={
								askIntent ? copy.askHint : copy.searchHint
							}
						/>
						<FormSelectField
							name="mode"
							label={askIntent ? "Grounding mode" : "Mode"}
							defaultValue={normalizedMode}
							options={MODE_OPTIONS}
						/>
						<FormSelectField
							name="platform"
							label="Platform"
							defaultValue={safePlatform}
							options={[
								{ value: "", label: "All platforms" },
								{ value: "youtube", label: "YouTube" },
								{ value: "bilibili", label: "Bilibili" },
							]}
						/>
						<FormInputField
							name="top_k"
							label="Top K"
							type="number"
							min={1}
							max={20}
							defaultValue={safeTopK}
						/>
						<div className="flex items-end gap-3">
							<Button type="submit" variant="hero" size="sm">
								{askIntent ? "Ask" : "Search"}
							</Button>
							<Button asChild variant="ghost" size="sm">
								<Link href={askIntent ? "/ask" : "/search"}>Clear</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
				<Card className="folo-surface border-border/70">
					<CardHeader>
						<h2 className="text-xl font-semibold">
							{askIntent ? copy.askTruthTitle : copy.searchTruthTitle}
						</h2>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>
							{askIntent ? copy.askTruthPrimary : copy.searchTruthPrimary}
						</p>
						<p>
							{askIntent
								? copy.askTruthSecondary
								: copy.searchTruthSecondary}
						</p>
						{askIntent ? (
							<p>{copy.askTruthNote}</p>
						) : null}
						<Button asChild variant="outline" size="sm">
							<Link href={askIntent ? "/ask" : "/ask"}>
								{askIntent ? copy.askTruthCta : copy.searchTruthCta}
							</Link>
						</Button>
					</CardContent>
				</Card>
				<Card className="folo-surface border-border/70">
					<CardHeader>
						<h2 className="text-xl font-semibold">
							{askIntent ? copy.askContractTitle : copy.searchContractTitle}
						</h2>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>
							{askIntent
								? copy.askContractPrimary
								: copy.searchContractPrimary}
						</p>
						<p>
							{askIntent
								? copy.askContractSecondary
								: copy.searchContractSecondary}
						</p>
					</CardContent>
				</Card>
			</section>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">
						{askIntent ? copy.askResultsTitle : copy.searchResultsTitle}
					</h2>
					<CardDescription>
						{queryValue
							? `${askIntent ? copy.askResultsPrefix : copy.searchResultsPrefix} for “${queryValue}”.`
							: askIntent
								? copy.askRunPrompt
								: copy.searchRunPrompt}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error ? (
						<p className="text-sm text-muted-foreground">
							{copy.requestFailed}
						</p>
					) : null}
					{!error && queryValue && results.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							{copy.noResults}
						</p>
					) : null}
					{results.map((item, index) => (
						<Card
							key={`${item.job_id}-${item.source}-${index}`}
							className="border-border/60"
						>
							<CardContent className="space-y-4 pt-6">
								<div className="flex flex-wrap gap-2">
									<Badge variant="outline">{humanizeSource(item.source)}</Badge>
									<Badge variant="outline">{item.platform || "unknown"}</Badge>
									<Badge variant="outline">score {item.score.toFixed(2)}</Badge>
									{normalizedMode !== "keyword" ? (
										<Badge variant="secondary">{copy.experimentalMode}</Badge>
									) : null}
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold">
										{item.title?.trim() || `Job ${item.job_id}`}
									</h3>
									<p className="text-sm text-muted-foreground">
										{item.snippet}
									</p>
								</div>
								<div className="flex flex-wrap gap-3">
									<Button asChild variant="outline" size="sm">
										<Link
											href={`/jobs?job_id=${encodeURIComponent(item.job_id)}`}
										>
											Open job trace
										</Link>
									</Button>
									<Button asChild variant="outline" size="sm">
										<Link
											href={`/knowledge?job_id=${encodeURIComponent(item.job_id)}`}
										>
											Open knowledge cards
										</Link>
									</Button>
									<Button asChild variant="outline" size="sm">
										<Link
											href={`/feed?item=${encodeURIComponent(item.job_id)}`}
										>
											Open feed entry
										</Link>
									</Button>
									{item.source_url ? (
										<Button asChild variant="ghost" size="sm">
											<a
												href={item.source_url}
												target="_blank"
												rel="noreferrer"
											>
												Open source
											</a>
										</Button>
									) : null}
								</div>
							</CardContent>
						</Card>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

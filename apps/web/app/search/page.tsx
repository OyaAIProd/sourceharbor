import type { Metadata } from "next";
import Link from "next/link";

import { FormInputField, FormSelectField } from "@/components/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { resolveSearchParams, type SearchParamsInput } from "@/lib/search-params";

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

	let payload:
		| Awaited<ReturnType<typeof apiClient.searchRetrieval>>
		| null = null;
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
					{askIntent
						? "SourceHarbor Ask Front Door"
						: "SourceHarbor Search Front Door"}
				</p>
				<h1 className="folo-page-title" data-route-heading>
					{askIntent ? "Ask your sources" : "Search"}
				</h1>
				<p className="folo-page-subtitle">
					{askIntent
						? "这是一个诚实的 Wave 1 Ask MVP。当前 repo truth 支撑的是 grounded, search-first retrieval，不是 fully generated answer layer。"
						: "这是面向运营者的真实检索前台。它直接调用 retrieval API，把 digest、transcript、outline 和 knowledge cards 变成可回跳、可审计的结果。"}
				</p>
			</div>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">
						{askIntent ? "Ask in grounded mode" : "Search your sources"}
					</h2>
					<CardDescription>
						{askIntent
							? "先把问题收敛成 cited retrieval，再跳回 job trace、knowledge cards 和原始来源。"
							: "`keyword` 是当前最稳的模式。`semantic` 和 `hybrid` 已接线，但仍按 experimental 呈现。"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form method="GET" className="grid gap-4 lg:grid-cols-[1.7fr_0.8fr_0.5fr_auto]">
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
								askIntent
									? "This MVP returns grounded evidence candidates first."
									: "每条结果都应该能回跳到 job trace、knowledge 或 source URL。"
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
							{askIntent ? "Grounded Ask mode" : "Current truth"}
						</h2>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>
							{askIntent
								? "What exists today: cited retrieval, job trace, knowledge cards, and original source links."
								: "Search is a production-facing front door over a real retrieval backend."}
						</p>
						<p>
							{askIntent
								? "What does not exist yet: a verified answer payload with stable citation spans and answer-level hallucination guards."
								: "Wave 1 keeps the boundary honest: cited retrieval first, stronger answer synthesis later."}
						</p>
						{askIntent ? (
							<p>It does not synthesize a free-form answer layer yet.</p>
						) : null}
						<Button asChild variant="outline" size="sm">
							<Link
								href={
									askIntent
										? "/ask"
										: "/ask"
								}
							>
								{askIntent ? "Open Ask details" : "Open Ask mode"}
							</Link>
						</Button>
					</CardContent>
				</Card>
				<Card className="folo-surface border-border/70">
					<CardHeader>
						<h2 className="text-xl font-semibold">
							{askIntent ? "Best current use" : "Result contract"}
						</h2>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>
							{askIntent
								? "Use Ask to narrow a question into evidence-backed result candidates, then follow the citations into job trace, knowledge, or original source pages."
								: "Each hit exposes a snippet, source type, score, and jump targets into a job trace, knowledge page, or original source URL."}
						</p>
						<p>
							{askIntent
								? "This is truthful by design: no hidden answer layer, no unverifiable synthesis."
								: "If the corpus is empty, Search should show an honest empty state instead of inventing an answer."}
						</p>
					</CardContent>
				</Card>
			</section>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">
						{askIntent ? "Grounded result set" : "Results"}
					</h2>
					<CardDescription>
						{queryValue
							? `${askIntent ? "Evidence candidates" : "Showing cited retrieval results"} for “${queryValue}”.`
							: `Run ${askIntent ? "a grounded question" : "a query"} to inspect grounded retrieval results.`}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error ? (
						<p className="text-sm text-muted-foreground">
							Current retrieval request failed. Retry first, then inspect API health if
							it still fails.
						</p>
					) : null}
					{!error && queryValue && results.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No grounded results yet. That usually means the current corpus is empty or
							the query is too narrow.
						</p>
					) : null}
					{results.map((item, index) => (
						<Card key={`${item.job_id}-${item.source}-${index}`} className="border-border/60">
							<CardContent className="space-y-4 pt-6">
								<div className="flex flex-wrap gap-2">
									<Badge variant="outline">{humanizeSource(item.source)}</Badge>
									<Badge variant="outline">{item.platform || "unknown"}</Badge>
									<Badge variant="outline">score {item.score.toFixed(2)}</Badge>
									{normalizedMode !== "keyword" ? (
										<Badge variant="secondary">experimental mode</Badge>
									) : null}
								</div>
								<div className="space-y-2">
									<h3 className="text-lg font-semibold">
										{item.title?.trim() || `Job ${item.job_id}`}
									</h3>
									<p className="text-sm text-muted-foreground">{item.snippet}</p>
								</div>
								<div className="flex flex-wrap gap-3">
									<Button asChild variant="outline" size="sm">
										<Link href={`/jobs?job_id=${encodeURIComponent(item.job_id)}`}>
											Open job trace
										</Link>
									</Button>
									<Button asChild variant="outline" size="sm">
										<Link href={`/knowledge?job_id=${encodeURIComponent(item.job_id)}`}>
											Open knowledge cards
										</Link>
									</Button>
									<Button asChild variant="outline" size="sm">
										<Link href={`/feed?item=${encodeURIComponent(item.job_id)}`}>
											Open feed entry
										</Link>
									</Button>
									{item.source_url ? (
										<Button asChild variant="ghost" size="sm">
											<a href={item.source_url} target="_blank" rel="noreferrer">
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

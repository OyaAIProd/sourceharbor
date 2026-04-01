import type { Metadata } from "next";
import Link from "next/link";

import { FormInputField, FormSelectField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import type { RetrievalHit, RetrievalSearchMode } from "@/lib/api/types";
import { getLocaleMessages } from "@/lib/i18n/messages";
import {
	resolveSearchParams,
	type SearchParamsInput,
} from "@/lib/search-params";
import { buildProductMetadata } from "@/lib/seo";

const askCopy = getLocaleMessages().searchPage;

export const metadata: Metadata = buildProductMetadata({
	title: askCopy.askTitle,
	description: askCopy.askSubtitle,
	route: "search",
	keywords: ["Ask your sources", "grounded Ask", "citation-first Ask"],
});

type AskPageProps = {
	searchParams?: SearchParamsInput;
};

const MODE_OPTIONS: Array<{ value: RetrievalSearchMode; label: string }> = [
	{ value: "keyword", label: "Keyword" },
	{ value: "semantic", label: "Semantic (experimental)" },
	{ value: "hybrid", label: "Hybrid (experimental)" },
];

function compactId(value: string): string {
	return value.length <= 16 ? value : `${value.slice(0, 8)}…${value.slice(-6)}`;
}

function formatSourceLabel(source: string): string {
	if (source === "knowledge_cards") {
		return askCopy.knowledgeCardsSourceLabel;
	}
	return source
		.split(/[_-]+/)
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(" ");
}

function EvidenceCard({ hit }: { hit: RetrievalHit }) {
	return (
		<Card className="folo-surface border-border/70">
			<CardHeader className="space-y-3">
				<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					<span>{hit.platform || "unknown"}</span>
					<span>·</span>
					<span>{formatSourceLabel(hit.source)}</span>
					<span>·</span>
					<span>Job {compactId(hit.job_id)}</span>
				</div>
				<div className="space-y-2">
					<h2 className="text-xl font-semibold">
						{hit.title?.trim() || askCopy.groundedEvidenceTitle}
					</h2>
					<CardDescription>{hit.snippet}</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-2">
				<Button asChild variant="outline" size="sm">
					<Link href={`/jobs?job_id=${encodeURIComponent(hit.job_id)}`}>
						{askCopy.openJobTraceButton}
					</Link>
				</Button>
				<Button asChild variant="outline" size="sm">
					<Link href={`/knowledge?job_id=${encodeURIComponent(hit.job_id)}`}>
						{askCopy.openKnowledgeCardsButton}
					</Link>
				</Button>
				{hit.source_url ? (
					<Button asChild variant="ghost" size="sm">
						<a href={hit.source_url} target="_blank" rel="noreferrer">
							{askCopy.openSourceButton}
						</a>
					</Button>
				) : null}
			</CardContent>
		</Card>
	);
}

export default async function AskPage({ searchParams }: AskPageProps) {
	const {
		question,
		mode,
		top_k: topK,
	} = await resolveSearchParams(searchParams, [
		"question",
		"mode",
		"top_k",
	] as const);
	const safeQuestion = question.trim();
	const modeCandidate = mode.trim().toLowerCase();
	const safeMode: RetrievalSearchMode =
		modeCandidate === "semantic" || modeCandidate === "hybrid"
			? modeCandidate
			: "keyword";
	const parsedTopK = Number.parseInt(topK, 10);
	const safeTopK =
		Number.isFinite(parsedTopK) && parsedTopK > 0
			? Math.min(parsedTopK, 12)
			: 6;

	let results: Awaited<ReturnType<typeof apiClient.searchRetrieval>> | null =
		null;
	let error = false;

	if (safeQuestion) {
		try {
			results = await apiClient.searchRetrieval({
				query: safeQuestion,
				top_k: safeTopK,
				mode: safeMode,
			});
		} catch {
			error = true;
		}
	}

	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">{askCopy.askKicker}</p>
				<h1 className="folo-page-title" data-route-heading>
					{askCopy.askTitle}
				</h1>
				<p className="folo-page-subtitle">{askCopy.askSubtitle}</p>
			</div>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">{askCopy.askTruthTitle}</h2>
					<CardDescription>
						Current contract: retrieval-first, citation-first, and operator
						auditable. {askCopy.askTruthPrimary} {askCopy.askTruthSecondary}{" "}
						{askCopy.askTruthNote} {askCopy.askContractPrimary}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					<div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
						{askCopy.askContractArtifactLabel}:{" "}
						<code>
							docs/blueprints/2026-03-31-ask-your-sources-grounded-answer-contract.md
						</code>
					</div>
					<Button asChild variant="ghost" size="sm">
						<Link href="/search">{askCopy.openRawSearchButton} →</Link>
					</Button>
				</CardContent>
			</Card>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">{askCopy.askFormTitle}</h2>
				</CardHeader>
				<CardContent>
					<form method="GET" className="grid gap-4 lg:grid-cols-2">
						<FormInputField
							id="ask-question"
							name="question"
							label={askCopy.questionLabel}
							type="search"
							placeholder={askCopy.questionPlaceholder}
							defaultValue={safeQuestion}
						/>
						<FormSelectField
							name="mode"
							label={askCopy.groundingModeLabel}
							defaultValue={safeMode}
							options={MODE_OPTIONS.map((option) => ({
								...option,
								label:
									option.value === "keyword"
										? askCopy.modeOptions.keyword
										: option.value === "semantic"
											? askCopy.modeOptions.semantic
											: askCopy.modeOptions.hybrid,
							}))}
						/>
						<FormInputField
							id="ask-top-k"
							name="top_k"
							label={askCopy.topKLabel}
							type="number"
							min={1}
							max={12}
							defaultValue={String(safeTopK)}
						/>
						<div className="flex items-end gap-3">
							<Button type="submit" variant="hero" size="sm">
								{askCopy.askButton}
							</Button>
							<Button asChild variant="ghost" size="sm">
								<Link href="/ask">{askCopy.clearButton}</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{error ? (
				<Card className="folo-surface border-destructive/40 bg-destructive/5">
					<CardHeader>
						<h2 className="text-xl font-semibold">Ask failed</h2>
						<CardDescription>
							The retrieval layer is present, but this question did not return a
							valid response. Retry before treating the mode as unavailable.
						</CardDescription>
					</CardHeader>
				</Card>
			) : null}

			{!safeQuestion ? (
				<Card className="folo-surface border-border/70">
					<CardHeader>
						<h2 className="text-xl font-semibold">What to expect</h2>
						<CardDescription>
							Use this page when you want to ask in natural language without
							pretending the system already has a grounded answer model. Every
							result should point you back to job trace, knowledge cards, or the
							original source.
						</CardDescription>
					</CardHeader>
				</Card>
			) : null}

			{safeQuestion && results ? (
				<section className="space-y-4" aria-label="Ask evidence results">
					<Card className="folo-surface border-border/70">
						<CardHeader>
							<h2 className="text-xl font-semibold">
								Best evidence for your question
							</h2>
							<CardDescription>
								Question: <strong>{results.query}</strong> · Evidence hits:{" "}
								<strong>{results.items.length}</strong>
							</CardDescription>
						</CardHeader>
					</Card>
					{results.items.length === 0 ? (
						<Card className="folo-surface border-border/70">
							<CardHeader>
								<h2 className="text-xl font-semibold">No cited evidence yet</h2>
								<CardDescription>
									Try a narrower question, switch to keyword mode, or process
									more sources before treating this as a missing capability.
								</CardDescription>
							</CardHeader>
						</Card>
					) : (
						results.items.map((hit) => (
							<EvidenceCard
								key={`${hit.job_id}-${hit.source}-${hit.snippet}`}
								hit={hit}
							/>
						))
					)}
				</section>
			) : null}
		</div>
	);
}

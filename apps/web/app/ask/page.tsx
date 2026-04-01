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
import {
	resolveSearchParams,
	type SearchParamsInput,
} from "@/lib/search-params";

export const metadata: Metadata = { title: "Ask" };

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
		return "Knowledge cards";
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
						{hit.title?.trim() || "Grounded evidence"}
					</h2>
					<CardDescription>{hit.snippet}</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-2">
				<Button asChild variant="outline" size="sm">
					<Link href={`/jobs?job_id=${encodeURIComponent(hit.job_id)}`}>
						Open job trace
					</Link>
				</Button>
				<Button asChild variant="outline" size="sm">
					<Link href={`/knowledge?job_id=${encodeURIComponent(hit.job_id)}`}>
						Open knowledge cards
					</Link>
				</Button>
				{hit.source_url ? (
					<Button asChild variant="ghost" size="sm">
						<a href={hit.source_url} target="_blank" rel="noreferrer">
							Open original source
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
				<p className="folo-page-kicker">SourceHarbor Ask Front Door</p>
				<h1 className="folo-page-title" data-route-heading>
					Ask your sources
				</h1>
				<p className="folo-page-subtitle">
					Ask in natural language, but keep the answer honest. This Wave 1 MVP
					returns grounded evidence packs you can inspect and jump through
					instead of pretending SourceHarbor already has a fully grounded answer
					engine.
				</p>
			</div>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">Truthful Ask MVP</h2>
					<CardDescription>
						Current contract: retrieval-first, citation-first, and operator
						auditable. Future answer-layer work is tracked in the Ask contract
						artifact rather than being faked in the UI today. `keyword` is the
						most trustworthy default path; `semantic` and `hybrid` stay
						experimental until corpus quality and answer-layer grounding are
						re-proved.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					<div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
						Ask contract artifact:{" "}
						<code>
							docs/blueprints/2026-03-31-ask-your-sources-grounded-answer-contract.md
						</code>
					</div>
					<Button asChild variant="ghost" size="sm">
						<Link href="/search">Open raw search →</Link>
					</Button>
				</CardContent>
			</Card>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">Ask a grounded question</h2>
				</CardHeader>
				<CardContent>
					<form method="GET" className="grid gap-4 lg:grid-cols-2">
						<FormInputField
							id="ask-question"
							name="question"
							label="Question"
							type="search"
							placeholder="What changed in the latest runs? Which sources mention agent workflows?"
							defaultValue={safeQuestion}
						/>
						<FormSelectField
							name="mode"
							label="Evidence mode"
							defaultValue={safeMode}
							options={MODE_OPTIONS}
						/>
						<FormInputField
							id="ask-top-k"
							name="top_k"
							label="Evidence budget"
							type="number"
							min={1}
							max={12}
							defaultValue={String(safeTopK)}
						/>
						<div className="flex items-end">
							<Button type="submit" variant="hero" size="sm">
								Find grounded evidence
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

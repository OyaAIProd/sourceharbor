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

export const metadata: Metadata = {
	title: "Proof",
	description:
		"Proof ladder for SourceHarbor: local supervisor proof, long live-smoke boundaries, and remote proof.",
};

const PROOF_LAYERS = [
	{
		title: "Product surface",
		body: "README, runtime-truth, project-status, Search, Ask, MCP, and Ops explain what SourceHarbor is and where each claim lives.",
	},
	{
		title: "Local supervisor proof",
		body: "`bootstrap -> up -> status -> doctor` proves the repo-managed local stack, with routes taken from `resolved.env` instead of assumed defaults.",
	},
	{
		title: "Long live-smoke lane",
		body: "`./bin/smoke-full-stack --offline-fallback 0` is stricter than the base local proof and can still stop on provider-side YouTube, Resend, or Gemini gates.",
	},
	{
		title: "Remote proof",
		body: "Release badges, GitHub settings, and external distribution claims still need fresh remote verification. Local success does not replace that layer.",
	},
];

export default function ProofPage() {
	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">SourceHarbor Proof Ladder</p>
				<h1 className="folo-page-title" data-route-heading>
					Proof boundary
				</h1>
				<p className="folo-page-subtitle">
					把它理解成“哪些话现在能大胆说，哪些还要看额外证据”的
					总开关。代码、docs、local runtime 和 remote proof 不是同一层账本。
				</p>
			</div>

			<section className="grid gap-4 lg:grid-cols-2">
				{PROOF_LAYERS.map((item) => (
					<Card key={item.title} className="folo-surface border-border/70">
						<CardHeader>
							<CardTitle>{item.title}</CardTitle>
						</CardHeader>
						<CardContent className="text-sm text-muted-foreground">
							{item.body}
						</CardContent>
					</Card>
				))}
			</section>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<CardTitle>Next truthful jumps</CardTitle>
					<CardDescription>
						这些入口都是已经存在的真实 surface，不是额外包装。
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					<Button asChild variant="outline" size="sm">
						<Link href="/ops">Open Ops</Link>
					</Button>
					<Button asChild variant="outline" size="sm">
						<Link href="/search">Open Search</Link>
					</Button>
					<Button asChild variant="outline" size="sm">
						<Link href="/playground">Open Playground</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

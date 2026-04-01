import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "MCP",
	description:
		"Agent-facing MCP quickstart for SourceHarbor, including startup, representative tools, and the relation to API and Web.",
};

const TOOL_EXAMPLES = [
	"sourceharbor.jobs.get",
	"sourceharbor.jobs.compare",
	"sourceharbor.knowledge.cards.list",
	"sourceharbor.retrieval.search",
	"sourceharbor.ingest.poll",
];

export default function McpPage() {
	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">SourceHarbor MCP Front Door</p>
				<h1 className="folo-page-title" data-route-heading>
					MCP Quickstart
				</h1>
				<p className="folo-page-subtitle">
					把它理解成给 Agent 和自动化用的控制面。Web 给运营者，API 给系统集成，MCP
					给助手和工作流，而它们都指向同一条 pipeline。
				</p>
			</div>

			<section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
				<Card className="folo-surface border-border/70">
					<CardHeader>
						<h2 className="text-xl font-semibold">Start locally in one command</h2>
						<CardDescription>
							MCP 不是第二套业务逻辑，而是 agent-facing doorway into the same API-backed system.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<pre className="overflow-x-auto rounded-lg border border-border/70 bg-muted/40 p-4 text-sm">
							<code>./bin/dev-mcp</code>
						</pre>
						<p className="text-sm text-muted-foreground">
							This starts the FastMCP server wired in <code>apps/mcp/server.py</code>.
						</p>
					</CardContent>
				</Card>
				<Card className="folo-surface border-border/70">
					<CardHeader>
						<h2 className="text-xl font-semibold">Representative tools</h2>
						<CardDescription>
							These are enough to explain the surface in under three minutes.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
							{TOOL_EXAMPLES.map((tool) => (
								<li key={tool}>
									<code>{tool}</code>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</section>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">How MCP relates to the rest of the product</h2>
				</CardHeader>
				<CardContent className="space-y-3 text-sm text-muted-foreground">
					<p>
						Web is the operator-facing command center. API is the shared contract. MCP is
						the agent-facing surface. SourceHarbor routes MCP through the API instead of
						letting tools talk straight to the database.
					</p>
						<div className="flex flex-wrap gap-3">
							<Button asChild variant="outline" size="sm">
								<Link href="/search">Open Search & Ask</Link>
							</Button>
							<Button asChild variant="outline" size="sm">
								<Link href="/ask">Open Ask mode</Link>
							</Button>
						</div>
				</CardContent>
			</Card>
		</div>
	);
}

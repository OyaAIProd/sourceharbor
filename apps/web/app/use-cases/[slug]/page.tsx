import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { USE_CASE_PAGES, type UseCaseSlug } from "@/lib/demo-content";

type UseCasePageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
	return Object.keys(USE_CASE_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: UseCasePageProps): Promise<Metadata> {
	const { slug } = await params;
	const content = USE_CASE_PAGES[slug as UseCaseSlug];
	if (!content) {
		return {};
	}
	return {
		title: content.title,
		description: content.subtitle,
	};
}

export default async function UseCasePage({ params }: UseCasePageProps) {
	const { slug } = await params;
	const content = USE_CASE_PAGES[slug as UseCaseSlug];
	if (!content) {
		notFound();
	}

	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">SourceHarbor Use Case</p>
				<h1 className="folo-page-title" data-route-heading>
					{content.title}
				</h1>
				<p className="folo-page-subtitle">{content.subtitle}</p>
			</div>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<CardTitle>Why this page exists</CardTitle>
					<CardDescription>
						These use-case pages are discoverability surfaces, not hosted
						product promises. Every claim here should route back to real
						SourceHarbor capability.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3 text-sm text-muted-foreground">
					{content.why.map((item) => (
						<p key={item}>{item}</p>
					))}
				</CardContent>
			</Card>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<CardTitle>Next truthful steps</CardTitle>
					<CardDescription>
						Use these links to move from copy into real product surfaces, proof,
						or sample playgrounds.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					{content.links.map((item) => (
						<Button key={item.href} asChild variant="outline" size="sm">
							{item.href.startsWith("http") ? (
								<a href={item.href} target="_blank" rel="noreferrer">
									{item.label}
								</a>
							) : (
								<Link href={item.href}>{item.label}</Link>
							)}
						</Button>
					))}
					<Button asChild variant="ghost" size="sm">
						<a
							href="https://github.com/xiaojiou176-open/sourceharbor/blob/main/docs/proof.md"
							target="_blank"
							rel="noreferrer"
						>
							Open proof ladder
						</a>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

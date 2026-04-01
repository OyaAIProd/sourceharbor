import type { Metadata } from "next";
import Link from "next/link";

import { getFlashMessage, toErrorCode } from "@/app/flash-message";
import { toDisplayStatus } from "@/app/status";
import { FormInputField } from "@/components/form-field";
import { mapStatusCssToTone, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { buildArtifactAssetUrl } from "@/lib/api/url";
import { formatDateTime, formatDateTimeWithSeconds } from "@/lib/format";
import {
	resolveSearchParams,
	type SearchParamsInput,
} from "@/lib/search-params";

export const metadata: Metadata = { title: "Job Trace" };

type JobsPageProps = { searchParams?: SearchParamsInput };

function JobStatusBadge({ status }: { status: string }) {
	const statusDisplay = toDisplayStatus(status);
	return (
		<StatusBadge
			label={statusDisplay.label}
			tone={mapStatusCssToTone(statusDisplay.css)}
		/>
	);
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
	const { job_id: jobId } = await resolveSearchParams(searchParams, [
		"job_id",
	] as const);
	const retryHref = jobId
		? `/jobs?job_id=${encodeURIComponent(jobId)}`
		: "/jobs";

	let error: string | null = null;
	let job: Awaited<ReturnType<typeof apiClient.getJob>> | null = null;
	let jobCompare: Awaited<ReturnType<typeof apiClient.getJobCompare>> | null =
		null;
	let knowledgeCards: Awaited<
		ReturnType<typeof apiClient.getJobKnowledgeCards>
	> = [];
	if (jobId) {
		try {
			job = await apiClient.getJob(jobId);
		} catch (err) {
			error = getFlashMessage(toErrorCode(err));
		}
		if (!error) {
			try {
				jobCompare = await apiClient.getJobCompare(jobId);
			} catch {
				jobCompare = null;
			}
			try {
				knowledgeCards = await apiClient.getJobKnowledgeCards(jobId);
			} catch {
				knowledgeCards = [];
			}
		}
	}
	const jobStatus = job ? toDisplayStatus(job.status) : null;
	const pipelineStatus = job?.pipeline_final_status
		? toDisplayStatus(job.pipeline_final_status)
		: null;

	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">SourceHarbor Pipeline</p>
				<h1 className="folo-page-title" data-route-heading>
					Job Trace
				</h1>
				<p className="folo-page-subtitle">
					Look up a job ID to inspect full pipeline state, retry history, and
					artifact links in one place.
				</p>
			</div>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">Find a job</h2>
					<CardDescription>
						Enter a job ID to inspect the step trail and artifact links. You can
						jump here from <Link href="/">recent videos on the home page</Link>{" "}
						or <Link href="/feed">the digest feed</Link>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						method="GET"
						className="flex flex-wrap items-end gap-3"
						data-auto-disable-required="true"
					>
						<FormInputField
							id="job-id-field"
							name="job_id"
							label="Job ID *"
							type="text"
							placeholder="9be4cbe7-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
							defaultValue={jobId}
							required
							data-field-kind="identifier"
							fieldClassName="min-w-[280px] flex-1"
						/>
						<Button type="submit" data-interaction="control">
							Search
						</Button>
					</form>
				</CardContent>
			</Card>

			{error ? (
				<Card
					className="folo-surface border-destructive/40 bg-destructive/5"
					role="alert"
					aria-live="assertive"
				>
					<CardHeader className="gap-2">
						<CardTitle className="text-base">Lookup failed</CardTitle>
						<CardDescription>{error}</CardDescription>
					</CardHeader>
					<CardContent className="pt-0">
						<Button asChild variant="outline" size="sm">
							<Link href={retryHref}>Retry current page</Link>
						</Button>
					</CardContent>
				</Card>
			) : null}

			{job ? (
				<>
					<output
						className="text-sm text-muted-foreground"
						aria-live="polite"
						aria-atomic="true"
					>
						Current job status: {jobStatus?.label ?? "-"}, pipeline status:{" "}
						{pipelineStatus?.label ?? "-"}, across {job.step_summary.length}{" "}
						steps.
					</output>
					<section>
						<Card className="folo-surface border-border/70">
							<CardHeader>
								<h2 className="text-xl font-semibold">Job overview</h2>
							</CardHeader>
							<CardContent className="space-y-4">
								<dl className="grid gap-3 sm:grid-cols-2">
									<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
										<dt className="text-xs uppercase tracking-wide text-muted-foreground">
											Job ID
										</dt>
										<dd className="break-all text-sm font-medium">{job.id}</dd>
									</div>
									<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
										<dt className="text-xs uppercase tracking-wide text-muted-foreground">
											Video ID
										</dt>
										<dd className="break-all text-sm font-medium">
											{job.video_id}
										</dd>
									</div>
									<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
										<dt className="text-xs uppercase tracking-wide text-muted-foreground">
											Status
										</dt>
										<dd>
											<JobStatusBadge status={jobStatus?.css ?? "queued"} />
										</dd>
									</div>
									<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
										<dt className="text-xs uppercase tracking-wide text-muted-foreground">
											Final pipeline status
										</dt>
										<dd>
											{pipelineStatus ? (
												<JobStatusBadge status={pipelineStatus.css} />
											) : (
												"-"
											)}
										</dd>
									</div>
									<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
										<dt className="text-xs uppercase tracking-wide text-muted-foreground">
											Created at
										</dt>
										<dd className="text-sm">
											{formatDateTime(job.created_at)}
										</dd>
									</div>
									<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
										<dt className="text-xs uppercase tracking-wide text-muted-foreground">
											Updated at
										</dt>
										<dd className="text-sm">
											{formatDateTime(job.updated_at)}
										</dd>
									</div>
								</dl>
								<Button
									asChild
									variant="link"
									size="sm"
									className="h-auto px-0"
								>
									<Link href={`/feed?item=${encodeURIComponent(job.id)}`}>
										View in digest feed
									</Link>
								</Button>
								<Button
									asChild
									variant="link"
									size="sm"
									className="h-auto px-0"
								>
									<a href={`/api/v1/jobs/${encodeURIComponent(job.id)}/bundle`}>
										Download evidence bundle
									</a>
								</Button>
								<p className="text-sm text-muted-foreground">
									Evidence bundles are for internal reuse and async
									collaboration. They are not public release proof.
								</p>
							</CardContent>
						</Card>
					</section>

					<section>
						<Card className="folo-surface border-border/70">
							<CardHeader>
								<h2 className="text-xl font-semibold">Step summary</h2>
							</CardHeader>
							<CardContent>
								{job.step_summary.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No step records yet.
									</p>
								) : (
									<div className="table-scroll overflow-x-auto rounded-lg border border-border/70">
										<table className="min-w-[720px] w-full text-sm">
											<caption className="sr-only">
												Job step summary table
											</caption>
											<thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
												<tr>
													<th scope="col" className="px-4 py-3 font-medium">
														Step
													</th>
													<th scope="col" className="px-4 py-3 font-medium">
														Status
													</th>
													<th scope="col" className="px-4 py-3 font-medium">
														Retries
													</th>
													<th scope="col" className="px-4 py-3 font-medium">
														Started at
													</th>
													<th scope="col" className="px-4 py-3 font-medium">
														Finished at
													</th>
												</tr>
											</thead>
											<tbody>
												{job.step_summary.map((step, index) => (
													<tr
														key={`${step.name}-${index}`}
														className="border-t border-border/60"
													>
														<td className="px-4 py-3">{step.name}</td>
														<td className="px-4 py-3">
															<JobStatusBadge status={step.status} />
														</td>
														<td className="px-4 py-3">{step.attempt}</td>
														<td className="px-4 py-3">
															{formatDateTimeWithSeconds(step.started_at)}
														</td>
														<td className="px-4 py-3">
															{formatDateTimeWithSeconds(step.finished_at)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</CardContent>
						</Card>
					</section>

					<section className="grid gap-4 lg:grid-cols-2">
						<Card className="folo-surface border-border/70">
							<CardHeader>
								<h2 className="text-xl font-semibold">
									Compare to previous run
								</h2>
								<CardDescription>
									把它理解成“这次和上次相比，结果改了多少”。如果没有上一条成功任务，这里会明确告诉你没有可比较对象。
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{jobCompare?.has_previous ? (
									<>
										<dl className="grid gap-3 sm:grid-cols-3">
											<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
												<dt className="text-xs uppercase tracking-wide text-muted-foreground">
													Previous job
												</dt>
												<dd className="break-all text-sm font-medium">
													{jobCompare.previous_job_id}
												</dd>
											</div>
											<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
												<dt className="text-xs uppercase tracking-wide text-muted-foreground">
													Added lines
												</dt>
												<dd className="text-sm font-medium">
													{jobCompare.stats.added_lines}
												</dd>
											</div>
											<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
												<dt className="text-xs uppercase tracking-wide text-muted-foreground">
													Removed lines
												</dt>
												<dd className="text-sm font-medium">
													{jobCompare.stats.removed_lines}
												</dd>
											</div>
										</dl>
										{jobCompare.diff_markdown ? (
											<pre className="overflow-x-auto rounded-lg border border-border/70 bg-muted/20 p-3 text-xs leading-6">
												<code>{jobCompare.diff_markdown}</code>
											</pre>
										) : (
											<p className="text-sm text-muted-foreground">
												No line-level diff preview was produced.
											</p>
										)}
									</>
								) : (
									<p className="text-sm text-muted-foreground">
										No previous successful job is available for comparison yet.
									</p>
								)}
							</CardContent>
						</Card>

						<Card className="folo-surface border-border/70">
							<CardHeader>
								<h2 className="text-xl font-semibold">Knowledge cards</h2>
								<CardDescription>
									把它理解成“从这次结果里提炼出的长期可复用卡片”。它们比原始
									digest 更像可积累的知识对象。
								</CardDescription>
							</CardHeader>
							<CardContent>
								{knowledgeCards.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No knowledge cards generated yet.
									</p>
								) : (
									<ul className="space-y-3 text-sm">
										{knowledgeCards.map((card) => (
											<li
												key={`${card.card_type}-${card.order_index}-${card.title}`}
												className="rounded-lg border border-border/60 bg-muted/20 p-3"
											>
												<p className="text-xs uppercase tracking-wide text-muted-foreground">
													{card.card_type} · {card.source_section}
												</p>
												<p className="mt-1 font-medium">{card.title}</p>
												<p className="mt-1 text-muted-foreground">
													{card.body}
												</p>
											</li>
										))}
									</ul>
								)}
							</CardContent>
						</Card>

						<Card className="folo-surface border-border/70">
							<CardHeader>
								<h2 className="text-xl font-semibold">Degradations</h2>
							</CardHeader>
							<CardContent>
								{job.degradations.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No degradations recorded.
									</p>
								) : (
									<ul className="space-y-2 text-sm">
										{job.degradations.map((item, index) => {
											const degradationStatus =
												typeof item.status === "string"
													? toDisplayStatus(item.status).label
													: "n/a";
											return (
												<li
													key={`${item.step ?? "unknown"}-${index}`}
													className="leading-6"
												>
													<strong>{item.step ?? "unknown"}</strong>:{" "}
													{item.reason ?? degradationStatus}
												</li>
											);
										})}
									</ul>
								)}
							</CardContent>
						</Card>

						<Card className="folo-surface border-border/70">
							<CardHeader>
								<h2 className="text-xl font-semibold">Artifact index</h2>
							</CardHeader>
							<CardContent>
								{Object.keys(job.artifacts_index).length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No artifacts yet.
									</p>
								) : (
									<ul className="space-y-2 text-sm">
										{Object.entries(job.artifacts_index).map(([key, value]) => (
											<li key={key}>
												<strong>{key}</strong>:{" "}
												<a
													href={buildArtifactAssetUrl(job.id, value)}
													target="_blank"
													rel="noreferrer"
													className="text-primary underline-offset-4 hover:underline"
												>
													<code>{value}</code> (opens in a new tab)
												</a>
											</li>
										))}
									</ul>
								)}
							</CardContent>
						</Card>
					</section>
				</>
			) : null}
		</div>
	);
}

import type { Metadata } from "next";
import Link from "next/link";

import { FormInputField } from "@/components/form-field";
import { mapStatusCssToTone, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import {
	resolveSearchParams,
	type SearchParamsInput,
} from "@/lib/search-params";

export const metadata: Metadata = { title: "Ingest Runs" };

type IngestRunsPageProps = {
	searchParams?: SearchParamsInput;
};

function RunStatusBadge({ status }: { status: string }) {
	return (
		<StatusBadge
			label={status}
			tone={mapStatusCssToTone(status)}
		/>
	);
}

export default async function IngestRunsPage({
	searchParams,
}: IngestRunsPageProps) {
	const { run_id: runId } = await resolveSearchParams(searchParams, [
		"run_id",
	] as const);

	let runs: Awaited<ReturnType<typeof apiClient.listIngestRuns>> = [];
	let selectedRun: Awaited<ReturnType<typeof apiClient.getIngestRun>> | null = null;
	let error = false;

	try {
		runs = await apiClient.listIngestRuns({ limit: 10 });
		if (runId.trim()) {
			selectedRun = await apiClient.getIngestRun(runId.trim());
		}
	} catch {
		error = true;
	}

	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">SourceHarbor Intake</p>
				<h1 className="folo-page-title" data-route-heading>
					Ingest Runs
				</h1>
				<p className="folo-page-subtitle">
					把它理解成“摄取批次账本”。这里专门看每次拉取到底发没发车、进了多少候选、建了多少任务。
				</p>
			</div>

			<Card className="folo-surface border-border/70">
				<CardHeader>
					<h2 className="text-xl font-semibold">Find an ingest run</h2>
					<CardDescription>
						输入 `run_id` 可以看某次摄取详情；不输入时显示最近的运行批次。
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form method="GET" className="flex flex-wrap items-end gap-3">
						<FormInputField
							id="run-id-field"
							name="run_id"
							label="Run ID"
							type="text"
							placeholder="11111111-1111-1111-1111-111111111111"
							defaultValue={runId}
							data-field-kind="identifier"
							fieldClassName="min-w-[280px] flex-1"
						/>
						<Button type="submit">Search</Button>
					</form>
				</CardContent>
			</Card>

			{error ? (
				<Card className="folo-surface border-destructive/40 bg-destructive/5">
					<CardHeader>
						<h2 className="text-xl font-semibold">Load failed</h2>
						<CardDescription>当前无法加载 ingest runs。</CardDescription>
					</CardHeader>
				</Card>
			) : null}

			{!error ? (
				<section>
					<Card className="folo-surface border-border/70">
						<CardHeader className="flex flex-row items-start justify-between gap-4">
							<div className="space-y-2">
								<h2 className="text-xl font-semibold">Recent ingest runs</h2>
								<CardDescription>
									最近 10 次摄取批次，方便快速判断当前 intake 是否正常工作。
								</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="space-y-3">
							{runs.length === 0 ? (
								<p className="text-sm text-muted-foreground">暂无 ingest runs。</p>
							) : (
								<div className="overflow-x-auto rounded-lg border border-border/70">
									<table className="min-w-[760px] w-full text-sm">
										<caption className="sr-only">Recent ingest runs</caption>
										<thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
											<tr>
												<th scope="col" className="px-4 py-3 font-medium">Run ID</th>
												<th scope="col" className="px-4 py-3 font-medium">Platform</th>
												<th scope="col" className="px-4 py-3 font-medium">Status</th>
												<th scope="col" className="px-4 py-3 font-medium">Jobs</th>
												<th scope="col" className="px-4 py-3 font-medium">Candidates</th>
												<th scope="col" className="px-4 py-3 font-medium">Created</th>
											</tr>
										</thead>
										<tbody>
											{runs.map((run) => (
												<tr key={run.id} className="border-t border-border/60">
													<td className="px-4 py-3 font-mono text-xs">
														<Link
															href={`/ingest-runs?run_id=${encodeURIComponent(run.id)}`}
															className="text-primary underline-offset-4 hover:underline"
														>
															{run.id}
														</Link>
													</td>
													<td className="px-4 py-3">{run.platform ?? "all"}</td>
													<td className="px-4 py-3">
														<RunStatusBadge status={run.status} />
													</td>
													<td className="px-4 py-3">{run.jobs_created}</td>
													<td className="px-4 py-3">{run.candidates_count}</td>
													<td className="px-4 py-3">{formatDateTime(run.created_at)}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				</section>
			) : null}

			{selectedRun ? (
				<section>
					<Card className="folo-surface border-border/70">
						<CardHeader>
							<h2 className="text-xl font-semibold">Run detail</h2>
							<CardDescription>
								这一块更像“本次进货记录的详细账单”。
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
								<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
									<dt className="text-xs uppercase tracking-wide text-muted-foreground">Run ID</dt>
									<dd className="break-all text-sm font-medium">{selectedRun.id}</dd>
								</div>
								<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
									<dt className="text-xs uppercase tracking-wide text-muted-foreground">Workflow</dt>
									<dd className="break-all text-sm font-medium">{selectedRun.workflow_id ?? "-"}</dd>
								</div>
								<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
									<dt className="text-xs uppercase tracking-wide text-muted-foreground">Jobs created</dt>
									<dd className="text-sm font-medium">{selectedRun.jobs_created}</dd>
								</div>
								<div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
									<dt className="text-xs uppercase tracking-wide text-muted-foreground">Candidates</dt>
									<dd className="text-sm font-medium">{selectedRun.candidates_count}</dd>
								</div>
							</dl>
							{selectedRun.items.length > 0 ? (
								<div className="overflow-x-auto rounded-lg border border-border/70">
									<table className="min-w-[760px] w-full text-sm">
										<caption className="sr-only">Ingest run items</caption>
										<thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
											<tr>
												<th scope="col" className="px-4 py-3 font-medium">Video UID</th>
												<th scope="col" className="px-4 py-3 font-medium">Title</th>
												<th scope="col" className="px-4 py-3 font-medium">Job</th>
												<th scope="col" className="px-4 py-3 font-medium">Type</th>
												<th scope="col" className="px-4 py-3 font-medium">Status</th>
											</tr>
										</thead>
										<tbody>
											{selectedRun.items.map((item) => (
												<tr key={item.id} className="border-t border-border/60">
													<td className="px-4 py-3 font-mono text-xs">{item.video_uid}</td>
													<td className="px-4 py-3">{item.title ?? "-"}</td>
													<td className="px-4 py-3">
														{item.job_id ? (
															<Link
																href={`/jobs?job_id=${encodeURIComponent(item.job_id)}`}
																className="text-primary underline-offset-4 hover:underline"
															>
																{item.job_id}
															</Link>
														) : (
															"-"
														)}
													</td>
													<td className="px-4 py-3">{item.content_type}</td>
													<td className="px-4 py-3">{item.item_status}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">当前 run 还没有 item 详情。</p>
							)}
						</CardContent>
					</Card>
				</section>
			) : null}
		</div>
	);
}

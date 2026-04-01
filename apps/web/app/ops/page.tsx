import type { Metadata } from "next";
import Link from "next/link";

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
import type { OpsGate, OpsInboxItem } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
	title: "Ops Inbox",
	description:
		"Operator diagnostics for failed jobs, ingest issues, provider health, notifications, and live-hardening gates.",
};

function toBadgeStatus(status: string): string {
	const normalized = status.trim().toLowerCase();
	if (normalized === "critical") {
		return "failed";
	}
	if (normalized === "warning") {
		return "queued";
	}
	if (normalized === "ready" || normalized === "ok" || normalized === "healthy") {
		return "succeeded";
	}
	if (normalized === "warn" || normalized === "queued" || normalized === "timeout_or_unknown") {
		return "queued";
	}
	if (normalized === "blocked" || normalized === "failed" || normalized === "unavailable") {
		return "failed";
	}
	if (normalized === "degraded") {
		return "degraded";
	}
	return "queued";
}

function ReadinessBadge({
	label,
	status,
}: {
	label: string;
	status: string;
}) {
	return (
		<StatusBadge label={label} tone={mapStatusCssToTone(toBadgeStatus(status))} />
	);
}

function SummaryCard({
	title,
	value,
	description,
	status,
}: {
	title: string;
	value: number;
	description: string;
	status: string;
}) {
	const className =
		status === "blocked"
			? "folo-surface border-destructive/40 bg-destructive/5"
			: status === "warn"
				? "folo-surface border-amber-300/70 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/15"
				: "folo-surface border-border/70";

	return (
		<Card className={className}>
			<CardHeader className="gap-2">
				<CardDescription>{title}</CardDescription>
				<div className="text-3xl font-semibold">{value}</div>
			</CardHeader>
			<CardContent className="pt-0 text-sm text-muted-foreground">
				{description}
			</CardContent>
		</Card>
	);
}

function buildSummaryStatus(value: number): string {
	return value > 0 ? "blocked" : "ready";
}

function GateCard({
	title,
	gate,
}: {
	title: string;
	gate: OpsGate;
}) {
	return (
		<Card className="folo-surface border-border/70">
			<CardHeader className="gap-2">
				<div className="flex items-center justify-between gap-3">
					<CardTitle className="text-base">{title}</CardTitle>
					<ReadinessBadge label={gate.status} status={gate.status} />
				</div>
				<CardDescription>{gate.summary}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2 text-sm text-muted-foreground">
				<p>{gate.next_step}</p>
			</CardContent>
		</Card>
	);
}

function InboxRow({ item }: { item: OpsInboxItem }) {
	return (
		<tr className="border-t border-border/60">
			<td className="px-4 py-3 align-top">{item.kind}</td>
			<td className="px-4 py-3 align-top">
				<div className="space-y-1">
					<p className="font-medium">{item.title}</p>
					<p className="text-muted-foreground">{item.detail}</p>
				</div>
			</td>
			<td className="px-4 py-3 align-top">
				<ReadinessBadge label={item.status_label} status={item.severity} />
			</td>
			<td className="px-4 py-3 align-top text-sm text-muted-foreground">
				{formatDateTime(item.last_seen_at) || "-"}
			</td>
			<td className="px-4 py-3 align-top">
				<Button asChild variant="link" size="sm" className="h-auto px-0">
					<Link href={item.href}>{item.action_label} →</Link>
				</Button>
			</td>
		</tr>
	);
}

export default async function OpsPage() {
	const payload = await apiClient
		.getOpsInbox({ limit: 6, window_hours: 24 })
		.catch(() => null);

	if (payload === null) {
		return (
			<div className="folo-page-shell folo-unified-shell">
				<div className="folo-page-header">
					<p className="folo-page-kicker">SourceHarbor Ops</p>
					<h1 className="folo-page-title" data-route-heading>
						运营诊断
					</h1>
					<p className="folo-page-subtitle">
						先看异常，再跳到对应账本。这里不是新仪表盘，而是值班入口。
					</p>
				</div>
				<Card className="folo-surface border-destructive/40 bg-destructive/5">
					<CardHeader className="gap-2">
						<CardTitle className="text-base">当前无法汇总运营诊断</CardTitle>
						<CardDescription>
							请先确认 API health 和 full-stack 状态，再重试当前页面。
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-0">
						<Button asChild variant="outline" size="sm">
							<Link href="/">返回 command center</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const providerIssues = payload.provider_health.providers.filter((provider) => {
		const status = String(provider.last_status || "").toLowerCase();
		return status === "warn" || status === "fail";
	});

	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">SourceHarbor Ops</p>
				<h1 className="folo-page-title" data-route-heading>
					运营诊断
				</h1>
				<p className="folo-page-subtitle">
					先看异常，再跳到对应账本。这里不是新仪表盘，而是值班入口。
				</p>
			</div>

			{payload.failed_jobs.status !== "ok" ||
			payload.failed_ingest_runs.status !== "ok" ||
			payload.notification_deliveries.status !== "ok" ? (
				<Card className="folo-surface border-amber-300/70 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/15">
					<CardHeader className="gap-2">
						<CardTitle className="text-base">部分诊断数据暂不可用</CardTitle>
						<CardDescription>
							这页保留已成功加载的异常项。先看 API health 和 doctor 结果，再决定是否要重跑整页诊断。
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-0">
						<Button asChild variant="outline" size="sm">
							<Link href="/">返回 command center</Link>
						</Button>
					</CardContent>
				</Card>
			) : null}

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<SummaryCard
					title="待处理异常"
					value={payload.overview.attention_items}
					description="按值班优先级聚合后的异常总数。"
					status={buildSummaryStatus(payload.overview.attention_items)}
				/>
				<SummaryCard
					title="失败任务"
					value={payload.overview.failed_jobs}
					description="失败或 degraded 的任务需要先回到 job trace 查账。"
					status={buildSummaryStatus(payload.overview.failed_jobs)}
				/>
				<SummaryCard
					title="失败摄取"
					value={payload.overview.failed_ingest_runs}
					description="最近 ingest runs 里真正没发车或半路失败的批次。"
					status={buildSummaryStatus(payload.overview.failed_ingest_runs)}
				/>
				<SummaryCard
					title="通知 / Gate"
					value={payload.overview.notification_or_gate_issues}
					description="通知链路、provider health 和 hardening gate 的异常总和。"
					status={buildSummaryStatus(payload.overview.notification_or_gate_issues)}
				/>
			</section>

			<section id="ops-inbox">
				<Card className="folo-surface border-border/70">
					<CardHeader>
						<CardTitle>Ops inbox</CardTitle>
						<CardDescription>
							把它理解成值班收件箱。每条异常都给一个主跳转，不逼你先猜该去 Jobs、Ingest Runs 还是 Settings。
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{payload.inbox_items.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								当前没有需要值班处理的异常。最近任务、摄取、通知链路都在可接受范围内。
							</p>
						) : (
							<div className="overflow-x-auto rounded-lg border border-border/70">
								<table className="min-w-[840px] w-full text-sm">
									<caption className="sr-only">Ops inbox</caption>
									<thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
										<tr>
											<th scope="col" className="px-4 py-3 font-medium">
												Type
											</th>
											<th scope="col" className="px-4 py-3 font-medium">
												What happened
											</th>
											<th scope="col" className="px-4 py-3 font-medium">
												Current status
											</th>
											<th scope="col" className="px-4 py-3 font-medium">
												Last seen
											</th>
											<th scope="col" className="px-4 py-3 font-medium">
												Primary action
											</th>
										</tr>
									</thead>
									<tbody>
										{payload.inbox_items.map((item) => (
											<InboxRow
												key={`${item.kind}-${item.href}-${item.title}`}
												item={item}
											/>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</section>

			<section id="hardening-gates" className="grid gap-4 lg:grid-cols-2">
				<GateCard title="Retrieval" gate={payload.gates.retrieval} />
				<GateCard title="Notifications" gate={payload.gates.notifications} />
				<GateCard title="UI audit" gate={payload.gates.ui_audit} />
				<GateCard title="Computer use" gate={payload.gates.computer_use} />
			</section>

			<section className="grid gap-4 lg:grid-cols-2">
				<Card id="provider-health" className="folo-surface border-border/70">
					<CardHeader>
						<CardTitle>Provider health</CardTitle>
						<CardDescription>
							这是系统是不是整体歪了的快速视图。黄色表示需要人工确认，红色表示最近有明确失败。
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{providerIssues.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								当前没有 provider health 异常记录。
							</p>
						) : (
							<ul className="space-y-3 text-sm text-muted-foreground">
								{providerIssues.map((provider) => (
									<li
										key={provider.provider}
										className="rounded-lg border border-border/60 bg-muted/20 p-3"
									>
										<div className="flex items-center justify-between gap-3">
											<p className="font-medium text-foreground">
												{provider.provider}
											</p>
											<ReadinessBadge
												label={provider.last_status || "unknown"}
												status={provider.last_status || "warn"}
											/>
										</div>
										<p>
											{provider.last_message ||
												provider.last_error_kind ||
												"Provider health requires operator attention."}
										</p>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>

				<Card id="notification-readiness" className="folo-surface border-border/70">
					<CardHeader>
						<CardTitle>Notification readiness</CardTitle>
						<CardDescription>
							把“通知配置没填好”和“通知发送失败”拆开看，避免把两类问题混成一句“通知坏了”。
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>{payload.gates.notifications.summary}</p>
						<p>{payload.gates.notifications.next_step}</p>
						{payload.notification_deliveries.items.length === 0 ? (
							<p>当前没有待处理的 notification deliveries。</p>
						) : (
							<ul className="space-y-2">
								{payload.notification_deliveries.items.map((item) => (
									<li
										key={item.id}
										className="rounded-lg border border-border/60 bg-muted/20 p-3"
									>
										<p className="font-medium text-foreground">{item.kind}</p>
										<p>
											{item.status}
											{item.error_message ? ` · ${item.error_message}` : ""}
										</p>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}

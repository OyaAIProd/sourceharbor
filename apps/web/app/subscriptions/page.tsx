import type { Metadata } from "next";
import Link from "next/link";

import { getActionSessionTokenForForm } from "@/app/action-security";
import { getFlashMessage } from "@/app/flash-message";
import { upsertSubscriptionAction } from "@/app/subscriptions/actions";
import {
	FormCheckboxField,
	FormInputField,
	FormSelectField,
} from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { SubscriptionBatchPanel } from "@/components/subscription-batch-panel";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import {
	resolveSearchParams,
	type SearchParamsInput,
} from "@/lib/search-params";

export const metadata: Metadata = { title: "Subscriptions" };

type SubscriptionsPageProps = {
	searchParams?: SearchParamsInput;
};

const PLATFORM_OPTIONS = [
	{ value: "youtube", label: "YouTube" },
	{ value: "bilibili", label: "Bilibili" },
];

const SOURCE_TYPE_OPTIONS = [
	{ value: "url", label: "Source URL" },
	{ value: "youtube_channel_id", label: "YouTube channel ID" },
	{ value: "bilibili_uid", label: "Bilibili user UID" },
];

const ADAPTER_TYPE_OPTIONS = [
	{ value: "rsshub_route", label: "RSSHub route" },
	{ value: "rss_generic", label: "Generic RSS" },
];

const CATEGORY_OPTIONS = [
	{ value: "misc", label: "Other" },
	{ value: "tech", label: "Tech" },
	{ value: "creator", label: "Creator" },
	{ value: "macro", label: "Macro" },
	{ value: "ops", label: "Operations" },
];

function renderAlert(status: string, code: string) {
	if (!status || !code) {
		return null;
	}
	const isError = status === "error";
	if (isError) {
		return (
			<p className="alert alert-enter error" role="alert" aria-live="assertive">
				{getFlashMessage(code)}
			</p>
		);
	}
	return (
		<output
			className="alert alert-enter success"
			aria-live="polite"
			aria-atomic="true"
		>
			{getFlashMessage(code)}
		</output>
	);
}

export default async function SubscriptionsPage({
	searchParams,
}: SubscriptionsPageProps) {
	const { status, code } = await resolveSearchParams(searchParams, [
		"status",
		"code",
	] as const);
	const sessionToken = getActionSessionTokenForForm();
	const subscriptionsResult = await apiClient
		.listSubscriptions()
		.then((data) => ({ data, errorCode: null as string | null }))
		.catch(() => ({
			data: [] as Awaited<ReturnType<typeof apiClient.listSubscriptions>>,
			errorCode: "ERR_REQUEST_FAILED",
		}));
	const subscriptions = subscriptionsResult.data;

	return (
		<div className="folo-page-shell folo-unified-shell">
			<div className="folo-page-header">
				<p className="folo-page-kicker">SourceHarbor Sources</p>
				<h1 className="folo-page-title" data-route-heading>
					Subscriptions
				</h1>
				<p className="folo-page-subtitle">
					Manage source settings, categories, and priority so ingestion and
					digest pipelines always start from stable inputs.
				</p>
			</div>

			{renderAlert(status, code)}
			{subscriptionsResult.errorCode ? (
				<Card
					className="folo-surface border-destructive/40 bg-destructive/5"
					role="alert"
					aria-live="assertive"
				>
					<CardHeader className="gap-2">
						<CardTitle className="text-base">
							Unable to load subscriptions
						</CardTitle>
						<CardDescription>
							{getFlashMessage(subscriptionsResult.errorCode)}
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-0">
						<Button asChild variant="outline" size="sm">
							<Link href="/subscriptions">Retry this page</Link>
						</Button>
					</CardContent>
				</Card>
			) : null}

			<section>
				<Card className="folo-surface border-border/70">
					<CardHeader className="gap-2">
						<h2 className="text-xl font-semibold">
							Create or update a subscription
						</h2>
						<CardDescription>
							Choose a source type first, then enter the matching source value.
							Only fill in Source URL when using Generic RSS.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							action={upsertSubscriptionAction}
							className="grid gap-5 md:grid-cols-2"
							data-auto-disable-required="true"
						>
							<input
								type="hidden"
								name="session_token"
								value={sessionToken}
								suppressHydrationWarning
							/>
							<FormSelectField
								id="platform"
								name="platform"
								label="Platform"
								defaultValue="youtube"
								options={PLATFORM_OPTIONS}
							/>
							<FormSelectField
								id="source_type"
								name="source_type"
								label="Source type"
								defaultValue="url"
								options={SOURCE_TYPE_OPTIONS}
							/>
							<FormInputField
								id="source_value"
								name="source_value"
								label="Source value"
								required
								placeholder="Channel ID / UID / URL"
							/>
							<FormSelectField
								id="adapter_type"
								name="adapter_type"
								label="Adapter type"
								defaultValue="rsshub_route"
								options={ADAPTER_TYPE_OPTIONS}
							/>
							<FormInputField
								id="source_url"
								name="source_url"
								label="Source URL (for rss_generic)"
								type="url"
								placeholder="https://example.com/feed.xml"
							/>
							<FormInputField
								id="rsshub_route"
								name="rsshub_route"
								label="RSSHub route (optional)"
								placeholder="/youtube/channel/UCxxxx"
							/>
							<FormSelectField
								id="category"
								name="category"
								label="Category"
								defaultValue="misc"
								options={CATEGORY_OPTIONS}
							/>
							<FormInputField
								id="tags"
								name="tags"
								label="Tags (comma-separated, optional)"
								placeholder="ai,weekly,high-priority"
							/>
							<FormInputField
								id="priority"
								name="priority"
								label="Priority (0-100)"
								type="number"
								min={0}
								max={100}
								defaultValue={50}
							/>
							<FormCheckboxField
								name="enabled"
								label="Enabled"
								defaultChecked
								fieldClassName="md:col-span-2"
							/>
							<div className="md:col-span-2">
								<SubmitButton
									pendingLabel="Saving..."
									statusText="Saving subscription settings"
								>
									Save subscription
								</SubmitButton>
							</div>
						</form>
					</CardContent>
				</Card>
			</section>

			<section>
				<Card className="folo-surface border-border/70">
					<CardHeader className="gap-2">
						<h2 className="text-xl font-semibold">Current subscriptions</h2>
						<CardDescription>
							<output
								className="text-sm text-muted-foreground"
								aria-live="polite"
								aria-atomic="true"
							>
								Loaded {subscriptions.length} subscriptions.
							</output>
							<p className="text-sm text-muted-foreground">
								Select multiple rows to update categories in bulk. The action
								bar appears at the bottom.
							</p>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<SubscriptionBatchPanel
							subscriptions={subscriptions}
							sessionToken={sessionToken}
						/>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}

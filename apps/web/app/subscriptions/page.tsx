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
import { getLocaleMessages } from "@/lib/i18n/messages";
import {
	resolveSearchParams,
	type SearchParamsInput,
} from "@/lib/search-params";
import { buildProductMetadata } from "@/lib/seo";

const subscriptionsCopy = getLocaleMessages().subscriptionsPage;

export const metadata: Metadata = buildProductMetadata({
	title: subscriptionsCopy.metadataTitle,
	description: subscriptionsCopy.metadataDescription,
	route: "subscriptions",
});

type SubscriptionsPageProps = {
	searchParams?: SearchParamsInput;
};

const PLATFORM_KEYS = ["youtube", "bilibili"] as const;
const SOURCE_TYPE_KEYS = ["url", "youtube_channel_id", "bilibili_uid"] as const;
const ADAPTER_TYPE_KEYS = ["rsshub_route", "rss_generic"] as const;
const CATEGORY_KEYS = ["misc", "tech", "creator", "macro", "ops"] as const;

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
	const copy = getLocaleMessages().subscriptionsPage;
	const platformOptions = PLATFORM_KEYS.map((value) => ({
		value,
		label: copy.platformOptions[value as keyof typeof copy.platformOptions],
	}));
	const sourceTypeOptions = SOURCE_TYPE_KEYS.map((value) => ({
		value,
		label:
			copy.sourceTypeOptions[
				value === "url"
					? "url"
					: value === "youtube_channel_id"
						? "youtubeChannelId"
						: "bilibiliUid"
			],
	}));
	const adapterTypeOptions = ADAPTER_TYPE_KEYS.map((value) => ({
		value,
		label:
			copy.adapterTypeOptions[
				value === "rsshub_route" ? "rsshubRoute" : "rssGeneric"
			],
	}));
	const categoryOptions = CATEGORY_KEYS.map((value) => ({
		value,
		label: copy.categoryOptions[value],
	}));
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
				<p className="folo-page-kicker">{copy.kicker}</p>
				<h1 className="folo-page-title" data-route-heading>
					{copy.heroTitle}
				</h1>
				<p className="folo-page-subtitle">{copy.heroSubtitle}</p>
			</div>

			{renderAlert(status, code)}
			{subscriptionsResult.errorCode ? (
				<Card
					className="folo-surface border-destructive/40 bg-destructive/5"
					role="alert"
					aria-live="assertive"
				>
					<CardHeader className="gap-2">
						<CardTitle className="text-base">{copy.loadErrorTitle}</CardTitle>
						<CardDescription>
							{getFlashMessage(subscriptionsResult.errorCode)}
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-0">
						<Button asChild variant="outline" size="sm">
							<Link href="/subscriptions">{copy.retryCurrentPageButton}</Link>
						</Button>
					</CardContent>
				</Card>
			) : null}

			<section>
				<Card className="folo-surface border-border/70">
					<CardHeader className="gap-2">
						<h2 className="text-xl font-semibold">{copy.editorTitle}</h2>
						<CardDescription>{copy.editorDescription}</CardDescription>
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
								label={copy.formLabels.platform}
								defaultValue="youtube"
								options={platformOptions}
							/>
							<FormSelectField
								id="source_type"
								name="source_type"
								label={copy.formLabels.sourceType}
								defaultValue="url"
								options={sourceTypeOptions}
							/>
							<FormInputField
								id="source_value"
								name="source_value"
								label={copy.formLabels.sourceValue}
								required
								placeholder={copy.placeholders.sourceValue}
							/>
							<FormSelectField
								id="adapter_type"
								name="adapter_type"
								label={copy.formLabels.adapterType}
								defaultValue="rsshub_route"
								options={adapterTypeOptions}
							/>
							<FormInputField
								id="source_url"
								name="source_url"
								label={copy.formLabels.sourceUrl}
								type="url"
								placeholder={copy.placeholders.sourceUrl}
							/>
							<FormInputField
								id="rsshub_route"
								name="rsshub_route"
								label={copy.formLabels.rsshubRoute}
								placeholder={copy.placeholders.rsshubRoute}
							/>
							<FormSelectField
								id="category"
								name="category"
								label={copy.formLabels.category}
								defaultValue="misc"
								options={categoryOptions}
							/>
							<FormInputField
								id="tags"
								name="tags"
								label={copy.formLabels.tags}
								placeholder={copy.placeholders.tags}
							/>
							<FormInputField
								id="priority"
								name="priority"
								label={copy.formLabels.priority}
								type="number"
								min={0}
								max={100}
								defaultValue={50}
							/>
							<FormCheckboxField
								name="enabled"
								label={copy.formLabels.enabled}
								defaultChecked
								fieldClassName="md:col-span-2"
							/>
							<div className="md:col-span-2">
								<SubmitButton
									pendingLabel={copy.savePending}
									statusText={copy.saveStatus}
								>
									{copy.saveButton}
								</SubmitButton>
							</div>
						</form>
					</CardContent>
				</Card>
			</section>

			<section>
				<Card className="folo-surface border-border/70">
					<CardHeader className="gap-2">
						<h2 className="text-xl font-semibold">{copy.currentTitle}</h2>
						<CardDescription>
							<output
								className="text-sm text-muted-foreground"
								aria-live="polite"
								aria-atomic="true"
							>
								{copy.loadedPrefix} {subscriptions.length} {copy.loadedSuffix}
							</output>
							<p className="text-sm text-muted-foreground">
								{copy.currentDescription}
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

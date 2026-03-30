type ExtensibleString = string & {};
export type Platform = "youtube" | "bilibili" | ExtensibleString;
export type SourceType =
	| "url"
	| "youtube_channel_id"
	| "bilibili_uid"
	| ExtensibleString;
export type SubscriptionCategory =
	| "tech"
	| "creator"
	| "macro"
	| "ops"
	| "misc";
export type SubscriptionAdapterType =
	| "rsshub_route"
	| "rss_generic"
	| ExtensibleString;
export type JobStatus = "queued" | "running" | "succeeded" | "failed";
export type PipelineFinalStatus = "succeeded" | "degraded" | "failed";
export type VideoProcessMode =
	| "full"
	| "text_only"
	| "refresh_comments"
	| "refresh_llm";

export type Subscription = {
	id: string;
	platform: Platform;
	source_type: SourceType;
	source_value: string;
	source_name: string;
	adapter_type: SubscriptionAdapterType;
	source_url: string | null;
	rsshub_route: string;
	category: SubscriptionCategory;
	tags: string[];
	priority: number;
	enabled: boolean;
	created_at: string;
	updated_at: string;
};

export type SubscriptionUpsertRequest = {
	platform: Platform;
	source_type: SourceType;
	source_value: string;
	adapter_type?: SubscriptionAdapterType;
	source_url?: string | null;
	rsshub_route?: string | null;
	category?: SubscriptionCategory;
	tags?: string[];
	priority?: number;
	enabled?: boolean;
};

export type SubscriptionUpsertResponse = {
	subscription: Subscription;
	created: boolean;
};

export type IngestPollRequest = {
	subscription_id?: string;
	platform?: Platform;
	max_new_videos?: number;
};

export type IngestCandidate = {
	video_id: string;
	platform: Platform;
	video_uid: string;
	source_url: string;
	title: string | null;
	published_at: string | null;
	job_id: string;
};

export type IngestPollResponse = {
	run_id: string;
	workflow_id: string | null;
	status: "queued" | "running" | "succeeded" | "failed" | "skipped";
	enqueued: number;
	candidates: IngestCandidate[];
};

export type IngestRunItem = {
	id: string;
	subscription_id: string | null;
	video_id: string | null;
	job_id: string | null;
	ingest_event_id: string | null;
	platform: Platform | string;
	video_uid: string;
	source_url: string;
	title: string | null;
	published_at: string | null;
	entry_hash: string | null;
	pipeline_mode: string | null;
	content_type: ContentType;
	item_status: string;
	created_at: string;
	updated_at: string;
};

export type IngestRunSummary = {
	id: string;
	subscription_id: string | null;
	workflow_id: string | null;
	platform: Platform | string | null;
	max_new_videos: number;
	status: "queued" | "running" | "succeeded" | "failed" | "skipped";
	jobs_created: number;
	candidates_count: number;
	feeds_polled: number;
	entries_fetched: number;
	entries_normalized: number;
	ingest_events_created: number;
	ingest_event_duplicates: number;
	job_duplicates: number;
	error_message: string | null;
	created_at: string;
	updated_at: string;
	completed_at: string | null;
};

export type IngestRun = IngestRunSummary & {
	requested_by: string | null;
	requested_trace_id: string | null;
	filters_json: Record<string, unknown> | null;
	items: IngestRunItem[];
};

export type Video = {
	id: string;
	platform: Platform;
	video_uid: string;
	source_url: string;
	title: string | null;
	published_at: string | null;
	first_seen_at: string;
	last_seen_at: string;
	status: JobStatus | null;
	last_job_id: string | null;
	content_type?: ContentType;
};

export type VideoProcessRequest = {
	video: {
		platform: Platform;
		url: string;
		video_id?: string | null;
	};
	mode?: VideoProcessMode;
	overrides?: Record<string, unknown>;
	force?: boolean;
};

export type VideoProcessResponse = {
	job_id: string;
	video_db_id: string;
	video_uid: string;
	status: JobStatus;
	idempotency_key: string;
	mode: VideoProcessMode;
	overrides: Record<string, unknown>;
	force: boolean;
	reused: boolean;
	workflow_id: string | null;
};

export type JobStepSummary = {
	name: string;
	status: string;
	attempt: number;
	started_at: string | null;
	finished_at: string | null;
	error: unknown;
};

export type JobStepDetail = JobStepSummary & {
	error_kind: string | null;
	retry_meta: Record<string, unknown> | null;
	result: Record<string, unknown> | null;
	thought_metadata: Record<string, unknown>;
	cache_key: string | null;
};

export type JobDegradation = {
	step: string | null;
	status: string | null;
	reason: string | null;
	error: unknown;
	error_kind: string | null;
	retry_meta: Record<string, unknown> | null;
	cache_meta: Record<string, unknown> | null;
};

export type Job = {
	id: string;
	video_id: string;
	kind: "video_digest_v1" | "phase2_ingest_stub";
	status: JobStatus;
	idempotency_key: string;
	error_message: string | null;
	artifact_digest_md: string | null;
	artifact_root: string | null;
	llm_required: boolean | null;
	llm_gate_passed: boolean | null;
	hard_fail_reason: string | null;
	created_at: string;
	updated_at: string;
	step_summary: JobStepSummary[];
	steps: JobStepDetail[];
	degradations: JobDegradation[];
	pipeline_final_status: PipelineFinalStatus | null;
	artifacts_index: Record<string, string>;
	mode: VideoProcessMode | null;
	notification_retry: NotificationRetrySummary | null;
};

export type NotificationRetrySummary = {
	delivery_id: string;
	status: string;
	attempt_count: number;
	next_retry_at: string | null;
	last_error_kind: string | null;
};

export type JobCompareStats = {
	added_lines: number;
	removed_lines: number;
	changed: boolean;
};

export type JobCompare = {
	job_id: string;
	previous_job_id: string | null;
	has_previous: boolean;
	current_digest: string | null;
	previous_digest: string | null;
	diff_markdown: string;
	stats: JobCompareStats;
};

export type KnowledgeCard = {
	id?: string;
	job_id?: string;
	video_id?: string;
	card_type: string;
	title: string | null;
	body: string;
	source_section: string;
	order_index: number;
	metadata_json?: Record<string, unknown>;
	created_at?: string;
	updated_at?: string;
};

export type FeedFeedback = {
	job_id: string;
	saved: boolean;
	feedback_label: "useful" | "noisy" | "dismissed" | "archived" | null;
	exists: boolean;
	created_at: string | null;
	updated_at: string | null;
};

export type ArtifactMarkdownWithMeta = {
	markdown: string;
	meta: Record<string, unknown> | null;
};

export type NotificationConfig = {
	enabled: boolean;
	to_email: string | null;
	daily_digest_enabled: boolean;
	daily_digest_hour_utc: number | null;
	failure_alert_enabled: boolean;
	category_rules: Record<string, unknown>;
	created_at: string;
	updated_at: string;
};

export type NotificationConfigUpdateRequest = {
	enabled: boolean;
	to_email: string | null;
	daily_digest_enabled: boolean;
	daily_digest_hour_utc: number | null;
	failure_alert_enabled: boolean;
	category_rules?: Record<string, unknown>;
};

export type NotificationTestRequest = {
	to_email?: string | null;
	subject?: string | null;
	body?: string | null;
};

export type NotificationSendResponse = {
	delivery_id: string;
	status: string;
	provider_message_id: string | null;
	error_message: string | null;
	recipient_email: string;
	subject: string;
	sent_at: string | null;
	created_at: string;
};

export type ContentType = "video" | "article";

export type DigestFeedItem = {
	feed_id: string;
	job_id: string;
	video_url: string;
	title: string;
	source: Platform | string;
	source_name: string;
	category: SubscriptionCategory;
	published_at: string;
	summary_md: string;
	artifact_type: "digest" | "outline";
	content_type?: ContentType;
	saved?: boolean;
	feedback_label?: "useful" | "noisy" | "dismissed" | "archived" | null;
};

export type DigestFeedResponse = {
	items: DigestFeedItem[];
	has_more: boolean;
	next_cursor: string | null;
};

export type FeedFeedbackUpdateRequest = {
	job_id: string;
	saved: boolean;
	feedback_label?: "useful" | "noisy" | "dismissed" | "archived" | null;
};

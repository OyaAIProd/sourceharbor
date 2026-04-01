export const SUPPORTED_LOCALES = ["en", "zh-CN"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

const MESSAGES = {
	en: {
		common: {
			close: "Close",
		},
		formValidation: {
			required: "Fill in and fix the required fields before submitting.",
			requireOne: "Fill in at least one required source before submitting.",
			requireOneExclusive:
				"Only one source can be filled right now. Clear the extra inputs before submitting.",
		},
		loading: {
			app: {
				title: "Dashboard loading",
				message: "Loading the command center. Please wait.",
			},
			settings: {
				title: "Settings loading",
				message: "Loading notification settings. Please wait.",
			},
		},
		submitButton: {
			defaultPendingLabel: "Submitting…",
			pendingBadge: "Working",
			pendingSrOnly: "Submitting. Please wait.",
		},
		syncNow: {
			idle: {
				buttonLabel: "Sync now",
				badgeLabel: "Idle",
				statusLabel: "Idle: sync the newest source updates on demand.",
			},
			loading: {
				buttonLabel: "Syncing…",
				badgeLabel: "Syncing",
				statusLabel: "Fetching and analyzing new content. Please wait.",
				liveStatusLabel: "Sync in progress. Please wait.",
				retryTitle: "Sync failed. Press Enter or Space to retry.",
			},
			done: {
				buttonLabel: "Sync complete",
				badgeLabel: "Done",
				statusLabel: "Sync complete. Refreshing the list next.",
				liveStatusLabel: "Sync complete. Refreshing the list now.",
			},
			error: {
				buttonLabel: "Sync failed, retry",
				badgeLabel: "Retry needed",
				statusLabel:
					"Sync failed. Check the network or API health, then retry.",
				liveStatusLabel:
					"Sync failed. Check the network or API health, then retry.",
				retryTitle: "Sync failed. Press Enter or Space to retry.",
			},
		},
		relativeTime: {
			soon: "soon",
			tomorrow: "tomorrow",
			justNow: "just now",
			minuteFuture: "in {count} minute | in {count} minutes",
			hourFuture: "in {count} hour | in {count} hours",
			dayFuture: "in {count} day | in {count} days",
			weekFuture: "in {count} week | in {count} weeks",
			monthFuture: "in {count} month | in {count} months",
			yearFuture: "in {count} year | in {count} years",
			minutePast: "{count} minute ago | {count} minutes ago",
			hourPast: "{count} hour ago | {count} hours ago",
			dayPast: "{count} day ago | {count} days ago",
			weekPast: "{count} week ago | {count} weeks ago",
			monthPast: "{count} month ago | {count} months ago",
			yearPast: "{count} year ago | {count} years ago",
			absoluteLocale: "en-US",
		},
		dashboard: {
			metadataTitle: "Command Center",
			metadataDescription:
				"SourceHarbor command center for AI knowledge intake, grounded retrieval, operator triage, and builder entry through MCP and HTTP API.",
			kicker: "SourceHarbor Command Center",
			heroTitle: "AI knowledge control tower",
			heroSubtitle:
				"Run intake, grounded retrieval, job orchestration, and agent reuse from one operator-facing command center.",
			frontDoors: {
				searchTitle: "Search front door",
				searchDescription:
					"Search digests, knowledge cards, transcripts, and related evidence from one operator-facing route.",
				searchCta: "Open Search",
				knowledgeCta: "Open Knowledge",
				askTitle: "Ask your sources",
				askDescription:
					"Truthful MVP: ask a question, get grounded evidence, then jump to job trace, feed, knowledge, or the original source.",
				askCta: "Open Ask",
				askHint: "No hidden answer layer yet. Grounded citations first.",
				mcpTitle: "MCP front door",
				mcpDescription:
					"SourceHarbor already exposes an agent-facing MCP surface on top of the same API and pipeline state.",
				mcpCta: "Open MCP quickstart",
				jobCta: "Inspect job evidence",
			},
			compounders: {
				watchlistsTitle: "Watchlists and trends",
				watchlistsDescription:
					"Save a topic, claim kind, or source watchlist, then come back to a real cross-run trend instead of redoing the same search by hand.",
				watchlistsCta: "Open Watchlists",
				trendsCta: "Open Trends",
				bundleTitle: "Evidence bundle",
				bundleDescription:
					"Carry a run forward as an internal bundle with digest, trace summary, knowledge cards, and artifact manifest instead of pasting screenshots into chat.",
				bundleCta: "Open Job Trace",
				bundleHint: "Download the bundle from any job detail page.",
				playgroundTitle: "Sample playground",
				playgroundDescription:
					"Explore a clearly labeled demo corpus and use-case pages without pretending they are live operator results.",
				playgroundCta: "Open Playground",
				useCasesCta: "Open use case pages",
			},
			loadErrorTitle: "Unable to load the command center",
			retryCurrentPage: "Retry this page",
			metricsRegionLabel: "Key metrics",
			metrics: {
				subscriptions: {
					title: "Subscriptions",
					unavailable: "Subscription data is temporarily unavailable",
					emptyCta: "Add your first subscription →",
				},
				discoveredVideos: {
					title: "Discovered videos",
					unavailable: "Discovered video data is temporarily unavailable",
				},
				runningJobs: {
					title: "Running / queued",
					unavailable: "Running and queued job data is temporarily unavailable",
				},
				failedJobs: {
					title: "Failed jobs",
					unavailable: "Failed job data is temporarily unavailable",
					openFailed: "Open failed jobs →",
					openOps: "Open Ops inbox →",
				},
				unavailableOutput: "Data unavailable",
			},
			pollIngest: {
				title: "Poll subscriptions",
				description:
					"Create a new ingest run, then jump into jobs and traces instead of guessing whether intake actually moved.",
				platformLabel: "Platform (optional)",
				maxNewVideosLabel: "Maximum new videos",
				submit: "Run ingest poll",
				submitPending: "Queuing ingest…",
				submitStatus: "Creating a new ingest run. Please wait.",
				queueLink: "Open job queue →",
			},
			processVideo: {
				title: "Process a single source",
				description:
					"Queue one source URL into the pipeline and inspect the resulting trace, artifacts, and retrieval surface.",
				platformLabel: "Platform *",
				urlLabel: "Source URL *",
				modeLabel: "Mode *",
				forceLabel: "Force rerun",
				submit: "Start processing",
				submitPending: "Creating job…",
				submitStatus: "Creating a new processing job. Please wait.",
				jobDetailLink: "Open job detail →",
			},
			ingestRuns: {
				title: "Recent ingest runs",
				description:
					"Use this like a receiving ledger. If you just triggered intake, this section should confirm whether the run actually moved.",
				viewAll: "Open all ingest runs →",
				unavailable: "Ingest run data is temporarily unavailable.",
				empty: "No ingest runs yet.",
				caption: "Recent ingest run list",
				platform: "Platform",
				status: "Status",
				newJobs: "New jobs",
				candidates: "Candidates",
				allPlatforms: "All",
			},
			recentVideos: {
				title: "Recent videos",
				description:
					"Only the 10 newest videos are shown here. Jump to the job trace to inspect the full run history.",
				viewAll: "Open all jobs →",
				empty: "No videos yet.",
				unavailable: "Unable to load the video list right now.",
				caption: "Recent video list",
				titleColumn: "Title",
				platformColumn: "Platform",
				statusColumn: "Status",
				lastJobColumn: "Latest job",
			},
			pollPlatformOptions: {
				all: "All",
			},
			processModeOptions: {
				full: "Full run",
				textOnly: "Text only",
				refreshComments: "Refresh comments",
				refreshLlm: "Refresh LLM outputs",
			},
		},
		ops: {
			metadataTitle: "Ops Inbox",
			metadataDescription:
				"Operator inbox for SourceHarbor failures, provider health, delivery readiness, hardening gates, and recommended next steps.",
			kicker: "SourceHarbor Ops",
			heroTitle: "Ops inbox",
			heroSubtitle:
				"Open the operator queue for failures, provider health, delivery readiness, and the next action to take.",
			loadErrorTitle: "Unable to aggregate Ops diagnostics",
			loadErrorDescription:
				"Check API health and the local full-stack status, then retry this page.",
			partialDataTitle: "Some diagnostics are temporarily unavailable",
			partialDataDescription:
				"This page keeps the items that did load. Check API health and doctor before re-running the full Ops fetch.",
			backToDashboard: "Back to command center",
			summary: {
				attentionItems: {
					title: "Attention items",
					description: "Total queue items that currently need operator review.",
				},
				failedJobs: {
					title: "Failed jobs",
					description:
						"Jobs that should send you back to the job trace before anything else.",
				},
				failedIngest: {
					title: "Failed ingest runs",
					description:
						"Ingest batches that did not launch or failed part-way through.",
				},
				notificationGate: {
					title: "Notification / gate issues",
					description:
						"A combined count of notification readiness, provider health, and hardening gates.",
				},
			},
			inbox: {
				title: "Ops inbox",
				description:
					"Treat this like the operator mailbox. Each item gives you one primary jump target instead of making you guess the right ledger.",
				empty:
					"There are no operator issues to triage right now. Recent jobs, ingest runs, and notification paths are inside the acceptable range.",
			},
			nextSteps: {
				title: "Recommended next steps",
				description:
					"Treat this as the operator copilot layer. It translates gates and inbox items into the next few moves instead of making you parse every table by hand.",
				noActions:
					"There are no urgent next steps right now. Stay on this page only if you want to inspect provider health or delivery readiness in detail.",
				triagePrefix: "Triage inbox item",
				gatePrefix: "Review hardening gate",
				openAction: "Open action",
			},
			providerHealth: {
				title: "Provider health",
				description:
					"Use this as the fast answer to whether the whole system is drifting. Yellow means operator review; red means a recent explicit failure.",
				empty: "No provider health incidents are currently recorded.",
				defaultMessage: "Provider health needs operator review.",
			},
			notificationReadiness: {
				title: "Notification readiness",
				description:
					"Keep missing config separate from actual send failures so the team does not flatten both into “notifications are broken.”",
				empty: "There are no pending notification deliveries right now.",
			},
		},
		settings: {
			metadataTitle: "Settings",
			metadataDescription:
				"Notification delivery settings, daily digest scheduling, failure alerts, and test-send controls for SourceHarbor operators.",
			kicker: "SourceHarbor Settings",
			heroTitle: "Notification settings",
			heroSubtitle:
				"Control digest delivery, failure alerts, and test-send behavior from one operator surface.",
			loadErrorTitle: "Unable to load settings",
			retryCurrentPage: "Retry this page",
			configSectionTitle: "Notification configuration",
			configDates: "Created: {createdAt} | Updated: {updatedAt}",
			enabledLabel: "Enable notifications",
			toEmailLabel: "Recipient email",
			dailyDigestLabel: "Enable daily digest",
			dailyDigestHourLabel: "Daily digest send hour (UTC)",
			dailyDigestHint:
				"Local-time preview: this field uses a UTC hour. Convert your local target hour into UTC before saving.",
			failureAlertLabel: "Enable failure alerts",
			saveButton: "Save configuration",
			savePending: "Saving…",
			saveStatus: "Saving notification settings. Please wait.",
			testSectionTitle: "Send test notification",
			testRecipientDescription: "Current default recipient: {email}",
			testRecipientMissing:
				"Current default recipient: not set yet. Add one above before sending a test message.",
			overrideRecipientLabel: "Override recipient (optional)",
			overrideRecipientPlaceholder:
				"Leave blank to use the configured recipient",
			subjectLabel: "Subject (optional)",
			subjectPlaceholder: "SourceHarbor test notification",
			bodyLabel: "Body (optional)",
			bodyPlaceholder: "This is a SourceHarbor test notification.",
			sendButton: "Send test email",
			sendPending: "Sending…",
			sendStatus: "Sending the test notification. Please wait.",
		},
		mcpPage: {
			metadataTitle: "MCP",
			metadataDescription:
				"Agent-facing SourceHarbor MCP quickstart, with real startup commands, representative tools, and builder-ready MCP/API positioning.",
			kicker: "SourceHarbor MCP Front Door",
			heroTitle: "MCP Quickstart",
			heroSubtitle:
				"Treat this as the agent-facing control plane. Web serves operators, API serves system integrations, and MCP serves assistants and workflows, while all three point at the same pipeline.",
			startTitle: "Start locally in one command",
			startDescription:
				"MCP is not a second copy of the business logic. It is the agent-facing doorway into the same API-backed system.",
			startNote: "This starts the FastMCP server wired in apps/mcp/server.py.",
			toolsTitle: "Representative tools",
			toolsDescription:
				"These are enough to explain the surface in under three minutes.",
			relationshipTitle: "How MCP relates to the rest of the product",
			relationshipDescription:
				"Web is the operator-facing command center. API is the shared contract. MCP is the agent-facing surface. SourceHarbor routes MCP through the API instead of letting tools talk straight to the database.",
			searchCta: "Open Search",
			askCta: "Open Ask",
		},
		knowledgePage: {
			metadataTitle: "Knowledge",
			metadataDescription:
				"SourceHarbor knowledge layer for extracted knowledge cards, job-linked evidence, and reusable long-lived assets.",
			kicker: "SourceHarbor Knowledge Layer",
			heroTitle: "Knowledge",
			heroSubtitle:
				"Treat this as the long-lived asset layer extracted from digests. It behaves more like a knowledge-card cabinet than a one-time reading flow.",
			filterTitle: "Filter knowledge cards",
			filterDescription:
				"Use job, video, card type, topic, and claim filters to narrow the cabinet before you inspect the cards.",
			filterButton: "Filter",
			clearButton: "Clear",
			totalCards: "Total cards",
			uniqueJobs: "Unique jobs",
			cardTypes: "Card types",
			sectionTitle: "Knowledge cards",
			sectionDescription:
				"This surface shows the latest extracted knowledge cards. Jump back into Job Trace when you need the full run context.",
			loadError: "Unable to load knowledge cards right now.",
			empty: "No knowledge cards yet.",
			jobTraceCta: "Job Trace",
			openJobTraceButton: "Open job trace",
			openJobTraceAriaPrefix: "Open job trace for",
		},
		ingestRunsPage: {
			metadataTitle: "Ingest Runs",
			metadataDescription:
				"SourceHarbor intake ledger for recent ingest runs, candidate counts, job creation, and batch-level run detail.",
			kicker: "SourceHarbor Intake",
			heroTitle: "Ingest Runs",
			heroSubtitle:
				"Treat this as the intake ledger. It tells you whether each pull actually launched, how many candidates it found, and how many jobs it created.",
			filterTitle: "Find an ingest run",
			filterDescription:
				"Enter a run ID to inspect one intake batch. Leave it empty to review the most recent batches.",
			runIdLabel: "Run ID",
			searchButton: "Search",
			loadErrorTitle: "Load failed",
			loadErrorDescription: "Unable to load ingest runs right now.",
			sectionTitle: "Recent ingest runs",
			sectionDescription:
				"The latest 10 intake batches, so you can quickly confirm whether source intake is still moving.",
			platform: "Platform",
			status: "Status",
			jobs: "Jobs",
			candidates: "Candidates",
			created: "Created",
			allPlatforms: "all",
			empty: "No ingest runs yet.",
			detailTitle: "Run detail",
			detailDescription:
				"Treat this section like the itemized receipt for one intake batch.",
			detailEmpty: "This run does not have item detail yet.",
		},
		searchPage: {
			metadataTitle: "Search",
			metadataDescription:
				"Grounded search and Ask entry for SourceHarbor, with cited retrieval over digests, transcripts, outlines, and knowledge cards.",
			searchKicker: "SourceHarbor Search Front Door",
			askKicker: "SourceHarbor Ask Front Door",
			searchTitle: "Search",
			askTitle: "Ask your sources",
			searchSubtitle:
				"This is the real operator-facing retrieval surface. It turns digests, transcripts, outlines, and knowledge cards into auditable jumps.",
			askSubtitle:
				"This is an honest Wave 1 Ask MVP. The current repo truth supports grounded, search-first retrieval, not a fully generated answer layer.",
			searchFormTitle: "Search your sources",
			askFormTitle: "Ask in grounded mode",
			searchFormDescription:
				"`keyword` is the steadiest mode right now. `semantic` and `hybrid` are wired, but still presented as experimental.",
			askFormDescription:
				"Narrow the question into cited retrieval first, then jump into job trace, knowledge cards, and the original source.",
			queryLabel: "Query",
			questionLabel: "Question",
			queryPlaceholder: "agent workflow, retry policy, knowledge cards...",
			questionPlaceholder:
				"What did recent runs say about retry policy, agent workflow, or knowledge cards?",
			searchHint:
				"Every result should jump back into job trace, knowledge, or the source URL.",
			askHint: "This MVP returns grounded evidence candidates first.",
			modeLabel: "Mode",
			groundingModeLabel: "Grounding mode",
			platformLabel: "Platform",
			topKLabel: "Top K",
			searchButton: "Search",
			askButton: "Ask",
			clearButton: "Clear",
			platformOptions: {
				all: "All platforms",
				youtube: "YouTube",
				bilibili: "Bilibili",
			},
			modeOptions: {
				keyword: "Keyword",
				semantic: "Semantic (experimental)",
				hybrid: "Hybrid (experimental)",
			},
			searchTruthTitle: "Current truth",
			askTruthTitle: "Grounded Ask mode",
			searchTruthPrimary:
				"Search is a production-facing front door over a real retrieval backend.",
			searchTruthSecondary:
				"Wave 1 keeps the boundary honest: cited retrieval first, stronger answer synthesis later.",
			askTruthPrimary:
				"What exists today: cited retrieval, job trace, knowledge cards, and original source links.",
			askTruthSecondary:
				"What does not exist yet: a verified answer payload with stable citation spans and answer-level hallucination guards.",
			askTruthNote: "It does not synthesize a free-form answer layer yet.",
			searchTruthCta: "Open Ask mode",
			askTruthCta: "Open Ask details",
			openRawSearchButton: "Open raw search",
			askContractArtifactLabel: "Ask contract artifact",
			searchContractTitle: "Result contract",
			askContractTitle: "Best current use",
			searchContractPrimary:
				"Each hit exposes a snippet, source type, score, and jump targets into a job trace, knowledge page, or original source URL.",
			searchContractSecondary:
				"If the corpus is empty, Search should show an honest empty state instead of inventing an answer.",
			askContractPrimary:
				"Use Ask to narrow a question into evidence-backed result candidates, then follow the citations into job trace, knowledge, or original source pages.",
			askContractSecondary:
				"This is truthful by design: no hidden answer layer, no unverifiable synthesis.",
			searchResultsTitle: "Results",
			askResultsTitle: "Grounded result set",
			searchResultsPrefix: "Showing cited retrieval results",
			askResultsPrefix: "Evidence candidates",
			searchRunPrompt: "Run a query to inspect grounded retrieval results.",
			askRunPrompt:
				"Run a grounded question to inspect grounded retrieval results.",
			requestFailed:
				"Current retrieval request failed. Retry first, then inspect API health if it still fails.",
			noResults:
				"No grounded results yet. That usually means the current corpus is empty or the query is too narrow.",
			groundedEvidenceTitle: "Grounded evidence",
			openJobTraceButton: "Open job trace",
			openKnowledgeCardsButton: "Open knowledge cards",
			openFeedEntryButton: "Open feed entry",
			openSourceButton: "Open source",
			knowledgeCardsSourceLabel: "Knowledge cards",
			experimentalMode: "experimental mode",
		},
		watchlistsPage: {
			metadataTitle: "Watchlists",
			metadataDescription:
				"Persisted SourceHarbor watchlists for topics, claim kinds, platforms, and source matchers, with notification readiness and trend follow-through.",
			kicker: "SourceHarbor Compounders",
			heroTitle: "Watchlists",
			heroSubtitle:
				"Treat this like a long-horizon tracking ledger. You are not searching once and leaving; you are pinning the topics, claims, or sources worth returning to.",
			saveTitle: "Save a watchlist",
			saveDescription:
				"Current matchers cover `topic_key`, `claim_kind`, `platform`, and `source_match`. Wave 1 focuses on persistent tracking first, then deeper external alerting later.",
			nameLabel: "Name",
			namePlaceholder:
				"Retry policy, AI workflow, YouTube AI channel, Claude Code updates...",
			watchTypeLabel: "Watch type",
			matcherValueLabel: "Matcher value",
			matcherValuePlaceholder:
				"retry-policy, claim_kind, youtube, /channel-name, codex, claude-code ...",
			deliveryLabel: "Delivery",
			enabledLabel: "Enabled",
			saveButton: "Save watchlist",
			updateButton: "Update watchlist",
			createNewButton: "Create new",
			openTrendViewButton: "Open trend view",
			alertTitle: "Alert readiness",
			alertDescription:
				"SourceHarbor can already persist watchlists and reuse them inside the dashboard. Whether external alerts are ready depends on the notification gate, not on whether the form submission succeeds.",
			alertFallback:
				"Notification readiness is unavailable right now. Keep using dashboard tracking first.",
			openNotificationSettingsButton: "Open notification settings",
			currentTitle: "Current watchlists",
			currentDescription:
				"These are real persisted tracking objects, not a UI shell. You can save them, read them back, and route them into the trend view today.",
			currentError:
				"Unable to load watchlists right now. Check API health, then retry this page.",
			currentEmpty:
				"There are no watchlists yet. Save one topic or source first so this page becomes a tracking console instead of an empty form.",
			updatedPrefix: "Updated",
			enabledState: "enabled",
			pausedState: "paused",
			editButton: "Edit",
			viewTrendButton: "View trend",
			deleteButton: "Delete",
			recentMovementTitle: "Recent movement",
			recentMovementDescription:
				"Start with the latest three movements to decide whether this watchlist is worth following. The fuller continuity view lives on the trend page.",
			openJobButton: "Open job",
			matchedCardsPrefix: "matched cards",
			addedTopicsPrefix: "Added topics",
			removedTopicsPrefix: "Removed topics",
			noneValue: "none",
			matcherOptions: {
				topicKey: "Topic key",
				claimKind: "Claim kind",
				platform: "Platform",
				sourceMatch: "Source match",
			},
			deliveryOptions: {
				dashboard: "Dashboard only",
				email: "Email when ready",
			},
		},
		trendsPage: {
			metadataTitle: "Trends",
			metadataDescription:
				"Cross-run trend and diff view for SourceHarbor watchlists, showing recent topic and claim changes across jobs and knowledge cards.",
			kicker: "SourceHarbor Trends",
			heroTitle: "Cross-run trend",
			heroSubtitle:
				"This is not fake analytics. It only shows the real topic and claim changes that the current watchlist matched across recent runs.",
			chooseTitle: "Choose a watchlist",
			chooseDescription:
				"Wave 1 keeps the MVP tightly focused: pick one watchlist and inspect what changed across the latest runs.",
			empty:
				"Save at least one watchlist first so this page can show a real cross-run view instead of an empty selector.",
			matcherLabel: "Matcher",
			recentRunsLabel: "Recent runs",
			matchedCardsLabel: "Matched cards",
			openJobButton: "Open job",
			openKnowledgeButton: "Open knowledge",
			addedTopicsPrefix: "Added topics",
			removedTopicsPrefix: "Removed topics",
			addedClaimKindsPrefix: "Added claim kinds",
			removedClaimKindsPrefix: "Removed claim kinds",
			noneValue: "none",
		},
		proofPage: {
			metadataTitle: "Proof",
			metadataDescription:
				"SourceHarbor proof boundary for product surface, local supervisor proof, long live-smoke lanes, and remote proof expectations.",
			kicker: "SourceHarbor Proof",
			heroTitle: "Proof boundary",
			heroSubtitle:
				"Treat this as the master switch for what SourceHarbor can say confidently now and what still needs extra evidence. Code, docs, local runtime, and remote proof are not the same ledger.",
			nextTruthfulJumpsTitle: "Next truthful jumps",
			nextTruthfulJumpsDescription:
				"These jumps are already real surfaces. They are not decorative packaging.",
			openCommandCenterButton: "Open command center",
			openOpsButton: "Open Ops inbox",
			openMcpButton: "Open MCP quickstart",
			openBuildersButton: "Open builder guide",
			openStatusButton: "Open project status",
			layers: {
				productSurfaceTitle: "Product surface",
				productSurfaceBody:
					"README, runtime-truth, project-status, Search, Ask, MCP, and Ops explain what SourceHarbor is and where each claim lives.",
				localSupervisorTitle: "Local supervisor proof",
				localSupervisorBody:
					"`bootstrap -> up -> status -> doctor` proves the repo-managed local stack, with routes taken from `resolved.env` instead of assumed defaults.",
				longSmokeTitle: "Long live-smoke lane",
				longSmokeBody:
					"`./bin/smoke-full-stack --offline-fallback 0` is stricter than the base local proof and can still stop on provider-side YouTube, Resend, or Gemini gates.",
				remoteProofTitle: "Remote proof",
				remoteProofBody:
					"Release badges, GitHub settings, and external distribution claims still need fresh remote verification. Local success does not replace that layer.",
			},
		},
		playgroundPage: {
			metadataTitle: "Playground",
			metadataDescription:
				"Read-only SourceHarbor playground built on clearly labeled sample corpus, example jobs, retrieval results, and bundle shape.",
			kicker: "SourceHarbor Playground",
			heroTitle: "Read-only sample playground",
			heroSubtitle:
				"This page uses a clearly labeled sample corpus, not live production results. Its job is to let you feel the product value before wiring the whole stack.",
			boundaryDescription:
				"Sample boundary: this playground is read-only and sample-labeled. Do not treat it as current operator state, current `main` proof, or remote proof.",
			openSearchButton: "Open real Search",
			openProofButton: "Open proof ladder",
			sampleSourcesTitle: "Sample sources",
			exampleJobsTitle: "Example jobs",
			retrievalResultsTitle: "Example retrieval results",
			exampleWatchlistsTitle: "Example watchlists and trend",
			recentRunsLabel: "Recent runs",
			exampleBundleTitle: "Example bundle shape",
			exampleBundleDescription:
				"Use this as a mental model for what a shareable internal evidence bundle looks like. It is a sample, not a live export.",
		},
		jobsPage: {
			metadataTitle: "Job Trace",
			metadataDescription:
				"Inspect SourceHarbor job trace, compare runs, review evidence bundles, and follow long-lived knowledge cards back to the underlying pipeline work.",
			kicker: "SourceHarbor Job Trace",
			heroTitle: "Job Trace",
			heroSubtitle:
				"Look up a job ID to inspect full pipeline state, compare drift, and trace evidence bundles without leaving the operator surface.",
			findTitle: "Find a job",
			findDescription:
				"Enter a job ID to inspect the step trail and artifact links. You can jump here from recent videos on the home page or the digest feed.",
			findDescriptionPrefix:
				"Enter a job ID to inspect the step trail and artifact links. You can jump here from",
			homeLinkLabel: "recent videos on the home page",
			findDescriptionConnector: "or",
			digestFeedLinkLabel: "the digest feed",
			findDescriptionSuffix: ".",
			jobIdLabel: "Job ID *",
			jobIdPlaceholder: "9be4cbe7-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			searchButton: "Search",
			compareTitle: "Compare to previous run",
			compareDescription:
				"Treat this as the answer to how much the latest run changed compared with the previous one. If there is no prior successful job, the page should say so plainly.",
			knowledgeTitle: "Knowledge cards",
			knowledgeDescription:
				"Treat these as long-lived cards extracted from this run. They are meant to be more reusable than the raw digest itself.",
			lookupFailedTitle: "Lookup failed",
			retryCurrentPageButton: "Retry current page",
			currentStatusPrefix: "Current job status",
			pipelineStatusPrefix: "pipeline status",
			acrossStepsSuffix: "steps",
			jobOverviewTitle: "Job overview",
			overviewFields: {
				jobId: "Job ID",
				videoId: "Video ID",
				status: "Status",
				finalPipelineStatus: "Final pipeline status",
				createdAt: "Created at",
				updatedAt: "Updated at",
			},
			viewInDigestFeed: "View in digest feed",
			downloadEvidenceBundle: "Download evidence bundle",
			evidenceBundleNote:
				"Evidence bundles are for internal reuse and async collaboration. They are not public release proof.",
			stepSummaryTitle: "Step summary",
			stepSummaryEmpty: "No step records yet.",
			stepSummaryCaption: "Job step summary table",
			stepSummaryHeaders: {
				step: "Step",
				status: "Status",
				retries: "Retries",
				startedAt: "Started at",
				finishedAt: "Finished at",
			},
			compareFields: {
				previousJob: "Previous job",
				addedLines: "Added lines",
				removedLines: "Removed lines",
			},
			compareDiffEmpty: "No line-level diff preview was produced.",
			compareEmpty:
				"No previous successful job is available for comparison yet.",
			knowledgeEmpty: "No knowledge cards generated yet.",
			degradationsTitle: "Degradations",
			degradationsEmpty: "No degradations recorded.",
			unknownValue: "unknown",
			naValue: "n/a",
			artifactIndexTitle: "Artifact index",
			artifactsEmpty: "No artifacts yet.",
			opensInNewTabSuffix: "(opens in a new tab)",
		},
		useCasesPage: {
			kicker: "SourceHarbor Use Case",
			whyTitle: "Why this page exists",
			whyDescription:
				"These use-case pages are discoverability surfaces, not hosted product promises. Every claim here should route back to a real SourceHarbor capability.",
			nextStepsTitle: "Next truthful steps",
			nextStepsDescription:
				"Use these links to move from copy into real product surfaces, proof, or sample playgrounds.",
			proofCta: "Open proof ladder",
			builderTitle: "Builder fit",
			builderDescription:
				"Treat these pages as truthful fit guides for Codex, Claude Code, MCP clients, and source-first builder workflows.",
		},
		builderSurfaces: {
			title: "Build with Codex, Claude Code, and MCP clients",
			subtitle:
				"Use SourceHarbor as an agent-facing control tower through MCP, the HTTP API, and the shared TypeScript client layer.",
			mcpCta: "Open MCP quickstart",
			codexCta: "Open Codex workflow",
			claudeCodeCta: "Open Claude Code workflow",
			builderCta: "Open builder guide",
			compareCta: "See ecosystem fit",
		},
	},
	"zh-CN": {
		common: {
			close: "关闭",
		},
		formValidation: {
			required: "请先填写并修正必填项后再提交。",
			requireOne: "请至少填写一项必填来源后再提交。",
			requireOneExclusive: "当前只能填写一项来源，请清空多余输入后再提交。",
		},
		loading: {
			app: { title: "页面加载中", message: "正在加载首页内容，请稍候。" },
			settings: {
				title: "设置加载中",
				message: "正在加载设置项，请稍候。",
			},
		},
		submitButton: {
			defaultPendingLabel: "提交中…",
			pendingBadge: "处理中",
			pendingSrOnly: "正在提交，请稍候。",
		},
		syncNow: {
			idle: {
				buttonLabel: "立即同步",
				badgeLabel: "待命",
				statusLabel: "待命：点击后立即同步最新内容。",
			},
			loading: {
				buttonLabel: "同步中…",
				badgeLabel: "同步中",
				statusLabel: "正在拉取与分析新内容，请稍候。",
				liveStatusLabel: "正在同步，请稍候。",
				retryTitle: "同步失败，按 Enter 或空格可再次尝试。",
			},
			done: {
				buttonLabel: "同步完成",
				badgeLabel: "已完成",
				statusLabel: "同步完成，列表即将刷新。",
				liveStatusLabel: "同步完成，列表正在刷新。",
			},
			error: {
				buttonLabel: "同步失败，重试",
				badgeLabel: "需重试",
				statusLabel: "同步失败，请检查网络后重试。",
				liveStatusLabel: "同步失败，请检查网络后重试。",
				retryTitle: "同步失败，按 Enter 或空格可再次尝试。",
			},
		},
		relativeTime: {
			soon: "马上",
			tomorrow: "明天",
			justNow: "刚刚",
			minuteFuture: "{count} 分钟后 | {count} 分钟后",
			hourFuture: "{count} 小时后 | {count} 小时后",
			dayFuture: "{count} 天后 | {count} 天后",
			weekFuture: "{count} 周后 | {count} 周后",
			monthFuture: "{count} 个月后 | {count} 个月后",
			yearFuture: "{count} 年后 | {count} 年后",
			minutePast: "{count} 分钟前 | {count} 分钟前",
			hourPast: "{count} 小时前 | {count} 小时前",
			dayPast: "{count} 天前 | {count} 天前",
			weekPast: "{count} 周前 | {count} 周前",
			monthPast: "{count} 个月前 | {count} 个月前",
			yearPast: "{count} 年前 | {count} 年前",
			absoluteLocale: "zh-CN",
		},
		dashboard: {
			metadataTitle: "首页",
			metadataDescription:
				"SourceHarbor command center，用一个 operator-facing control tower 管 AI knowledge intake、grounded retrieval、ops triage 与 builder entry。",
			kicker: "SourceHarbor Command Center",
			heroTitle: "AI 知识控制塔",
			heroSubtitle:
				"从一个面向运营者的 command center 里运行采集、grounded retrieval、任务编排和 agent reuse。",
			frontDoors: {
				searchTitle: "搜索入口",
				searchDescription:
					"从一个面向运营者的入口里检索 digest、知识卡片、转写和相关证据。",
				searchCta: "打开 Search",
				knowledgeCta: "打开 Knowledge",
				askTitle: "向来源提问",
				askDescription:
					"诚实的 MVP：先拿 grounded evidence，再跳回 job trace、feed、knowledge 或原始来源。",
				askCta: "打开 Ask",
				askHint: "当前还没有隐藏的 answer layer。先以 citation 为主。",
				mcpTitle: "MCP 入口",
				mcpDescription:
					"SourceHarbor 已经在同一套 API 和 pipeline state 之上暴露了 agent-facing MCP surface。",
				mcpCta: "打开 MCP quickstart",
				jobCta: "查看 job 证据",
			},
			compounders: {
				watchlistsTitle: "Watchlists 与趋势",
				watchlistsDescription:
					"保存 topic、claim kind 或 source watchlist，然后回到真实的跨运行趋势，而不是每次手工重做同一轮搜索。",
				watchlistsCta: "打开 Watchlists",
				trendsCta: "打开 Trends",
				bundleTitle: "证据包",
				bundleDescription:
					"把一次运行继续带走，作为内部 bundle 复用 digest、trace summary、knowledge cards 和 artifact manifest，而不是在聊天里贴截图。",
				bundleCta: "打开 Job Trace",
				bundleHint: "可从任意 job 详情页下载 bundle。",
				playgroundTitle: "样例 Playground",
				playgroundDescription:
					"查看清楚标注的 demo corpus 和 use-case 页面，但不要把它误读成 live operator 结果。",
				playgroundCta: "打开 Playground",
				useCasesCta: "打开 use case 页面",
			},
			loadErrorTitle: "当前无法加载 command center",
			retryCurrentPage: "重试当前页面",
			metricsRegionLabel: "关键指标",
			metrics: {
				subscriptions: {
					title: "订阅数",
					unavailable: "订阅数数据暂不可用",
					emptyCta: "添加第一个订阅 →",
				},
				discoveredVideos: {
					title: "已发现视频",
					unavailable: "已发现视频数据暂不可用",
				},
				runningJobs: {
					title: "运行中 / 排队",
					unavailable: "运行中和排队任务数据暂不可用",
				},
				failedJobs: {
					title: "失败任务",
					unavailable: "失败任务数据暂不可用",
					openFailed: "查看失败任务 →",
					openOps: "打开 Ops inbox →",
				},
				unavailableOutput: "数据暂不可用",
			},
			pollIngest: {
				title: "拉取订阅",
				description:
					"创建新的 ingest run，再跳到 jobs 和 traces，而不是靠猜测判断 intake 是否真的启动。",
				platformLabel: "平台（可选）",
				maxNewVideosLabel: "最多拉取视频数",
				submit: "触发采集",
				submitPending: "触发中…",
				submitStatus: "正在创建新的 ingest run，请稍候。",
				queueLink: "查看任务队列 →",
			},
			processVideo: {
				title: "处理单个来源",
				description:
					"把一个 source URL 放进 pipeline，再去看 trace、artifacts 和 retrieval surface。",
				platformLabel: "平台 *",
				urlLabel: "来源链接 *",
				modeLabel: "模式 *",
				forceLabel: "强制重跑",
				submit: "开始处理",
				submitPending: "创建任务中…",
				submitStatus: "正在创建新的处理任务，请稍候。",
				jobDetailLink: "查看任务详情 →",
			},
			ingestRuns: {
				title: "最近摄取运行",
				description:
					"把它理解成收货台账。如果你刚触发了 intake，这里应该先告诉你 run 有没有真的动起来。",
				viewAll: "查看全部摄取运行 →",
				unavailable: "摄取运行数据暂不可用。",
				empty: "暂无摄取运行。",
				caption: "最近摄取运行列表",
				platform: "平台",
				status: "状态",
				newJobs: "新任务",
				candidates: "候选条目",
				allPlatforms: "全部",
			},
			recentVideos: {
				title: "最近视频",
				description:
					"这里只展示最近 10 条视频。想看完整运行历史，请直接跳到 job trace。",
				viewAll: "查看全部任务 →",
				empty: "暂无视频。",
				unavailable: "当前无法加载视频列表。",
				caption: "最近视频列表",
				titleColumn: "标题",
				platformColumn: "平台",
				statusColumn: "状态",
				lastJobColumn: "最近任务",
			},
			pollPlatformOptions: {
				all: "全部",
			},
			processModeOptions: {
				full: "完整运行",
				textOnly: "纯文本",
				refreshComments: "刷新评论",
				refreshLlm: "刷新 LLM 输出",
			},
		},
		ops: {
			metadataTitle: "Ops Inbox",
			metadataDescription:
				"SourceHarbor 的 operator inbox，用来查看 failures、provider health、delivery readiness 与下一步动作。",
			kicker: "SourceHarbor Ops",
			heroTitle: "运营诊断",
			heroSubtitle:
				"打开给值班者看的异常队列：失败任务、provider health、delivery readiness，以及接下来该做什么。",
			loadErrorTitle: "当前无法汇总 Ops 诊断",
			loadErrorDescription:
				"请先确认 API health 和本地 full-stack 状态，再重试当前页面。",
			partialDataTitle: "部分诊断数据暂不可用",
			partialDataDescription:
				"这页会保留已经加载成功的条目。先看 API health 和 doctor，再决定是否重跑完整 Ops 拉取。",
			backToDashboard: "返回 command center",
			summary: {
				attentionItems: {
					title: "待处理异常",
					description: "当前需要人工值班处理的总条数。",
				},
				failedJobs: {
					title: "失败任务",
					description:
						"这些任务应该优先把你送回 job trace，而不是先去别的地方猜。",
				},
				failedIngest: {
					title: "失败摄取",
					description: "没有发车或半路失败的 ingest 批次。",
				},
				notificationGate: {
					title: "通知 / Gate",
					description:
						"通知 readiness、provider health 和 hardening gate 的合计。",
				},
			},
			inbox: {
				title: "Ops inbox",
				description:
					"把它理解成值班收件箱。每条异常都给一个主跳转，不逼你先猜该去哪个台账。",
				empty:
					"当前没有需要值班处理的异常。最近任务、摄取运行和通知链路都在可接受范围内。",
			},
			nextSteps: {
				title: "推荐下一步",
				description:
					"把它理解成值班副驾驶。这里把 gate 和 inbox 异常翻译成接下来几步动作，而不是逼你先自己读完所有表格。",
				noActions:
					"当前没有紧急下一步动作。若还需要继续巡检，可直接查看 provider health 或 notification readiness。",
				triagePrefix: "处理 inbox 项",
				gatePrefix: "检查 hardening gate",
				openAction: "打开动作",
			},
			providerHealth: {
				title: "Provider health",
				description:
					"这是快速判断系统整体有没有歪掉的视图。黄色表示需要人工复核，红色表示最近有明确失败。",
				empty: "当前没有 provider health 异常记录。",
				defaultMessage: "当前 provider health 需要人工复核。",
			},
			notificationReadiness: {
				title: "Notification readiness",
				description:
					"把“配置没填好”和“发送失败”拆开看，避免把两类问题混成一句“通知坏了”。",
				empty: "当前没有待处理的 notification deliveries。",
			},
		},
		settings: {
			metadataTitle: "设置",
			metadataDescription:
				"管理 SourceHarbor 的通知投递、日报时机、failure alerts 与 test-send controls。",
			kicker: "SourceHarbor Settings",
			heroTitle: "通知设置",
			heroSubtitle:
				"从一个 operator surface 里管理摘要投递、失败告警和测试发送行为。",
			loadErrorTitle: "当前无法加载设置",
			retryCurrentPage: "重试当前页面",
			configSectionTitle: "通知配置",
			configDates: "创建时间：{createdAt} | 更新时间：{updatedAt}",
			enabledLabel: "启用通知",
			toEmailLabel: "收件人邮箱",
			dailyDigestLabel: "启用每日摘要",
			dailyDigestHourLabel: "每日摘要发送时间（UTC 小时）",
			dailyDigestHint:
				"本地时间预览：这个字段使用 UTC 小时。保存前请先把本地目标时间换算成 UTC。",
			failureAlertLabel: "启用失败告警",
			saveButton: "保存配置",
			savePending: "保存中…",
			saveStatus: "正在保存通知配置，请稍候。",
			testSectionTitle: "发送测试通知",
			testRecipientDescription: "当前默认收件人：{email}",
			testRecipientMissing:
				"当前默认收件人尚未设置。请先在上方填写，再发送测试通知。",
			overrideRecipientLabel: "覆盖收件人（可选）",
			overrideRecipientPlaceholder: "留空则使用已配置的收件人",
			subjectLabel: "主题（可选）",
			subjectPlaceholder: "SourceHarbor 测试通知",
			bodyLabel: "正文（可选）",
			bodyPlaceholder: "这是一封来自 SourceHarbor 的测试通知。",
			sendButton: "发送测试邮件",
			sendPending: "发送中…",
			sendStatus: "正在发送测试通知，请稍候。",
		},
		mcpPage: {
			metadataTitle: "MCP",
			metadataDescription:
				"SourceHarbor 的 MCP quickstart，说明真实启动命令、代表性工具，以及它与 API / Web 的关系。",
			kicker: "SourceHarbor MCP Front Door",
			heroTitle: "MCP Quickstart",
			heroSubtitle:
				"把它理解成 agent-facing control plane。Web 服务运营者，API 服务系统集成，MCP 服务助手和工作流，而三者都指向同一套 pipeline。",
			startTitle: "一条命令本地启动",
			startDescription:
				"MCP 不是第二套业务逻辑，而是同一套 API-backed system 的 agent-facing doorway。",
			startNote: "这会启动接到 apps/mcp/server.py 的 FastMCP server。",
			toolsTitle: "代表性工具",
			toolsDescription: "这些已经足够在三分钟内解释清楚当前 surface。",
			relationshipTitle: "MCP 与其他产品面的关系",
			relationshipDescription:
				"Web 是 operator-facing command center。API 是共享契约。MCP 是 agent-facing surface。SourceHarbor 会先经过 API，而不是让工具直接打数据库。",
			searchCta: "打开 Search",
			askCta: "打开 Ask",
		},
		knowledgePage: {
			metadataTitle: "Knowledge",
			metadataDescription:
				"SourceHarbor 的 knowledge layer，承载提取后的 knowledge cards、job-linked evidence 与可复用资产。",
			kicker: "SourceHarbor Knowledge Layer",
			heroTitle: "Knowledge",
			heroSubtitle:
				"把它理解成从 digest 里提炼出来的长期资产层。这里更像知识卡片柜，而不是一次性的阅读流。",
			filterTitle: "筛选知识卡片",
			filterDescription:
				"用 job、video、card type、topic 和 claim 过滤器先缩小范围，再查看具体卡片。",
			filterButton: "筛选",
			clearButton: "清空",
			totalCards: "总卡片数",
			uniqueJobs: "唯一任务数",
			cardTypes: "卡片类型",
			sectionTitle: "知识卡片",
			sectionDescription:
				"这里展示最近抽取出的知识卡片。需要完整上下文时，请跳回 Job Trace。",
			loadError: "当前无法加载知识卡片。",
			empty: "暂无知识卡片。",
			jobTraceCta: "Job Trace",
			openJobTraceButton: "Open job trace",
			openJobTraceAriaPrefix: "Open job trace for",
		},
		ingestRunsPage: {
			metadataTitle: "Ingest Runs",
			metadataDescription:
				"SourceHarbor 的 intake ledger，用来查看最近 ingest runs、candidate 数量、job 创建与 batch 详情。",
			kicker: "SourceHarbor Intake",
			heroTitle: "Ingest Runs",
			heroSubtitle:
				"把它理解成摄取台账。这里会告诉你每次拉取是否真的发车、发现了多少候选、又创建了多少任务。",
			filterTitle: "查找一次 ingest run",
			filterDescription:
				"输入 run ID 可以查看某次摄取批次；留空时显示最近的批次列表。",
			runIdLabel: "Run ID",
			searchButton: "Search",
			loadErrorTitle: "加载失败",
			loadErrorDescription: "当前无法加载 ingest runs。",
			sectionTitle: "最近摄取运行",
			sectionDescription:
				"最近 10 次 intake 批次，方便快速判断当前 source intake 是否还在动。",
			platform: "平台",
			status: "状态",
			jobs: "任务数",
			candidates: "候选条目",
			created: "创建时间",
			allPlatforms: "全部",
			empty: "暂无 ingest runs。",
			detailTitle: "Run 详情",
			detailDescription: "这一块更像本次 ingest batch 的详细账单。",
			detailEmpty: "当前 run 还没有 item 详情。",
		},
		searchPage: {
			metadataTitle: "Search",
			metadataDescription:
				"SourceHarbor 的 grounded search 与 Ask 入口，基于 digests、transcripts、outlines 与 knowledge cards 做 citation-first retrieval。",
			searchKicker: "SourceHarbor Search Front Door",
			askKicker: "SourceHarbor Ask Front Door",
			searchTitle: "Search",
			askTitle: "Ask your sources",
			searchSubtitle:
				"这是面向运营者的真实检索前台。它把 digest、transcript、outline 和 knowledge cards 变成可回跳、可审计的结果。",
			askSubtitle:
				"这是一个诚实的 Wave 1 Ask MVP。当前 repo truth 支撑的是 grounded、search-first retrieval，而不是 fully generated answer layer。",
			searchFormTitle: "Search your sources",
			askFormTitle: "Ask in grounded mode",
			searchFormDescription:
				"`keyword` 目前最稳。`semantic` 和 `hybrid` 已接线，但仍按 experimental 呈现。",
			askFormDescription:
				"先把问题收敛成 cited retrieval，再跳回 job trace、knowledge cards 和原始来源。",
			queryLabel: "Query",
			questionLabel: "Question",
			queryPlaceholder: "agent workflow、retry policy、knowledge cards...",
			questionPlaceholder:
				"最近几轮到底怎么提 retry policy、agent workflow 或 knowledge cards？",
			searchHint: "每条结果都应该能回跳到 job trace、knowledge 或 source URL。",
			askHint: "这个 MVP 先返回 grounded evidence candidates。",
			modeLabel: "Mode",
			groundingModeLabel: "Grounding mode",
			platformLabel: "Platform",
			topKLabel: "Top K",
			searchButton: "Search",
			askButton: "Ask",
			clearButton: "Clear",
			platformOptions: {
				all: "All platforms",
				youtube: "YouTube",
				bilibili: "Bilibili",
			},
			modeOptions: {
				keyword: "Keyword",
				semantic: "Semantic (experimental)",
				hybrid: "Hybrid (experimental)",
			},
			searchTruthTitle: "Current truth",
			askTruthTitle: "Grounded Ask mode",
			searchTruthPrimary:
				"Search 是一个建立在真实 retrieval backend 之上的 production-facing front door。",
			searchTruthSecondary:
				"Wave 1 先把边界讲诚实：cited retrieval 在前，更强的 answer synthesis 在后。",
			askTruthPrimary:
				"今天已经存在的是：cited retrieval、job trace、knowledge cards 和原始来源链接。",
			askTruthSecondary:
				"还没有的是：带稳定 citation spans 和 answer-level hallucination guards 的 answer payload。",
			askTruthNote: "当前不会合成一个 free-form answer layer。",
			searchTruthCta: "打开 Ask mode",
			askTruthCta: "打开 Ask details",
			openRawSearchButton: "Open raw search",
			askContractArtifactLabel: "Ask contract artifact",
			searchContractTitle: "Result contract",
			askContractTitle: "Best current use",
			searchContractPrimary:
				"每条命中都带 snippet、source type、score，以及跳转到 job trace、knowledge page 或原始来源 URL 的入口。",
			searchContractSecondary:
				"如果语料为空，Search 应该给出诚实的 empty state，而不是编一个答案。",
			askContractPrimary:
				"把 Ask 用成 evidence-backed result candidates 的收敛器，然后顺着 citations 回到 job trace、knowledge 或原始来源页面。",
			askContractSecondary:
				"它之所以诚实，是因为没有隐藏的 answer layer，也没有 unverifiable synthesis。",
			searchResultsTitle: "Results",
			askResultsTitle: "Grounded result set",
			searchResultsPrefix: "Showing cited retrieval results",
			askResultsPrefix: "Evidence candidates",
			searchRunPrompt: "先跑一个 query，再检查 grounded retrieval results。",
			askRunPrompt:
				"先跑一个 grounded question，再检查 grounded retrieval results。",
			requestFailed: "当前 retrieval 请求失败。先重试，再看 API health。",
			noResults:
				"当前还没有 grounded results。通常表示语料为空，或查询条件太窄。",
			groundedEvidenceTitle: "Grounded evidence",
			openJobTraceButton: "Open job trace",
			openKnowledgeCardsButton: "Open knowledge cards",
			openFeedEntryButton: "Open feed entry",
			openSourceButton: "Open source",
			knowledgeCardsSourceLabel: "Knowledge cards",
			experimentalMode: "experimental mode",
		},
		watchlistsPage: {
			metadataTitle: "Watchlists",
			metadataDescription:
				"保存 SourceHarbor watchlists，用于持续追踪 topic、claim kind、platform 与 source matcher，并把它们接到趋势与通知 readiness。",
			kicker: "SourceHarbor Compounders",
			heroTitle: "Watchlists",
			heroSubtitle:
				"把它理解成长期追踪清单。你不是只搜一次就走，而是把值得反复回看的主题、claims 或来源钉住。",
			saveTitle: "保存 watchlist",
			saveDescription:
				"当前支持 `topic_key`、`claim_kind`、`platform` 和 `source_match`。Wave 1 先做 persistent tracking，再把更深的 external alerts 接进来。",
			nameLabel: "名称",
			namePlaceholder: "重试策略、AI workflow、YouTube AI 频道、Claude Code 更新...",
			watchTypeLabel: "追踪类型",
			matcherValueLabel: "匹配值",
			matcherValuePlaceholder:
				"retry-policy、claim_kind、youtube、/channel-name、codex、claude-code ...",
			deliveryLabel: "投递方式",
			enabledLabel: "启用",
			saveButton: "保存 watchlist",
			updateButton: "更新 watchlist",
			createNewButton: "新建一个",
			openTrendViewButton: "打开趋势视图",
			alertTitle: "提醒 readiness",
			alertDescription:
				"SourceHarbor 现在已经能保存 watchlist 并在 dashboard 内复用。外发提醒是否 ready，要看 notification gate，而不是看表单有没有提交成功。",
			alertFallback:
				"当前拿不到 notification gate，先以 dashboard tracking 为主。",
			openNotificationSettingsButton: "打开通知设置",
			currentTitle: "当前 watchlists",
			currentDescription:
				"这些是已经持久化的 tracking objects。它们不是 UI 壳子，而是当前可保存、可读取、可挂趋势页的真实对象。",
			currentError: "当前无法读取 watchlists。先确认 API health，再重试这页。",
			currentEmpty:
				"还没有 watchlists。先保存一个主题或来源，这页才会开始像持续追踪面板，而不是空白表单。",
			updatedPrefix: "更新时间",
			enabledState: "启用中",
			pausedState: "已暂停",
			editButton: "编辑",
			viewTrendButton: "查看趋势",
			deleteButton: "删除",
			recentMovementTitle: "最近变化",
			recentMovementDescription:
				"先看最近 3 次变化，确认这个 watchlist 值不值得继续追。更完整的连续变化视图在 trend page。",
			openJobButton: "打开 Job",
			matchedCardsPrefix: "匹配卡片",
			addedTopicsPrefix: "新增主题",
			removedTopicsPrefix: "移除主题",
			noneValue: "无",
			matcherOptions: {
				topicKey: "Topic key",
				claimKind: "Claim kind",
				platform: "Platform",
				sourceMatch: "Source match",
			},
			deliveryOptions: {
				dashboard: "仅 Dashboard",
				email: "准备好后发邮件",
			},
		},
		trendsPage: {
			metadataTitle: "Trends",
			metadataDescription:
				"查看 SourceHarbor watchlists 的跨运行趋势与 diff，追踪最近 jobs / knowledge cards 里的 topic 与 claim 变化。",
			kicker: "SourceHarbor Trends",
			heroTitle: "Cross-run trend",
			heroSubtitle:
				"这不是 fake analytics。它只展示当前 watchlist 在最近几次 run 里真实匹配到的 topics 和 claims 变化。",
			chooseTitle: "选择 watchlist",
			chooseDescription:
				"Wave 1 先做一个非常 focused 的 MVP：围绕一个 watchlist，看最近几次 run 发生了什么变化。",
			empty: "先保存至少一个 watchlist，这里才会出现真正可比的连续变化视图。",
			matcherLabel: "匹配器",
			recentRunsLabel: "最近运行数",
			matchedCardsLabel: "匹配卡片数",
			openJobButton: "打开 Job",
			openKnowledgeButton: "打开 Knowledge",
			addedTopicsPrefix: "新增主题",
			removedTopicsPrefix: "移除主题",
			addedClaimKindsPrefix: "新增 claim kinds",
			removedClaimKindsPrefix: "移除 claim kinds",
			noneValue: "无",
		},
		proofPage: {
			metadataTitle: "Proof",
			metadataDescription:
				"SourceHarbor 的 proof boundary，说明 product surface、local supervisor proof、long live-smoke lane 与 remote proof 的边界。",
			kicker: "SourceHarbor Proof",
			heroTitle: "Proof boundary",
			heroSubtitle:
				"把它理解成“哪些话现在能大胆说，哪些还要看额外证据”的总开关。代码、docs、local runtime 和 remote proof 不是同一层账本。",
			nextTruthfulJumpsTitle: "下一跳 truthful 入口",
			nextTruthfulJumpsDescription:
				"这些入口都是已经存在的真实 surface，不是额外包装。",
			openCommandCenterButton: "打开 command center",
			openOpsButton: "打开 Ops inbox",
			openMcpButton: "打开 MCP quickstart",
			openBuildersButton: "打开 builder guide",
			openStatusButton: "打开 project status",
			layers: {
				productSurfaceTitle: "Product surface",
				productSurfaceBody:
					"README、runtime-truth、project-status、Search、Ask、MCP 和 Ops 共同说明 SourceHarbor 是什么，以及每条 claim 具体落在哪层。",
				localSupervisorTitle: "Local supervisor proof",
				localSupervisorBody:
					"`bootstrap -> up -> status -> doctor` 可以证明 repo-managed local stack 真的起来了，而且路由取自 `resolved.env`，不是假设默认值。",
				longSmokeTitle: "Long live-smoke lane",
				longSmokeBody:
					"`./bin/smoke-full-stack --offline-fallback 0` 比基础 local proof 更严格，但仍可能卡在 provider-side 的 YouTube、Resend 或 Gemini gate。",
				remoteProofTitle: "Remote proof",
				remoteProofBody:
					"Release badges、GitHub settings 与 external distribution claims 仍需要 fresh remote verification。local success 不能替代那一层。",
			},
		},
		playgroundPage: {
			metadataTitle: "Playground",
			metadataDescription:
				"SourceHarbor 的只读 sample playground，用清楚标注的 demo corpus、example jobs、retrieval 结果与 bundle shape 帮你快速理解产品。",
			kicker: "SourceHarbor Playground",
			heroTitle: "Read-only sample playground",
			heroSubtitle:
				"这里展示的是 clearly labeled sample corpus，不是 live production results。它的作用是在不接完整环境前先让你感知产品价值。",
			boundaryDescription:
				"Sample boundary：这个 playground 是 read-only 且 sample-labeled，不要把它当成 current operator state、current `main` proof 或 remote proof。",
			openSearchButton: "打开真实 Search",
			openProofButton: "打开 proof ladder",
			sampleSourcesTitle: "Sample sources",
			exampleJobsTitle: "Example jobs",
			retrievalResultsTitle: "Example retrieval results",
			exampleWatchlistsTitle: "Example watchlists and trend",
			recentRunsLabel: "Recent runs",
			exampleBundleTitle: "Example bundle shape",
			exampleBundleDescription:
				"把它当成一个可分享内部 evidence bundle 的心智模型。它是 sample，不是 live export。",
		},
		jobsPage: {
			metadataTitle: "Job Trace",
			metadataDescription:
				"查看 SourceHarbor 的 Job Trace、运行对比、evidence bundle 与 long-lived knowledge cards，并回到底层 pipeline 证据。",
			kicker: "SourceHarbor Job Trace",
			heroTitle: "Job Trace",
			heroSubtitle:
				"输入 job ID 后，你可以在同一个 operator surface 内看完整 pipeline state、compare drift 与 evidence bundle。",
			findTitle: "Find a job",
			findDescription:
				"输入 job ID 查看 step trail 与 artifact links。你可以从首页 recent videos 或 digest feed 直接跳回来。",
			findDescriptionPrefix:
				"输入 job ID 查看 step trail 与 artifact links。你也可以直接从",
			homeLinkLabel: "首页 recent videos",
			findDescriptionConnector: "或",
			digestFeedLinkLabel: "digest feed",
			findDescriptionSuffix: "跳回来。",
			jobIdLabel: "Job ID *",
			jobIdPlaceholder: "9be4cbe7-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			searchButton: "Search",
			compareTitle: "与上一轮对比",
			compareDescription:
				"把它理解成“这次和上次相比，结果改了多少”。如果没有上一条成功任务，这里会明确告诉你没有可比较对象。",
			knowledgeTitle: "Knowledge cards",
			knowledgeDescription:
				"把它理解成“从这次结果里提炼出的长期可复用卡片”。它们比原始 digest 更像可积累的知识对象。",
			lookupFailedTitle: "Lookup failed",
			retryCurrentPageButton: "Retry current page",
			currentStatusPrefix: "Current job status",
			pipelineStatusPrefix: "pipeline status",
			acrossStepsSuffix: "steps",
			jobOverviewTitle: "Job overview",
			overviewFields: {
				jobId: "Job ID",
				videoId: "Video ID",
				status: "Status",
				finalPipelineStatus: "Final pipeline status",
				createdAt: "Created at",
				updatedAt: "Updated at",
			},
			viewInDigestFeed: "View in digest feed",
			downloadEvidenceBundle: "Download evidence bundle",
			evidenceBundleNote:
				"Evidence bundles 用于内部复用与异步协作，不应被当成 public release proof。",
			stepSummaryTitle: "Step summary",
			stepSummaryEmpty: "No step records yet.",
			stepSummaryCaption: "Job step summary table",
			stepSummaryHeaders: {
				step: "Step",
				status: "Status",
				retries: "Retries",
				startedAt: "Started at",
				finishedAt: "Finished at",
			},
			compareFields: {
				previousJob: "Previous job",
				addedLines: "Added lines",
				removedLines: "Removed lines",
			},
			compareDiffEmpty: "No line-level diff preview was produced.",
			compareEmpty:
				"No previous successful job is available for comparison yet.",
			knowledgeEmpty: "No knowledge cards generated yet.",
			degradationsTitle: "Degradations",
			degradationsEmpty: "No degradations recorded.",
			unknownValue: "unknown",
			naValue: "n/a",
			artifactIndexTitle: "Artifact index",
			artifactsEmpty: "No artifacts yet.",
			opensInNewTabSuffix: "(opens in a new tab)",
		},
		useCasesPage: {
			kicker: "SourceHarbor Use Case",
			whyTitle: "Why this page exists",
			whyDescription:
				"这些 use-case 页面是 discoverability surface，不是 hosted 产品承诺。这里的每条 claim 都应该能回到 SourceHarbor 的真实能力。",
			nextStepsTitle: "Next truthful steps",
			nextStepsDescription:
				"通过这些链接，从 copy 直接跳到真实 product surface、proof 或 sample playground。",
			proofCta: "Open proof ladder",
			builderTitle: "Builder fit",
			builderDescription:
				"把这些页面理解成面对 Codex、Claude Code、MCP clients 与 source-first builder workflows 的 truthful fit guide。",
		},
		builderSurfaces: {
			title: "通过 Codex、Claude Code 和 MCP 客户端接入",
			subtitle:
				"把 SourceHarbor 当作 agent-facing control tower 使用：走 MCP、HTTP API 和共享 TypeScript client layer，而不是复制一套新的业务逻辑。",
			mcpCta: "打开 MCP quickstart",
			codexCta: "打开 Codex workflow",
			claudeCodeCta: "打开 Claude Code workflow",
			builderCta: "打开 builder guide",
			compareCta: "查看生态匹配",
		},
	},
} as const;

export type AppMessages = (typeof MESSAGES)["en"];

function mergeMessages<T extends Record<string, unknown>>(
	base: T,
	override: Record<string, unknown> | undefined,
): T {
	if (!override) {
		return base;
	}
	const output = { ...base } as Record<string, unknown>;
	for (const [key, value] of Object.entries(override)) {
		const baseValue = output[key];
		if (
			value &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			baseValue &&
			typeof baseValue === "object" &&
			!Array.isArray(baseValue)
		) {
			output[key] = mergeMessages(
				baseValue as Record<string, unknown>,
				value as Record<string, unknown>,
			);
			continue;
		}
		output[key] = value;
	}
	return output as T;
}

export function getLocaleMessages(
	locale: SupportedLocale = DEFAULT_LOCALE,
): AppMessages {
	if (locale === "en") {
		return MESSAGES.en;
	}
	return mergeMessages(
		MESSAGES.en,
		MESSAGES[locale] as Record<string, unknown>,
	);
}

export function formatCountPattern(pattern: string, count: number): string {
	const [singular, plural] = pattern.split("|").map((part) => part.trim());
	const template = count === 1 ? singular : (plural ?? singular);
	return template.replace("{count}", String(count));
}

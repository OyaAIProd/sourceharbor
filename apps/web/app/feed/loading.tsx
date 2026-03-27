import { LoadingStateCard } from "@/components/loading-state-card";

export default function FeedLoading() {
	return (
		<LoadingStateCard
			title="Digest feed loading"
			message="Loading the digest feed. Please wait."
			messageId="feed-loading-message"
		/>
	);
}

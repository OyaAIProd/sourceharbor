import { LoadingStateCard } from "@/components/loading-state-card";

export default function SubscriptionsLoading() {
	return (
		<LoadingStateCard
			title="Loading subscriptions"
			message="Loading subscription data. Please wait."
			messageId="subscriptions-loading-message"
		/>
	);
}

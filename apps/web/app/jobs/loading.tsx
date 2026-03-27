import { LoadingStateCard } from "@/components/loading-state-card";

export default function JobsLoading() {
	return (
		<LoadingStateCard
			title="Job trace loading"
			message="Loading job details. Please wait."
			messageId="jobs-loading-message"
		/>
	);
}

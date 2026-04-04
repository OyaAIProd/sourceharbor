import { createSourceHarborClient } from "@sourceharbor/sdk";

const client = createSourceHarborClient({
	baseUrl:
		process.env.SOURCEHARBOR_API_BASE_URL ??
		`http://127.0.0.1:${process.env.SOURCE_HARBOR_API_PORT ?? "9000"}`,
});

const result = await client.searchRetrieval({
	query: "agent workflows",
	mode: "keyword",
	top_k: 5,
});

console.log(JSON.stringify(result, null, 2));

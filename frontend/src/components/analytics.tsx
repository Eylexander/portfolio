"use client";

export function Analytics() {
	const token = process.env.NEXT_PUBLIC_BEAM_TOKEN;
	const apiUri = process.env.NEXT_PUBLIC_BEAM_API_URI;
	if (!token || !apiUri) {
		return null;
	}
	return (
		<script
			data-token={token}
			data-api={apiUri + "/log"}
			src={apiUri + "/script.js"}
			async
		/>
	);
}

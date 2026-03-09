type TrackedThreadRecord = {
	id: number
	thread_id: string
	created_at: string
	last_checked: string | null
	solved: number
	warning_level: number
	closed: number
	last_message_count: number | null
	received_at: string
}

type TrackedThreadListResponse = {
	count: number
	threads?: TrackedThreadRecord[]
}

type TrackedThreadUpsertPayload = {
	threadId: string
	createdAt?: string | null
	lastChecked?: string | null
	solved?: boolean
	warningLevel?: number
	closed?: boolean
	lastMessageCount?: number | null
}

const getWorkerApiUrl = (pathname: string) => {
	const workerEventUrl = process.env.WORKER_EVENT_URL?.trim()
	if (!workerEventUrl) {
		return null
	}

	return new URL(pathname, workerEventUrl)
}

const getWorkerHeaders = () => ({
	"content-type": "application/json",
	...(process.env.WORKER_EVENT_SECRET
		? { "x-worker-event-secret": process.env.WORKER_EVENT_SECRET }
		: {})
})

export const listTrackedThreads = async (
	filters: {
		solved?: boolean
		closed?: boolean
		limit?: number
	} = {}
) => {
	const url = getWorkerApiUrl("/api/threads")
	if (!url) {
		return []
	}

	if (filters.solved !== undefined) {
		url.searchParams.set("solved", filters.solved ? "1" : "0")
	}

	if (filters.closed !== undefined) {
		url.searchParams.set("closed", filters.closed ? "1" : "0")
	}

	if (filters.limit !== undefined) {
		url.searchParams.set("limit", String(filters.limit))
	}

	const response = await fetch(url, {
		headers: getWorkerHeaders()
	})

	if (!response.ok) {
		throw new Error(`Worker tracked thread request failed with ${response.status}.`)
	}

	const payload = (await response.json()) as TrackedThreadListResponse
	return payload.threads ?? []
}

export const upsertTrackedThread = async (
	payload: TrackedThreadUpsertPayload
) => {
	const url = getWorkerApiUrl("/api/threads")
	if (!url) {
		return
	}

	const response = await fetch(url, {
		method: "POST",
		headers: getWorkerHeaders(),
		body: JSON.stringify(payload)
	})

	if (!response.ok) {
		throw new Error(`Worker tracked thread upsert failed with ${response.status}.`)
	}
}

export type { TrackedThreadRecord, TrackedThreadUpsertPayload }

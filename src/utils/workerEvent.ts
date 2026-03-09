import type { CommandInteraction } from "@buape/carbon"

type ThreadStatsChannel = {
	id?: string
	messageCount?: number
	totalMessageSent?: number
}

type WorkerEventActor = {
	id: string | null
	username: string | null
	globalName: string | null
}

type WorkerEventContext = {
	guildId: string | null
	channelId: string | null
	threadId: string | null
	messageCount: number | null
}

type WorkerEventPayload<TData> = {
	type: string
	time: string
	invokedBy: WorkerEventActor
	context: WorkerEventContext
	data: TData
}

export const sendWorkerEvent = async <TData>(
	interaction: CommandInteraction,
	type: string,
	data: TData
) => {
	const workerUrl = process.env.WORKER_EVENT_URL
	const workerSecret = process.env.WORKER_EVENT_SECRET
	if (!workerUrl) {
		return
	}

	const channel = interaction.channel as ThreadStatsChannel | null
	const user = interaction.user
	const messageCount =
		channel?.totalMessageSent ?? channel?.messageCount ?? null
	const payload: WorkerEventPayload<TData> = {
		type,
		time: new Date().toISOString(),
		invokedBy: {
			id: user?.id ?? null,
			username: user?.username ?? null,
			globalName: user?.globalName ?? null
		},
		context: {
			guildId: interaction.guild?.id ?? null,
			channelId: interaction.channel?.id ?? null,
			threadId: channel?.id ?? null,
			messageCount
		},
		data
	}

	try {
		await fetch(workerUrl, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				...(workerSecret ? { "x-worker-event-secret": workerSecret } : {})
			},
			body: JSON.stringify(payload)
		})
	} catch {
		// Ignore worker event failures so command execution can continue.
	}
}

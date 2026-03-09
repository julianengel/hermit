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
	parentId?: string | null
}

type WorkerEventPayload<TData> = {
	type: string
	time: string
	invokedBy: WorkerEventActor
	context: WorkerEventContext
	data: TData
}

type SendWorkerEventInput<TData> = {
	type: string
	invokedBy: WorkerEventActor
	context: WorkerEventContext
	data: TData
}

export const postWorkerEvent = async <TData>({
	type,
	invokedBy,
	context,
	data
}: SendWorkerEventInput<TData>) => {
	const workerUrl = process.env.WORKER_EVENT_URL
	const workerSecret = process.env.WORKER_EVENT_SECRET
	if (!workerUrl) {
		return
	}

	const payload: WorkerEventPayload<TData> = {
		type,
		time: new Date().toISOString(),
		invokedBy,
		context,
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
		// Ignore worker event failures so primary flows can continue.
	}
}

export const sendWorkerEvent = async <TData>(
	interaction: CommandInteraction,
	type: string,
	data: TData
) => {
	const channel = interaction.channel as ThreadStatsChannel | null
	const user = interaction.user
	const messageCount =
		channel?.totalMessageSent ?? channel?.messageCount ?? null
	await postWorkerEvent({
		type,
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
	})
}

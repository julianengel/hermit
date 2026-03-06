import {
	Container,
	type Client,
	type ListenerEventData,
	TextDisplay,
	ThreadCreateListener
} from "@buape/carbon"

const defaultWelcomeTemplate =
	`Welcome to the help channel!

Krill cannot see your system — it only knows what you tell it. The more details you include, the easier it is to help.

If you haven’t included it yet, please consider sending:

What you’re trying to do (goal / expected behaviour)

What happened instead (exact error message)

What you ran or clicked (commands, config snippet, etc.)

Your environment (OS, install method, versions)

Relevant logs (the smallest useful snippet)

Posts like “it doesn’t work” without details are very hard to debug.

If new issues arise, please open a new thread/topic instead of continuing in this one. Keeping one issue per thread helps ensure answers stay accurate and makes it easier for others to find solutions later.`

export default class ThreadCreateWelcome extends ThreadCreateListener {
	async handle(data: ListenerEventData[this["type"]], _client: Client) {
		const welcomeParentId = process.env.HELPER_THREAD_WELCOME_PARENT_ID?.trim()
		if (!welcomeParentId) {
			return
		}

		const thread = data.thread
		const parentId = thread.parentId

		if (thread.archived || !parentId || parentId !== welcomeParentId) {
			return
		}

		const template =
			process.env.HELPER_THREAD_WELCOME_TEMPLATE ?? defaultWelcomeTemplate

		try {
			await thread.send({
				components: [new Container([new TextDisplay(template)])]
			})
		} catch (error) {
			console.error("Failed to send thread welcome message:", error)
		}
	}
}

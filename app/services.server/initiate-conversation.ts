import type { Conversation } from "app:entities/conversation";
import type { User } from "app:entities/user";
import { ConversationsRepository } from "app:repositories.server/conversations";
import { kv } from "@edgefirst-dev/core";

export async function initiateConversation(
	input: initiateConversation.Input,
	deps: initiateConversation.Dependencies = {
		conversations: new ConversationsRepository(),
	},
) {
	// We use the current datetime to generate a unique name for the conversation
	let name = new Date().toLocaleString("en", {
		year: "2-digit",
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	let conversation = await deps.conversations.create(input.user, name);
	await kv().set(conversation.key, []);
	return conversation;
}

export namespace initiateConversation {
	export interface Input {
		readonly user: User;
	}

	export interface Dependencies {
		readonly conversations: {
			create(user: User, name: string): Promise<Conversation>;
		};
	}
}

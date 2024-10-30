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
	let conversation = await deps.conversations.create(input.user);
	await kv().set(conversation.key, []);
	return conversation;
}

export namespace initiateConversation {
	export interface Input {
		readonly user: User;
	}

	export interface Dependencies {
		readonly conversations: {
			create(user: User): Promise<Conversation>;
		};
	}
}

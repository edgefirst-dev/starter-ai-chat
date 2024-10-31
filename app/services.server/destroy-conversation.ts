import type { Conversation } from "app:entities/conversation";
import type { User } from "app:entities/user";
import { ConversationsRepository } from "app:repositories.server/conversations";
import { type CUID, kv } from "@edgefirst-dev/core";

export async function destroyConversation(
	input: destroyConversation.Input,
	deps: destroyConversation.Dependencies = {
		conversations: new ConversationsRepository(),
	},
) {
	let [conversation] = await deps.conversations.findUserConversation(
		input.user,
		input.id,
	);

	if (!conversation) throw new Error("Conversation not found");

	await deps.conversations.destroy(conversation.id);
	await kv().remove(conversation?.key);
}

export namespace destroyConversation {
	export interface Input {
		readonly id: CUID;
		readonly user: User;
	}

	export interface Dependencies {
		readonly conversations: {
			findUserConversation(user: User, id: CUID): Promise<Conversation[]>;
			destroy(id: CUID): Promise<void>;
		};
	}
}

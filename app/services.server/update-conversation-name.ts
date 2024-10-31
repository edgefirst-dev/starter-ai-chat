import type { Conversation } from "app:entities/conversation";
import type { User } from "app:entities/user";
import { ConversationsRepository } from "app:repositories.server/conversations";
import type schema from "db:schema";
import type { CUID } from "@edgefirst-dev/core";

export async function updateConversationName(
	input: updateConversationName.Input,
	deps: updateConversationName.Dependencies = {
		conversations: new ConversationsRepository(),
	},
) {
	let [conversation] = await deps.conversations.findUserConversation(
		input.user,
		input.id,
	);
	if (!conversation) throw new Error("Conversation not found");
	return deps.conversations.update(conversation, { name: input.name });
}

export namespace updateConversationName {
	export interface Input {
		readonly id: CUID;
		readonly name: string;
		readonly user: User;
	}

	export interface Dependencies {
		readonly conversations: {
			findUserConversation(user: User, id: CUID): Promise<Conversation[]>;
			update(
				conversation: Conversation,
				data: Partial<typeof schema.conversations.$inferInsert>,
			): Promise<Conversation>;
		};
	}
}

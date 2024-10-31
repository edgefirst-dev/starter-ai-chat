import type { Conversation } from "app:entities/conversation";
import type { User } from "app:entities/user";
import { ConversationsRepository } from "app:repositories.server/conversations";
import { type CUID, ai, kv, waitUntil } from "@edgefirst-dev/core";
import { ObjectParser } from "@edgefirst-dev/data/parser";

export async function sendMessageToConversation(
	input: sendMessageToConversation.Input,
	deps = { conversations: new ConversationsRepository() },
) {
	let [conversation] = await deps.conversations.findUserConversation(
		input.user,
		input.id,
	);

	if (!conversation) throw new Error("Conversation not found");

	let previous = await kv().get<RoleScopedChatInput[]>(conversation.key);

	let previousData = previous.data ?? [];

	let messages: RoleScopedChatInput[] = [
		{
			role: "system",
			content: `You are a friendly assistant about Cloudflare Development Platform, the user name is ${input.user.displayName}, use consice responses.`,
		},
		...previousData,
		{ role: "user", content: input.message },
	];

	let result = await ai().textGeneration("@cf/meta/llama-3-8b-instruct", {
		messages,
		stream: false,
	});

	if (result instanceof ReadableStream) throw new Error("Invalid response");

	let parser = new ObjectParser(result);
	let response = parser.string("response");

	waitUntil(
		kv().set(conversation.key, [
			...previousData,
			{ role: "user", content: input.message },
			{ role: "assistant", content: response },
		]),
	);

	return response;
}

export namespace sendMessageToConversation {
	export interface Input {
		id: CUID;
		user: User;
		message: string;
	}

	export interface Dependencies {
		readonly conversations: {
			findUserConversation(user: User, id: CUID): Promise<Conversation[]>;
		};
	}
}

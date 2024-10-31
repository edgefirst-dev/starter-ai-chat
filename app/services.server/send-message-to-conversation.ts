import type { Conversation } from "app:entities/conversation";
import type { User } from "app:entities/user";
import { ConversationsRepository } from "app:repositories.server/conversations";
import { type CUID, ai, kv, waitUntil } from "@edgefirst-dev/core";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { updateConversationName } from "./update-conversation-name";

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

	if (previousData.length > 0) return response;

	if (conversation.updatedAt.getTime() === conversation.createdAt.getTime()) {
		let { summary: name } = await ai().summarization(
			"@cf/facebook/bart-large-cnn",
			{ input_text: input.message, max_length: 30 },
		);

		await updateConversationName({
			user: input.user,
			id: conversation.id,
			name,
		});
	}

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

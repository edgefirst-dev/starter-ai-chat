import { Conversation } from "app:entities/conversation";
import type { User } from "app:entities/user";
import schema from "db:schema";
import { orm } from "@edgefirst-dev/core";
import { eq } from "drizzle-orm";

export class ConversationsRepository {
	async create(user: User) {
		let [row] = await orm()
			.insert(schema.conversations)
			.values({
				userId: user.id,
				name: `New conversation of ${user.displayName}`,
			})
			.returning();
		if (row) return Conversation.from(row);
		throw new Error("Failed to create conversation");
	}

	async findByUser(user: User) {
		return Conversation.fromMany(
			await orm()
				.select()
				.from(schema.conversations)
				.where(eq(schema.conversations.userId, user.id)),
		);
	}
}

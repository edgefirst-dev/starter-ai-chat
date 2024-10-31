import { Conversation } from "app:entities/conversation";
import type { User } from "app:entities/user";
import schema from "db:schema";
import { type CUID, orm } from "@edgefirst-dev/core";
import { and, desc, eq } from "drizzle-orm";

export class ConversationsRepository {
	async create(user: User, name: string) {
		let [row] = await orm()
			.insert(schema.conversations)
			.values({ userId: user.id, name })
			.returning();
		if (row) return Conversation.from(row);
		throw new Error("Failed to create conversation");
	}

	async findByUser(user: User) {
		return Conversation.fromMany(
			await orm()
				.select()
				.from(schema.conversations)
				.where(eq(schema.conversations.userId, user.id))
				.orderBy(desc(schema.conversations.updatedAt)),
		);
	}

	async findUserConversation(user: User, id: CUID) {
		return Conversation.fromMany(
			await orm()
				.select()
				.from(schema.conversations)
				.where(
					and(
						eq(schema.conversations.id, id),
						eq(schema.conversations.userId, user.id),
					),
				)
				.limit(1),
		);
	}

	async destroy(id: CUID) {
		await orm()
			.delete(schema.conversations)
			.where(eq(schema.conversations.id, id));
	}

	async findById(id: CUID) {
		return Conversation.fromMany(
			await orm()
				.select()
				.from(schema.conversations)
				.where(eq(schema.conversations.id, id))
				.limit(1),
		);
	}

	async update(
		conversation: Conversation,
		data: Partial<typeof schema.conversations.$inferInsert>,
	) {
		let [row] = await orm()
			.update(schema.conversations)
			.set(data)
			.where(eq(schema.conversations.id, conversation.id))
			.returning();
		if (row) return Conversation.from(row);
		throw new Error("Failed to update conversation");
	}
}

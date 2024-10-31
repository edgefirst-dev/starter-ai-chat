import { Button } from "app:components/ui/button";
import { authenticate } from "app:helpers/auth";
import { rateLimit } from "app:helpers/rate-limit";
import { initiateConversation } from "app:services.server/initiate-conversation";
import type * as Route from "types:views/chat/+types.detail";
import { Form, redirect } from "react-router";

export async function action({ request }: Route.ActionArgs) {
	await rateLimit(request.headers);
	let user = await authenticate(request);
	let conversation = await initiateConversation({ user });
	throw redirect(conversation.path);
}

export default function Component() {
	return (
		<main className="min-h-dvh w-full flex flex-col justify-center items-center">
			<div className="flex flex-col justify-center items-center gap-y-6 max-w-lg">
				<h1 className="text-4xl/none font-semibold text-center text-balance">
					Choose a chat to start
				</h1>

				<p className="text-lg/normal text-center text-balance">
					Pick a conversation from the sidebar to start chatting or create a new
					one.
				</p>

				<Form method="POST">
					<Button type="submit" className="w-full">
						Start a New Chat
					</Button>
				</Form>
			</div>
		</main>
	);
}

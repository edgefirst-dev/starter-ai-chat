import { Spinner } from "app:components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "app:components/ui/avatar";
import { Button } from "app:components/ui/button";
import { Input } from "app:components/ui/input";
import { ScrollArea } from "app:components/ui/scroll-area";
import { authenticate } from "app:helpers/auth";
import { parseBody } from "app:helpers/body-parser";
import { cn } from "app:helpers/cn";
import { rateLimit } from "app:helpers/rate-limit";
import { badRequest, ok } from "app:helpers/response";
import { usePrevious } from "app:hooks/use-previous";
import type * as Route from "types:views/+types.conversation";
import type { RoleScopedChatInput } from "@cloudflare/workers-types";
import { StringParser, ai } from "@edgefirst-dev/core";
import { Data } from "@edgefirst-dev/data";
import { type FormParser, ObjectParser } from "@edgefirst-dev/data/parser";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { useSpinDelay } from "spin-delay";

interface Message {
	id: string;
	sender: "user" | "bot";
	text: string;
}

export async function loader({ request }: Route.LoaderArgs) {
	let user = await authenticate(request, "/login");
	return ok({
		user: {
			avatar: user.avatar,
			initials: user.displayName
				.split(" ")
				.map((w) => w.charAt(0))
				.join(""),
		},
	});
}

export async function action({ request }: Route.LoaderArgs) {
	await rateLimit(request.headers);
	let user = await authenticate(request, "/login");

	try {
		let data = await parseBody(
			request,
			class extends Data<FormParser> {
				get previous() {
					let previous = JSON.parse(this.parser.string("previous"));
					if (!Array.isArray(previous))
						throw new Error("Invalid previous value");
					return previous
						.map((object) => new ObjectParser(object))
						.map((parser) => {
							return {
								role: new StringParser(parser.string("role")).enum(
									"user",
									"assistant",
								),
								content: parser.string("content"),
							};
						});
				}
				get message() {
					return this.parser.string("message");
				}
			},
		);

		let messages: RoleScopedChatInput[] = [
			{
				role: "system",
				content: `You are a friendly assistant about Cloudflare Development Platform, the user name is ${user.displayName}, use consice responses.`,
			},
			...data.previous,
			{ role: "user", content: data.message },
		];

		let result = await ai().textGeneration("@cf/meta/llama-3-8b-instruct", {
			messages,
			stream: false,
		});

		if (result instanceof ReadableStream) throw new Error("Invalid response");
		return ok({ result });
	} catch (error) {
		console.error(error);
		return badRequest({ message: "Invalid request" });
	}
}

export default function Component({ loaderData }: Route.ComponentProps) {
	let fetcher = useFetcher<Route.ActionData>({ key: "chat" });
	let [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		if (!fetcher.data) return;
		if (!fetcher.data.ok) return;
		let { response } = fetcher.data.result as { response: string };
		setMessages((c) =>
			c.concat({ id: crypto.randomUUID(), sender: "bot", text: response }),
		);
	}, [fetcher.data]);

	return (
		<main
			role="application"
			className="flex flex-col justify-between items-start max-w-screen-xl w-full h-full rounded-3xl bg-neutral-100 p-5"
		>
			<ScrollArea className="w-full flex flex-col gap-4">
				{messages.map((message) => (
					<ChatMessage
						key={message.id}
						user={loaderData.user}
						message={message}
					/>
				))}
			</ScrollArea>

			<ChatForm
				messages={messages}
				onSubmit={(message) => {
					setMessages((c) =>
						c.concat({
							id: crypto.randomUUID(),
							sender: "user",
							text: message,
						}),
					);
				}}
			/>
		</main>
	);
}

interface ChatFormProps {
	messages: Message[];
	onSubmit(message: string): void;
}

function ChatForm({ onSubmit, messages }: ChatFormProps) {
	let fetcher = useFetcher<typeof action>({ key: "chat" });

	let [message, setMessage] = useState("");

	let isPending = useSpinDelay(fetcher.state === "submitting", {
		delay: 50,
		minDuration: 500,
	});

	let wasPending = usePrevious(isPending);

	useEffect(() => {
		if (wasPending && !isPending) setMessage("");
	}, [isPending, wasPending]);

	return (
		<fetcher.Form
			onSubmit={async (event) => {
				let $element = event.currentTarget.elements.namedItem("message");
				if ($element instanceof HTMLInputElement) onSubmit($element.value);
			}}
			method="post"
			className="p-4 flex gap-x-2 w-full"
		>
			<input
				type="hidden"
				name="previous"
				value={JSON.stringify(
					messages.map((message) => {
						return {
							role: message.sender === "user" ? "user" : "assistant",
							content: message.text,
						};
					}),
				)}
			/>
			<Input
				name="message"
				required
				minLength={1}
				className="flex-grow"
				aria-label="Message"
				disabled={isPending}
				placeholder="Type your message..."
				value={message}
				onChange={(event) => setMessage(event.currentTarget.value)}
			/>
			<Button type="submit" disabled={isPending}>
				{isPending && (
					<span className="absolute inset-0 flex justify-center items-center">
						<Spinner aria-hidden className="size-5" />
					</span>
				)}
				<span className={cn({ invisible: isPending })}>Send</span>
			</Button>
		</fetcher.Form>
	);
}

interface ChatMessageProps {
	user: { avatar: string; initials: string };
	message: Message;
}

function ChatMessage({ user, message }: ChatMessageProps) {
	return (
		<div
			className={cn("flex", {
				"justify-end ml-10": message.sender === "user",
				"justify-start mr-10": message.sender === "bot",
			})}
		>
			<div
				className={cn("flex items-end gap-2", {
					"flex-row-reverse": message.sender === "user",
					"flex-row": message.sender === "bot",
				})}
			>
				<Avatar className="size-8">
					<AvatarImage
						src={
							message.sender === "user"
								? user.avatar
								: "/placeholder.svg?height=32&width=32"
						}
					/>
					<AvatarFallback>
						{message.sender === "user" ? user.initials : "B"}
					</AvatarFallback>
				</Avatar>

				<div
					className={cn("max-w-xl px-4 py-2 rounded-lg whitespace-pre-wrap", {
						"bg-info-500 text-white rounded-br-none": message.sender === "user",
						"bg-neutral-200 text-neutral-800 rounded-bl-none":
							message.sender === "bot",
					})}
				>
					{message.text}
				</div>
			</div>
		</div>
	);
}

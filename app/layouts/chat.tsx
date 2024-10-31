import { Button } from "app:components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "app:components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "app:components/ui/sidebar";
import { authenticate } from "app:helpers/auth";
import { parseBody } from "app:helpers/body-parser";
import { rateLimit } from "app:helpers/rate-limit";
import { ok } from "app:helpers/response";
import { ConversationsRepository } from "app:repositories.server/conversations";
import { destroyConversation } from "app:services.server/destroy-conversation";
import { initiateConversation } from "app:services.server/initiate-conversation";
import type * as Route from "types:layouts/+types.chat";
import { StringParser } from "@edgefirst-dev/core";
import { Data } from "@edgefirst-dev/data";
import type { FormParser } from "@edgefirst-dev/data/parser";
import { MoreHorizontalIcon } from "lucide-react";
import {
	Form,
	NavLink,
	Outlet,
	redirect,
	useFetcher,
	useLocation,
} from "react-router";

interface Conversation {
	id: string;
	name: string;
	path: string;
}

export async function loader({ request }: Route.LoaderArgs) {
	let user = await authenticate(request);
	let conversations = await new ConversationsRepository().findByUser(user);

	return ok({
		conversations: conversations.map((c) => {
			return { id: c.id, name: c.name, path: c.path } satisfies Conversation;
		}),
	});
}

export async function action({ request }: Route.ActionArgs) {
	await rateLimit(request.headers);
	let user = await authenticate(request);
	if (request.method === "POST") {
		let conversation = await initiateConversation({ user });
		throw redirect(conversation.path);
	}
	if (request.method === "DELETE") {
		let data = await parseBody(
			request,
			class extends Data<FormParser> {
				get id() {
					return new StringParser(this.parser.string("id")).cuid();
				}
			},
		);
		await destroyConversation({ id: data.id, user });
		return ok(null);
	}
}

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<SidebarProvider>
			<div className="flex flex-row w-full">
				<ChatSidebar conversations={loaderData.conversations} />
				<Outlet />
			</div>
		</SidebarProvider>
	);
}

interface ChatSidebarProps {
	conversations: Array<Conversation>;
}

function ChatSidebar({ conversations }: ChatSidebarProps) {
	return (
		<Sidebar>
			<SidebarHeader>
				<Form method="POST">
					<Button type="submit" className="w-full">
						New Chat
					</Button>
				</Form>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Conversations</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenu>
							{conversations.map((c) => (
								<ChatSidebarItem key={c.id} conversation={c} />
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}

function ChatSidebarItem({ conversation }: { conversation: Conversation }) {
	let fetcher = useFetcher();
	let { pathname } = useLocation();

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				isActive={pathname.startsWith(conversation.path)}
				asChild
				className="line-clamp-1"
			>
				<NavLink className="p-1 line-clamp-1 w-full" to={conversation.path}>
					{conversation.name}
				</NavLink>
			</SidebarMenuButton>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuAction>
						<MoreHorizontalIcon />
						<span className="sr-only">More</span>
					</SidebarMenuAction>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="right" align="start">
					<DropdownMenuItem
						onClick={() => {
							fetcher.submit({ id: conversation.id }, { method: "DELETE" });
						}}
					>
						<span>Delete Project</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	);
}

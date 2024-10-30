import { Button } from "app:components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarProvider,
} from "app:components/ui/sidebar";
import { authenticate } from "app:helpers/auth";
import { rateLimit } from "app:helpers/rate-limit";
import { ok } from "app:helpers/response";
import { ConversationsRepository } from "app:repositories.server/conversations";
import { initiateConversation } from "app:services.server/initiate-conversation";
import type * as Route from "types:layouts/+types.chat";
import { Form, NavLink, Outlet } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	let user = await authenticate(request);
	let conversations = await new ConversationsRepository().findByUser(user);

	return ok({
		conversations: conversations.map((c) => {
			return { id: c.id, name: c.name, path: c.path };
		}),
	});
}

export async function action({ request }: Route.ActionArgs) {
	await rateLimit(request.headers);
	let user = await authenticate(request);
	let conversation = await initiateConversation({ user });
	throw redirect(conversation.path);
}

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<SidebarProvider>
			<div className="flex flex-row gap-4 divide-x divide-neutral-300">
				<Sidebar>
					<SidebarHeader>
						<Form>
							<Button type="submit">Start</Button>
						</Form>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Conversations</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{loaderData.conversations.map((c) => {
										return (
											<SidebarMenuItem key={c.id}>
												<NavLink to={c.path}>{c.name}</NavLink>
											</SidebarMenuItem>
										);
									})}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>
				<Outlet />
			</div>
		</SidebarProvider>
	);
}

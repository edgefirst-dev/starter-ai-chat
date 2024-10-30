import { Button } from "app:components/button";
import { authenticate } from "app:helpers/auth";
import { rateLimit } from "app:helpers/rate-limit";
import { ok } from "app:helpers/response";
import type * as Route from "types:views/+types.chat";
import { Form, Outlet } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
	let user = await authenticate(request, "/login");
	return ok(null);
}

export async function action({ request }: Route.LoaderArgs) {
	await rateLimit(request.headers);
	let user = await authenticate(request, "/login");
	return ok(null);
}

export default function Component() {
	return <main role="application" className="flex flex-col" />;
}

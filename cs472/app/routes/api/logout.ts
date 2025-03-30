import { redirect, type ActionFunctionArgs } from "react-router";

export async function action({request} : ActionFunctionArgs) {
    return redirect("/login", {
        headers: {
            "Set-Cookie": "auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
    });
}
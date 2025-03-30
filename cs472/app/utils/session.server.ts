import { createCookie, type CookieOptions } from "react-router";


const secret = process.env.AUTH_SECRET as string;
const authCookieOptions : CookieOptions = {
  sameSite: "lax",
  path: "/",
  secure: true,
  secrets: [secret],
  httpOnly: false,
  maxAge: 60 * 60 * 1 * 1, // seconds * minutes * hours * days
}
export const authCookie = createCookie("auth", authCookieOptions);

import {
  Link,
  redirect,
  useFetcher,
  type ActionFunctionArgs,
} from "react-router";
import { authCookie } from "~/utils/session.server";
import UserRepository from "./repositories/UserRepository.server";

interface ActionMessage {
  message: string;
  error: string;
  data: any;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");
  switch (action) {
    case "login":
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      if (!email || !password) {
        return {
          message: "",
          error: "Invalid email or password",
          data: null,
        };
      }
      const userRepo = new UserRepository();
      const response = await userRepo.login(email, password);
      if (response.error) {
        return {
          message: "",
          error: "Invalid email or password",
          data: null,
        };
      }
      const authCookieUser: AuthCookie = {
        uuid: response.user.uuid,
        name: response.user.name,
        surname: response.user.surname,
        email: response.user.email,
        year: response.user.year,
        role: response.user.role,
      };
      
      console.log("Auth Cookie: ",authCookieUser);

      if(authCookieUser.role=="teacher"){
        return redirect("/add-course", {
          headers: {
            "Set-Cookie": await authCookie.serialize(authCookieUser),
          },
        }); 
      }

      return redirect("/", {
        headers: {
          "Set-Cookie": await authCookie.serialize(authCookieUser),
        },
      });
    case "logout":
      break;
    default:
      return { message: "", error: "Invalid action", data: null };
  }
}

export default function Login() {
  const fetcher = useFetcher<ActionMessage>();
  return (
    <div className="bg-[#C0E0FF] h-screen flex flex-col justify-center items-center overflow-auto">
      <fetcher.Form
        method="post"
        className="flex flex-col justify-center items-center w-fit h-fit space-y-4 bg-blue-50 p-10 rounded-2xl"
      >
        <h1 className="text-[#1E364C] font-extrabold text-3xl">Nisit-Comsci</h1>
        <input
          type="text"
          name="email"
          placeholder="Email"
          className="border border-gray-300 p-2 text-[#1E364C] bg-[#FFFFFF]"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border border-gray-300 p-2 text-[#1E364C] bg-[#FFFFFF]"
        />
        {fetcher.data?.error && (
          <div className="text-red-500 text-[12px]">{fetcher.data.error}</div>
        )}
        <button
          name="_action"
          value="login"
          className="bg-[#7793AE] text-white p-2 rounded-2xl w-40 hover:bg-[#43586c] transition"
        >
          Login
        </button>
        <div className="flex flex-row gap-2">
          <h1 className="text-[#1E364C] text-[12px] ">Don't have an account?</h1>
          <Link
            to="/register"
            prefetch="render"
            className="text-[#1E364C] underline font-bold hover:font-extrabold text-[12px]"
          >
            Register
          </Link>
        </div>
      </fetcher.Form>
    </div>
  );
}

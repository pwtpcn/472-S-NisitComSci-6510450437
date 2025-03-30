import { Link, redirect, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { authCookie } from "~/utils/session.server";
// import MenuBar from "./components/MenuBar";


export const meta: MetaFunction = () => {
  return [
    { title: "Nisit Com Sci" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({request}: LoaderFunctionArgs) {
  const session = request.headers.get("Cookie");
  const user : AuthCookie = await authCookie.parse(session);
  if (!user) return redirect("/login");
  return {user};
}

export default function Index() {
  const {user} = useLoaderData<typeof loader>();
  return (

      <div className="bg-[#C0E0FF] w-screen h-screen flex flex-col justify-center items-center p-6 overflow-auto">
        <h1 className="text-black font-bold text-2xl">
         Welcome {user.name} {user.surname}! to Nisit Com Sci
       </h1>
        <Link to="/my-course-list">
          <button className="mt-4 px-6 py-3 bg-[#1E364C] text-white font-semibold rounded-lg shadow-md hover:bg-[#43586c] transition">
            Let's Start !
          </button>
       </Link>
      </div>

  );
}
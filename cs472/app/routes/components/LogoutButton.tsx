import { useFetcher } from "react-router";

export default function LogoutButton() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post" action="/api/logout">
      <button
        type="submit"
        className="w-full px-4 py-2 bg-red-700 text-white rounded hover:bg-red-500"
      >
        Logout
      </button>
    </fetcher.Form>
  );
}

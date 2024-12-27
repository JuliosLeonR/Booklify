import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";

type LoaderData = {
  user: {
    profile_picture: string;
    name: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await requireAuth(request);
  return { user };
};

export default function Dashboard() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}!</p>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
    </div>
  );
}
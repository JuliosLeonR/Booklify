import { useLoaderData, redirect } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
    const cookie = request.headers.get("Cookie");
    const token = cookie?.split("=")[1];

    if (!token) {
        return redirect("/login");
    }

    // Opcional, verificar el token amb el backend aqui

    return null;
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    useLoaderData();
    return <>{children}</>;
}
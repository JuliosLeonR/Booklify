import { useLoaderData, Form, redirect } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";

type Report = {
  id: number;
  user_id: number;
  reportable_id: number;
  reportable_type: string;
  reason: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type LoaderData = {
  report: Report;
  token: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user } = await requireAuth(request);
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const response = await fetch(`http://localhost/api/admin/reports/${params.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch report");
  }

  const data = await response.json();
  return json<LoaderData>({ report: data.report, token });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const description = formData.get("description");

  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const response = await fetch(`http://localhost/api/admin/reports/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    throw new Error("Failed to update report");
  }

  return redirect("/admin/reports");
};

export default function EditReport() {
  const { report } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Edit Report</h1>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Report ID</label>
            <p className="mt-1 text-gray-800 dark:text-gray-100">{report.id}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
            <p className="mt-1 text-gray-800 dark:text-gray-100">{report.user_id}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reportable ID</label>
            <p className="mt-1 text-gray-800 dark:text-gray-100">{report.reportable_id}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reportable Type</label>
            <p className="mt-1 text-gray-800 dark:text-gray-100">{report.reportable_type}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
            <p className="mt-1 text-gray-800 dark:text-gray-100">{report.reason}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
            <p className="mt-1 text-gray-800 dark:text-gray-100">{new Date(report.created_at).toLocaleString()}</p>
          </div>
          <Form method="post">
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                name="description"
                id="description"
                defaultValue={report.description}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
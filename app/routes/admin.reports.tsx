import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";
import { EyeIcon } from "@heroicons/react/24/solid";
import { requireAdmin } from "~/utils/requireAdmin";



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
  reports: Report[];
  token: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdmin({ request });

  const { user } = await requireAuth(request);
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  const response = await fetch(`http://localhost/api/admin/reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reports");
  }

  const data = await response.json();
  return json<LoaderData>({ reports: data.reports, token });
};

export default function ManageReports() {
  const { reports } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Manage Reports</h1>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ID</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">User ID</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Reportable ID</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Type</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Reason</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Description</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Created At</th>
                  <th className="py-2 px-4 border-b-2 border-gray-300 dark:border-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{report.id}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{report.user_id}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{report.reportable_id}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{report.reportable_type}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{report.reason}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{report.description}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">{new Date(report.created_at).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      <Link to={`/admin/show-report/${report.id}`} className="text-blue-500 hover:underline">
                      <EyeIcon className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
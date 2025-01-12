import { useState, useEffect, useRef } from "react";
import { useLoaderData } from "@remix-run/react";
import { Chart, registerables } from "chart.js";
import { json } from "@remix-run/node";
import { requireAuth } from "~/components/Auth";
import { parse } from "cookie";

Chart.register(...registerables);

type LoaderData = {
  token: string;
};

export const loader = async ({ request }) => {
  const { user } = await requireAuth(request);
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const token = cookies.token;

  return json<LoaderData>({ token });
};

export default function Analytics() {
  const { token } = useLoaderData<LoaderData>();
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState("totalBooks");
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      let url = "";
      if (chartType === "totalBooks") {
        url = "http://localhost/api/admin/analytics/total-books";
      } else if (chartType === "bookWithMostReviews") {
        url = "http://localhost/api/admin/analytics/book-with-most-reviews";
      } else if (chartType === "topRatedBooks") {
        url = "http://localhost/api/admin/analytics/top-rated-books";
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      if (chartType === "totalBooks") {
        setChartData({
          labels: ["Total Books"],
          datasets: [
            {
              label: "Total Books",
              data: [data.total_books],
              backgroundColor: ["#4CAF50"],
            },
          ],
        });
      } else if (chartType === "bookWithMostReviews") {
        setChartData({
          labels: [data.book_with_most_reviews.title],
          datasets: [
            {
              label: "Reviews",
              data: [data.book_with_most_reviews.reviews_count],
              backgroundColor: ["#FF6384"],
            },
          ],
        });
      } else if (chartType === "topRatedBooks") {
        setChartData({
          labels: data.top_rated_books.map((book) => book.title),
          datasets: [
            {
              label: "Average Rating",
              data: data.top_rated_books.map((book) => book.reviews_avg_rating),
              backgroundColor: ["#36A2EB"],
            },
          ],
        });
      }
    };

    fetchData().catch(console.error);
  }, [chartType, token]);

  useEffect(() => {
    if (chartData) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [chartData]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Analytics</h1>
          <div className="mb-4">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            >
              <option value="totalBooks">Total Books</option>
              <option value="bookWithMostReviews">Book with Most Reviews</option>
              <option value="topRatedBooks">Top Rated Books</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <canvas id="myChart" ref={chartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
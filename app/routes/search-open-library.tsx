import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Form, useSearchParams } from "@remix-run/react";
import { searchOpenLibraryBooks } from "~/utils/openLibrary";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const books = query ? await searchOpenLibraryBooks(query) : [];
  return json({ books, query });
};

export default function SearchOpenLibrary() {
  const { books, query } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get("query") as string;
    setSearchParams({ query });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-5 sm:px-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Search Open Library Books</h1>
          <Form method="get" onSubmit={handleSearch} className="mb-6">
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search for books..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            <button type="submit" className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg">Search</button>
          </Form>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book: any) => (
              <div key={book.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                {book.cover_i && (
                  <img
                    src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{book.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">by {book.author_name?.join(", ")}</p>
                <p className="mt-2 text-gray-800 dark:text-gray-100">{book.first_publish_year}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
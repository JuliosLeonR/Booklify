import { Form, Link } from "@remix-run/react";
import { useState, useEffect } from "react";

type User = {
  profile_picture: string;
  name: string;
};

type FriendRequest = {
  id: number;
  user: {
    profile_picture: string;
    username: string;
    name: string;
  };
};

export default function Navbar({ user, token }: { user: User, token: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    async function fetchFriendRequests() {
      if (!token) {
        console.log("No token found");
        return;
      }

      try {
        const response = await fetch("http://localhost/api/friend-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFriendRequests(data.friendRequests);
        } else {
          console.error("Failed to fetch friend requests:", response.status);
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    }

    fetchFriendRequests();
  }, [token]);

  const handleFriendRequest = async (id: number, status: string) => {
    try {
      const response = await fetch(`http://localhost/api/friends/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setFriendRequests((prevRequests) =>
          prevRequests.filter((request) => request.id !== id)
        );
      } else {
        console.error("Failed to update friend request:", response.status);
      }
    } catch (error) {
      console.error("Error updating friend request:", error);
    }
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-emerald-400">
          Booklify
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/books" className="hover:text-emerald-300">
            Books
          </Link>
          <Link to="/add-book" className="hover:text-emerald-300">
            Add a Book
          </Link>
          <Link to="/users" className="hover:text-emerald-300">
            Users
          </Link>
          <Link to="/rankings" className="hover:text-emerald-300">
            Rankings🏆
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="relative focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="text-2xl">&#128276;</span>
              {friendRequests.length > 0 && (
                <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-600 rounded-full"></span>
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded-md shadow-lg z-30">
                <div className="p-2">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-2">
                    Friend Requests
                  </h3>
                  {friendRequests.length > 0 ? (
                    friendRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center p-2 hover:bg-gray-100 rounded-md"
                      >
                        <img
                          src={`http://localhost/storage/${request.user.profile_picture}`}
                          alt={request.user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <p className="ml-3 flex-1">@{request.user.username}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFriendRequest(request.id, "accepted")}
                            className="text-green-500 hover:underline"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleFriendRequest(request.id, "rejected")}
                            className="text-red-500 hover:underline"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No requests</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              <img
                src={`http://localhost/storage/${user.profile_picture}`}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-emerald-400"
              />
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg z-30">
                <Link
                  to="/profile-settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Profile Settings
                </Link>
                <Link
                  to="/my-books"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  My Books
                </Link>
                <Link
                  to="/my-reviews"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  My Reviews
                </Link>
                <Link
                  to="/my-lists"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  My Lists
                </Link>
                <Form method="post" action="/logout">
                  <button
                    type="submit"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </Form>
              </div>
            )}
          </div>
        </div>

        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-2xl">&#9776;</span>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-800 px-4 py-2">
          <Link to="/users" className="block py-2 hover:text-emerald-300">
            Users
          </Link>
          <Link to="/books" className="block py-2 hover:text-emerald-300">
            Books
          </Link>
          <Link to="/add-book" className="block py-2 hover:text-emerald-300">
            Add a Book
          </Link>
        </div>
      )}
    </nav>
  );
}
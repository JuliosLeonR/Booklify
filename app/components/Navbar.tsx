import { Form, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import DarkModeToggle from "./DarkModeToggle";


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

type Notification = {
  id: number;
  type: string;
  data: {
    message: string;
    [key: string]: any;
  };
  read: boolean;
};

export default function Navbar({ user, token }: { user: User, token: string | null }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);
  const [isMessagesMenuOpen, setIsMessagesMenuOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

    async function fetchNotifications() {
      if (!token) {
        console.log("No token found");
        return;
      }

      try {
        const response = await fetch("http://localhost/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
        } else {
          console.error("Failed to fetch notifications:", response.status);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    fetchFriendRequests();
    fetchNotifications();
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

  const markNotificationAsRead = async (id: number) => {
    try {
      const response = await fetch(`http://localhost/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
      } else {
        console.error("Failed to mark notification as read:", response.status);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
    if (!isProfileMenuOpen) {
      setIsHamburgerMenuOpen(false); // Close hamburger menu
      setIsNotificationsMenuOpen(false); // Close notification menu
      setIsMessagesMenuOpen(false); // Close messages menu
    }
  };

  const toggleHamburgerMenu = () => {
    setIsHamburgerMenuOpen((prev) => !prev);
    if (!isHamburgerMenuOpen) {
      setIsProfileMenuOpen(false); // Close profile menu
      setIsNotificationsMenuOpen(false); // Close notification menu
      setIsMessagesMenuOpen(false); // Close messages menu
    }
  };

  const toggleNotificationsMenu = () => {
    setIsNotificationsMenuOpen((prev) => !prev);
    if (!isNotificationsMenuOpen) {
      setIsProfileMenuOpen(false); // Close profile menu
      setIsHamburgerMenuOpen(false); // Close hamburger menu
      setIsMessagesMenuOpen(false); // Close messages menu
    }
  };

  const toggleMessagesMenu = () => {
    setIsMessagesMenuOpen((prev) => !prev);
    if (!isMessagesMenuOpen) {
      setIsProfileMenuOpen(false); // Close profile menu
      setIsHamburgerMenuOpen(false); // Close hamburger menu
      setIsNotificationsMenuOpen(false); // Close notification menu
    }
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-2xl font-bold text-emerald-400">
          Booklify
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/books" className="hover:text-emerald-300">
            Books
          </Link>
          <Link to="/for-you" className="hover:text-emerald-300">
            For You
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
        <DarkModeToggle />
          <div className="relative">
            <button
              className="relative focus:outline-none"
              onClick={toggleNotificationsMenu}
            >
              <span className="text-2xl">&#128276;</span>
              {friendRequests.length > 0 && (
                <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-600 rounded-full"></span>
              )}
            </button>
            {isNotificationsMenuOpen && (
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
              className="relative focus:outline-none"
              onClick={toggleMessagesMenu}
            >
              <span className="text-2xl">&#9993;</span>
              {notifications.some((notification) => !notification.read) && (
                <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-600 rounded-full"></span>
              )}
            </button>
            {isMessagesMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded-md shadow-lg z-30">
                <div className="p-2">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-2">
                    Messages
                  </h3>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-center p-2 hover:bg-gray-100 rounded-md ${notification.read ? 'bg-gray-200' : ''}`}
                      >
                        <p className="ml-3 flex-1">{notification.data.message}</p>
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="text-blue-500 hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No messages</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="focus:outline-none"
            >
              <img
                src={`http://localhost/storage/${user.profile_picture}`}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-emerald-400"
              />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg z-30">
                <Link
                  to="/my-profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  My Profile
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
                <Link
                  to="/profile-settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Profile Settings
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

          <button
            className="md:hidden focus:outline-none"
            onClick={toggleHamburgerMenu}
          >
            <span className="text-2xl">&#9776;</span>
          </button>
        </div>
      </div>

      {isHamburgerMenuOpen && (
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
          <Link to="/for-you" className="block py-2 hover:text-emerald-300">
            For You
          </Link>
          <Link to="/rankings" className="block py-2 hover:text-emerald-300">
            Rankings🏆
          </Link>
        </div>
      )}
    </nav>
  );
}
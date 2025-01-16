import { Form, Link } from "@remix-run/react";
import { useState, useEffect } from "react";

type User = {
  profile_picture: string;
  name: string;
};

export default function AdminNavbar({ user, token }: { user: User, token: string | null }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
    if (!isProfileMenuOpen) {
      setIsHamburgerMenuOpen(false); 
      setIsNotificationsMenuOpen(false); 
    }
  };

  const toggleHamburgerMenu = () => {
    setIsHamburgerMenuOpen((prev) => !prev);
    if (!isHamburgerMenuOpen) {
      setIsProfileMenuOpen(false);
      setIsNotificationsMenuOpen(false); 
    }
  };

  const toggleNotificationsMenu = () => {
    setIsNotificationsMenuOpen((prev) => !prev);
    if (!isNotificationsMenuOpen) {
      setIsProfileMenuOpen(false); 
      setIsHamburgerMenuOpen(false); 
    }
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-emerald-400">
          Booklify Admin
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/admin/dashboard" className="hover:text-emerald-300">
            Dashboard
          </Link>
          <Link to="/admin/users" className="hover:text-emerald-300">
            Manage Users
          </Link>
          <Link to="/admin/reports" className="hover:text-emerald-300">
            Manage Reports
          </Link>
          <Link to="/admin/books" className="hover:text-emerald-300">
            Manage Books
          </Link>
          <Link to="/admin/reviews" className="hover:text-emerald-300">
            Manage Reviews
          </Link>
          <Link to="/admin/comments" className="hover:text-emerald-300">
            Manage Comments
          </Link>
          <Link to="/admin/analytics" className="hover:text-emerald-300">
            Analytics
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="relative focus:outline-none"
              onClick={toggleNotificationsMenu}
            >
              <span className="text-2xl">&#128276;</span>
            </button>
            {isNotificationsMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded-md shadow-lg z-30">
                <div className="p-2">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-2">
                    Notifications
                  </h3>
                  <p className="text-center text-gray-500">No notifications</p>
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
          <Link to="/admin/dashboard" className="block py-2 hover:text-emerald-300">
            Dashboard
          </Link>
          <Link to="/admin/users" className="block py-2 hover:text-emerald-300">
            Manage Users
          </Link>
          <Link to="/admin/reports" className="block py-2 hover:text-emerald-300">
            Manage Reports
          </Link>
          <Link to="/admin/books" className="block py-2 hover:text-emerald-300">
            Manage Books
          </Link>
          <Link to="/admin/reviews" className="block py-2 hover:text-emerald-300">
            Manage Reviews
          </Link>
          <Link to="/admin/reviews" className="block py-2 hover:text-emerald-300">
            Manage Comments
          </Link>
          <Link to="/admin/reviews" className="block py-2 hover:text-emerald-300">
            Analytics
          </Link>
        </div>
      )}
    </nav>
  );
}
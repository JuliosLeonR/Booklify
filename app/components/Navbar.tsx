import { Form, Link } from "@remix-run/react";
import { useState } from "react";

type User = {
    profile_picture: string;
    name: string;
};

export default function Navbar({ user }: { user: User }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-lg font-semibold">
                    Booklify
                </Link>
                <div className="relative">
                    <button onClick={() => setIsOpen(!isOpen)} className="flex items-center focus:outline-none">
                        <img
                            src={`http://localhost/storage/${user.profile_picture}`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full"
                        />
                    </button>
                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                            <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
                                Profile
                            </Link>
                            <Form method="post" action="/logout">
                                <button type="submit" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200">
                                    Logout
                                </button>
                            </Form>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
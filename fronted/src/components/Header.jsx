import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User, BarChart, Menu, ChevronDown, Upload } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { userLogout } from "@/Redux/slice/authSlice";
import { toast } from 'react-hot-toast';

export default function Header() {
    const navigate = useNavigate();
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const dispatch = useDispatch();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            dispatch(userLogout());
            toast.success("Successfully logged out");
        } catch (error) {
            console.log(error.message);
        }
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        localStorage.removeItem("voterId");
        localStorage.removeItem("voted");
        navigate("/auth/login");
    };

    const goToProfile = () => {
        navigate("/profile")
    };

    return (
        <header className="shadow sticky z-50 top-0 bg-white">
            <nav className="border-gray-200 px-4 lg:px-6 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center">
                    <img src="/logo.png" className="mr-3 h-12" alt="Logo" />
                </Link>


                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="lg:hidden text-gray-700"
                >
                    <Menu className="h-6 w-6" />
                </button>


                <div className="hidden lg:flex items-center space-x-6">
                    <ul className="flex space-x-6 font-medium">
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `py-2 px-3 ${isActive ? "text-orange-700" : "text-gray-700"} hover:text-orange-700`
                                }
                            >
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/results"
                                className={({ isActive }) =>
                                    `py-2 px-3 ${isActive ? "text-orange-700" : "text-gray-700"} hover:text-orange-700`
                                }
                            >
                                <BarChart className="h-4 w-4 inline-block mr-1" />
                                Results
                            </NavLink>
                        </li>
                        {role === "voter" && (
                            <>
                                <li>
                                    <NavLink
                                        to="/dashboard"
                                        className={({ isActive }) =>
                                            `py-2 px-3 ${isActive ? "text-orange-700" : "text-gray-700"} hover:text-orange-700`
                                        }
                                    >
                                        Dashboard
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/elections"
                                        className={({ isActive }) =>
                                            `py-2 px-3 ${isActive ? "text-orange-700" : "text-gray-700"} hover:text-orange-700`
                                        }
                                    >
                                        Elections
                                    </NavLink>
                                </li>
                            </>
                        )}
                        {role === "admin" && (
                            <li>
                                <NavLink
                                    to="/createelection"
                                    className={({ isActive }) =>
                                        `py-2 px-3 ${isActive ? "text-orange-700" : "text-gray-700"} hover:text-orange-700`
                                    }
                                >
                                    Create Election
                                </NavLink>
                            </li>
                        )}
                        {role === "admin" && (
                            <>
                            <li>
                                <NavLink
                                    to="/addcandidates"
                                    className="text-gray-700 hover:text-orange-700"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Add Candidates
                                </NavLink>
                            </li>
                                <li>
                                <NavLink
                                    to="/approve-voters"
                                    className="text-gray-700 hover:text-orange-700"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Approve voters
                                </NavLink>
                            </li>
                            </>
                            

                        )}
                    </ul>


                    {email ? (
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="ml-4 flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-gray-600"
                            >
                                <User className="h-4 w-4 mr-2" />
                                {email}
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </button>
                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md">
                                    <button
                                        onClick={goToProfile}
                                        className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                                    >
                                        <User className="h-4 w-4 mr-2 inline-block" />
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleSignOut}
                                        className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                                    >
                                        <LogOut className="h-4 w-4 mr-2 inline-block" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/auth/login"
                            className="flex items-center text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-lg"
                        >
                            <User className="h-4 w-4 mr-2" />
                            Login
                        </Link>
                    )}
                </div>
            </nav>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="lg:hidden bg-white border-t py-4">
                    <ul className="flex flex-col items-center space-y-4">
                        <li>
                            <NavLink
                                to="/"
                                className="text-gray-700 hover:text-orange-700"
                                onClick={() => setMenuOpen(false)}
                            >
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/results"
                                className="text-gray-700 hover:text-orange-700"
                                onClick={() => setMenuOpen(false)}
                            >
                                <BarChart className="h-4 w-4 inline-block mr-1" />
                                Results
                            </NavLink>
                        </li>
                        {role === "voter" && (
                            <>
                                <li>
                                    <NavLink
                                        to="/dashboard"
                                        className="text-gray-700 hover:text-orange-700"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Dashboard
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/elections"
                                        className="text-gray-700 hover:text-orange-700"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Elections
                                    </NavLink>
                                </li>
                            </>
                        )}
                        {role === "admin" && (
                            <li>
                                <NavLink
                                    to="/createelection"
                                    className="text-gray-700 hover:text-orange-700"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Create Election
                                </NavLink>
                            </li>
                        )}

                        {role === "admin" && (
                            <li>
                                <NavLink
                                    to="/addcandidates"
                                    className="text-gray-700 hover:text-orange-700"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Add Candidates
                                </NavLink>
                            </li>
                        )}
                        <li>
                            {email ? (
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setMenuOpen(false);
                                    }}
                                    className="text-gray-700 hover:text-orange-700"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <Link
                                    to="/auth/login"
                                    className="text-gray-700 hover:text-orange-700"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            )}
        </header>
    );
}

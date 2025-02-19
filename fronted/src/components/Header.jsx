import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User, BarChart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import {userLogout} from"@/Redux/slice/authSlice"
import { toast } from 'react-hot-toast';
export default function Header() {
    const navigate = useNavigate();
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const dispatch=useDispatch()

    const handleSignOut = async () => {
        
        try{
            dispatch(userLogout())
            toast.success("successfully logged out")
        }
        catch(error){
            console.log(error.message)
        }
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        navigate("/auth/login");
    };
    if (!email) {
        return (
            <header className="shadow sticky z-50 top-0">
                <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
                    <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                        <Link to="/" className="flex items-center">
                            <img
                                src="/logo.png"
                                className="mr-3  h-20"
                                alt="Logo"
                            />
                        </Link>
                        <div className="flex items-center lg:order-2">
                            <Link
                                to="/auth/login"
                                className="text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
                            >
                                <User className="h-4 w-4 mr-2" />
                                Login
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>
        );
    }

    return (
        <header className="shadow sticky z-50 top-0">
            <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                    <Link to="/" className="flex items-center">
                        <img
                            src="/logo.png"
                            className="mr-3 h-12"
                            alt="Logo"
                        />
                    </Link>
                    <div className="flex items-center lg:order-2">
                        {/* Sign out button if logged in */}
                        <button
                            onClick={handleSignOut}
                            className="ml-4 flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-gray-600"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </button>
                    </div>
                    <div
                        className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
                        id="mobile-menu-2"
                    >
                        <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                            {/* Always visible links */}
                            <li>
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-gray-700"} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                                    }
                                >
                                    Home
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) =>
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-gray-700"} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                                    }
                                >
                                    Dashboard
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/results"
                                    className={({ isActive }) =>
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-gray-700"} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                                    }
                                >
                                    <BarChart className="h-4 w-4 inline-block mr-1" />
                                    Results
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to="/elections"
                                    className={({ isActive }) =>
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-gray-700"} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                                    }
                                >
                                    Elections
                                </NavLink>
                            </li>

                            {/* Conditionally render "Create Election" only if role is "admin" */}
                            {role === "admin" && (
                                <li>
                                    <NavLink
                                        to="/createelection"
                                        className={({ isActive }) =>
                                            `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-gray-700"} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                                        }
                                    >
                                        Create Election
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

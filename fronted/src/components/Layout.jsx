import { Link, useNavigate } from 'react-router-dom';
import { Vote, LogOut, User } from 'lucide-react';

export function Layout({ children }) {
  const navigate = useNavigate();
  const user=localStorage.getItem("email")

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("email")
      localStorage.removeItem("role")
      navigate('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-blue shadow-2xl border-b-4 border-white">
      <nav className="shadow-sm pt-7px">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/"
                className="flex items-center px-2 py-2 text-white hover:text-gray-600"
              >
                <img className="mr-3 w-48" src="/logo.png" alt="E-mat" />
              </Link>
            </div>

            <div className="flex items-center">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-gray-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/elections"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-gray-600"
                  >
                    Elections
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="ml-4 flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:text-gray-600"
                  >
                    <LogOut className="h-auto w-auto mr-2 text-3xl" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className=" flex items-center px-3 py-2 rounded-md text-3xl font-medium text-white hover:text-gray-600"
                  >
                  <User className="text-3xl w-auto h-auto mr-2" />
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">{children}</main>
    </div>
  );
}
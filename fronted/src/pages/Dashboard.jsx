import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "@/Redux/slice/userSlice";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserDashboard() {
  const dispatch = useDispatch();

  const {
    name,
    user_id,
    role,
    email,
    voter_id,
    dob,
    gender,
    location,
    isLoading,
    isError,
  } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserData())
      .unwrap()
      .then((data) => console.log("User Data:", data))
      .catch((err) => console.log("Error:", err));
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState("");
  const [elections, setElections] = useState([
    { id: 1, name: "Mayoral Election", date: "2024-09-15" },
    { id: 2, name: "City Council Election", date: "2024-10-10" },
    { id: 3, name: "Presidential Election", date: "2024-11-03" },
  ]);

  const filteredElections = elections.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex justify-center py-6 px-4 w-full bg-gray-900">
      <div className="w-full max-w-4xl text-white">
        {/* User Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center bg-gray-800 p-6 rounded-lg shadow-lg mb-6"
        >
          <div>
            {isLoading ? (
              <p>Loading user data...</p>
            ) : isError ? (
              <p className="text-red-500">Error loading user data</p>
            ) : (
              <>
                <h1 className="text-3xl font-bold">Welcome, {name}!</h1>
                <p className="text-gray-400">User ID: {user_id}</p>
                <p className="text-gray-400">Role: {role}</p>
                <p className="text-gray-400">Voter ID: {voter_id}</p>
                <p className="text-gray-400">Location: {location}</p>
                <p className="text-gray-400">Email: {email}</p>
                <p className="text-gray-400">Date of Birth: {dob}</p>
                <p className="text-gray-400">Gender: {gender}</p>
              </>
            )}
          </div>
          <Bell className="w-6 h-6 cursor-pointer" />
        </motion.div>

        {/* Quick Actions */}
        <div className="flex space-x-6 mb-6">
          <div className="bg-gray-800 hover:bg-gray-700 transition-all rounded-lg p-6 flex-1">
            <h2 className="text-xl font-semibold">View Elections</h2>
            <p className="text-gray-400">Check elections in your area.</p>
            <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">
            <Link to="/elections">Go</Link>
            </Button>
          </div>
          <div className="bg-gray-800 hover:bg-gray-700 transition-all rounded-lg p-6 flex-1">
            <h2 className="text-xl font-semibold">View Results</h2>
            <p className="text-gray-400">
              See past and current election results.
            </p>
            <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">
            <Link to="/results">Go</Link>
            </Button>
          </div>
        </div>

       
      </div>
    </div>
  );
}

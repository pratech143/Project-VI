import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";

export default function UserDashboard() {
  const user = {
    name: "Harry",
    location: "New York, USA",
    role: "Voter",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [elections, setElections] = useState([
    { id: 1, name: "Mayoral Election", date: "2024-09-15" },
    { id: 2, name: "City Council Election", date: "2024-10-10" },
    { id: 3, name: "Presidential Election", date: "2024-11-03" },
  ]);

  const filteredElections = elections.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pieData = [
    { name: "Voted", value: 65 },
    { name: "Not Voted", value: 35 },
  ];
  const colors = ["#4CAF50", "#FF6384"];

  const barData = [
    { name: "2020", votes: 1500 },
    { name: "2022", votes: 1800 },
    { name: "2024", votes: 2200 },
  ];

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
            <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
            <p className="text-gray-400">Location: {user.location}</p>
            <p className="text-gray-400">Role: {user.role}</p>
          </div>
          <Bell className="w-6 h-6 cursor-pointer" />
        </motion.div>

        {/* Quick Actions */}
        <div className="flex space-x-6 mb-6">
          <div className="bg-gray-800 hover:bg-gray-700 transition-all rounded-lg p-6 flex-1">
            <h2 className="text-xl font-semibold">View Elections</h2>
            <p className="text-gray-400">Check elections in your area.</p>
            <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">Go</Button>
          </div>
          <div className="bg-gray-800 hover:bg-gray-700 transition-all rounded-lg p-6 flex-1">
            <h2 className="text-xl font-semibold">View Results</h2>
            <p className="text-gray-400">See past and current election results.</p>
            <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">Go</Button>
          </div>
        </div>

        {/* Upcoming Elections with Search */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Elections</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search elections..."
                className="bg-gray-700 pl-10 pr-3 py-2 rounded-lg text-white w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ul className="space-y-2">
            {filteredElections.map((election) => (
              <li key={election.id} className="bg-gray-700 p-3 rounded-lg">
                {election.name} - {election.date}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats Section */}
        <div className="flex space-x-6">
          <div className="bg-gray-800 rounded-lg p-6 flex-1">
            <h2 className="text-xl font-semibold text-center">Voter Turnout</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 flex-1">
            <h2 className="text-xl font-semibold text-center">Voting Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Bar dataKey="votes" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

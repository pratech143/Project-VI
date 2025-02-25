import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import baseApi from "@/api/baseApi";

// Helper function to validate base64 strings
const isValidBase64 = (str) => {
  if (!str || typeof str !== "string") return false;
  if (str.startsWith("{") || str.startsWith("[")) return false;
  try {
    const base64regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
    return base64regex.test(str);
  } catch (e) {
    return false;
  }
};

export default function AdminVoterApproval() {
  const [voters, setVoters] = useState([]);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch pending voters on component mount
  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const response = await baseApi.get("admin/fetch_unverified.php");
        setVoters(response.data.pending_voters || []);
      } catch (error) {
        console.error("Error fetching voters:", error);
      }
    };
    fetchVoters();
  }, []);

  // Debug voter selection
  useEffect(() => {
    if (selectedVoter) {
      console.log("Selected Voter Data:", selectedVoter);
      console.log("Voter ID Image:", selectedVoter.voter_id_image);
      console.log("Is Valid Base64:", isValidBase64(selectedVoter.voter_id_image));
    }
  }, [selectedVoter]);

  // Calculate age from DOB
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle voter approval/rejection
  const handleVoterAction = async (voterId, action) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await baseApi.post(
        "admin/approve_voter.php",
        { voter_id: voterId, action },
        { withCredentials: true }
      );
      setMessage({ text: response.data.message, type: "success" });
      setVoters((prevVoters) => prevVoters.filter((v) => v.voter_id !== voterId));
      setSelectedVoter(null);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Error processing request",
        type: "error",
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side: Voter List */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-1/3 bg-white p-6 shadow-lg rounded-r-2xl overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-blue-500">📋</span> Pending Voters
        </h2>
        {voters.length === 0 ? (
          <p className="text-gray-500 italic">No pending voters</p>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence>
              {voters.map((voter) => (
                <motion.li
                  key={voter.voter_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedVoter(voter)}
                  className="cursor-pointer p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-blue-50 hover:shadow-md transition-all duration-200 border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-800 font-medium">{voter.voter_name}</span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>

      {/* Right Side: Voter Details & Actions */}
      <div className="w-2/3 p-8">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-3 rounded-lg text-white ${
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {selectedVoter ? (
            <motion.div
              key={selectedVoter.voter_id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="flex gap-8 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
                {/* Voter ID Image */}
                <motion.div
                  className="w-1/2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {selectedVoter.voter_id_image && isValidBase64(selectedVoter.voter_id_image) ? (
                    <img
                      src={`data:image/jpeg;base64,${selectedVoter.voter_id_image}`} // Adjust MIME type as needed
                      alt="Voter ID"
                      className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                      onError={(e) => {
                        console.error("Image failed to load:", selectedVoter.voter_id_image);
                        e.target.src = "/placeholder-id.png";
                      }}
                      onLoad={() => console.log("Image loaded successfully")}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                      No Valid ID Image Available
                    </div>
                  )}
                </motion.div>

                {/* Voter Details */}
                <div className="w-1/2">
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedVoter.voter_name}</h2>
                    <p className="text-gray-500 text-sm">Voter ID: {selectedVoter.voter_id}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-700">
                      <strong>Age:</strong> {calculateAge(selectedVoter.dob)}
                    </p>
                    <p className="text-gray-700">
                      <strong>Email:</strong> {selectedVoter.email}
                    </p>
                    <p className="text-gray-700">
                      <strong>Address:</strong> Ward {selectedVoter.ward}, {selectedVoter.location_name}, {selectedVoter.district_name}
                    </p>
                    <p className="text-gray-700">
                      <strong>Status:</strong>
                      <span className="text-yellow-600 font-medium"> Pending Approval</span>
                    </p>

                    {/* Approve & Reject Buttons */}
                    <div className="mt-6 flex gap-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleVoterAction(selectedVoter.voter_id, "approve")}
                          disabled={loading}
                          className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {loading ? "Processing..." : "Approve"}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleVoterAction(selectedVoter.voter_id, "reject")}
                          disabled={loading}
                          className={`bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {loading ? "Processing..." : "Reject"}
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-500 text-lg italic flex items-center justify-center h-full"
            >
              Select a voter to view details
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
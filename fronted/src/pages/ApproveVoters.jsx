import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { handleVoterAction, setSelectedVoter } from "../Redux/slice/voterSlice";

export default function AdminVoterApproval() {
  const dispatch = useDispatch();
  const { voters, selectedVoter, loading, message } = useSelector(
    (state) => state.voters
  );

  const handleApprove = (voterId) => {
    dispatch(handleVoterAction({ voterId, action: "approve" }));
  };

  const handleReject = (voterId) => {
    dispatch(handleVoterAction({ voterId, action: "reject" }));
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
                  onClick={() => dispatch(setSelectedVoter(voter))}
                  className="cursor-pointer p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-blue-50 hover:shadow-md transition-all duration-200 border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-800 font-medium">{voter.name}</span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>

      {/* Right Side: Voter Details & Image */}
      <div className="w-2/3 p-8">
        {/* Feedback Message */}
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
                {/* Left: Voter ID Image */}
                <motion.div
                  className="w-1/2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={selectedVoter.id_card_url}
                    alt="Voter ID"
                    className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                  />
                </motion.div>

                {/* Right: Voter Details */}
                <div className="w-1/2">
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedVoter.name}</h2>
                    <p className="text-gray-500 text-sm">Voter ID: {selectedVoter.voter_id}</p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-gray-700">
                      <strong className="text-gray-900">Age:</strong> {selectedVoter.age}
                    </p>
                    <p className="text-gray-700">
                      <strong className="text-gray-900">Email:</strong> {selectedVoter.email}
                    </p>
                    <p className="text-gray-700">
                      <strong className="text-gray-900">Address:</strong> {selectedVoter.address}
                    </p>
                    <p className="text-gray-700">
                      <strong className="text-gray-900">Status:</strong>
                      <span className="text-yellow-600 font-medium"> Pending Approval</span>
                    </p>

                    {/* Approve & Reject Buttons */}
                    <div className="mt-6 flex gap-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleApprove(selectedVoter.voter_id)}
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
                          onClick={() => handleReject(selectedVoter.voter_id)}
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
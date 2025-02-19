import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchElections } from "../Redux/slice/electionSlice";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Vote,
  MapPin,
  Calendar,
  Users,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export function Elections() {
  const dispatch = useDispatch();
  const [voterId, setVoterId] = useState(localStorage.getItem("voterId"));
  const { elections } = useSelector((state) => state.election);
  const [expandedPost, setExpandedPost] = useState(null);
  const role=localStorage.getItem("role")

  useEffect(() => {
    if (voterId) {
      dispatch(fetchElections({ voter_id: voterId }));
    }
  }, [dispatch, voterId]);

  const toggleExpand = (post) => {
    setExpandedPost(expandedPost === post ? null : post);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Active Elections</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          View and participate in current elections. Your vote matters.
        </p>
      </motion.div>
      <AnimatePresence>
        {elections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {elections.map((election) => (
              <motion.div
                key={election.election_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 w-full">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white flex justify-between items-center">
                      {election.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dispatch(fetchElections({ voter_id: voterId }))}
                      >
                        <RefreshCcw className="w-4 h-4 text-gray-400 hover:text-white" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-gray-300">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-indigo-400" />
                        <span>{election.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-indigo-400" />
                        <span>Ward {election.ward}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-300 mt-4">
                      <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                      <span>
                        {format(new Date(election.start_date), "PPP")} -{" "}
                        {format(new Date(election.end_date), "PPP")}
                      </span>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Award className="w-5 h-5 mr-2 text-indigo-400" />{" "}
                        Candidates
                      </h3>
                      <div className="mt-4 space-y-2">
                        {Object.keys(election.candidates).map((post) => (
                          <div
                            key={post}
                            className="bg-gray-700/30 rounded-lg p-4"
                          >
                            <button
                              onClick={() => toggleExpand(post)}
                              className="flex justify-between w-full text-left text-indigo-400 font-medium"
                            >
                              {post}
                              {expandedPost === post ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                            <AnimatePresence>
                              {expandedPost === post && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2"
                                >
                                  {election.candidates[post].length > 0 ? (
                                    <div className="space-y-2">
                                      {election.candidates[post].map(
                                        (candidate) => (
                                          <div
                                            key={candidate.candidate_id}
                                            className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors"
                                          >
                                            <div>
                                              <p className="text-white font-medium">
                                                {candidate.candidate_name}
                                              </p>
                                              <p className="text-gray-400 text-sm">
                                                {candidate.party_name}
                                              </p>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-400 italic mt-2">
                                      No candidates registered
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-700 pt-4 flex justify-between">
                  {(role!=="admin")&&
                      <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
                        disabled={election.status.toLowerCase() !== "ongoing"}
                      >
                      <Link to="/votingpage">  <Vote className="w-4 h-4 mr-2" /> Cast Vote    </Link>
                      </Button>}
                
                    <span className="text-sm text-gray-400">
                      {election.status.toLowerCase() === "ongoing"
                        ? "Voting is open"
                        : election.status.toLowerCase() === "upcoming"
                        ? "Coming soon"
                        : "Voting ended"}
                    </span>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <h3 className="text-xl font-semibold text-white mb-2">No Active Elections</h3>
            <p className="text-gray-400 mb-6">There are currently no elections available for voting.</p>
            <Button onClick={() => dispatch(fetchElections({ voter_id: voterId }))} className="bg-indigo-600 hover:bg-indigo-700">
              <RefreshCcw className="w-4 h-4 mr-2" /> Check Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
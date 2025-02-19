import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchElections } from "../Redux/slice/electionSlice";
import { submitVotes } from "../Redux/slice/votesSlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Vote, ChevronRight, ChevronLeft, AlertCircle, Check, User, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const VotingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const voter_id = localStorage.getItem("voterId");

  const {
    elections,
    isLoading: electionLoading,
    isError: electionError,
    errorMessage: electionErrorMessage,
  } = useSelector((state) => state.election);

  const {
    isLoading: voteLoading,
    isError: voteError,
    errorMessage: voteErrorMessage,
    successful_votes,
  } = useSelector((state) => state.votes);

  const [selectedVotes, setSelectedVotes] = useState({});
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [votingComplete, setVotingComplete] = useState(false);

  useEffect(() => {
    if (voter_id) {
      dispatch(fetchElections({ voter_id }));
    }
  }, [dispatch, voter_id]);

  useEffect(() => {
    if (successful_votes && successful_votes.length > 0) {
      navigate("/thank-you");
    }
  }, [successful_votes, navigate]);


  

  if (!elections || elections.length === 0 || !elections[0].candidates) {
    return null;
  }


  const posts = Object.keys(elections[0].candidates);
  const currentPost = posts[currentPostIndex];
  const candidates = elections[0].candidates[currentPost];

  const handleSelectCandidate = (post, candidateId) => {
    setSelectedVotes((prev) => ({ ...prev, [post]: candidateId }));
  };

  const handleNext = () => {
    if (currentPostIndex < posts.length - 1) {
      setCurrentPostIndex(prev => prev + 1);
    } else {
      setVotingComplete(true);
      setShowConfirmation(true);
    }
  };

  const handlePrevious = () => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(prev => prev - 1);
    }
  };

  const handleVoteSubmit = () => {
    console.log("Submitting Votes...", new Date().toISOString());
    
  
    const votes = Object.keys(selectedVotes).map((post) => {
      const post_id = elections[0].candidates[post][0]?.post_id || 0;
      
      return {
        post_id,
        candidate_id: selectedVotes[post],
      };
    });
  
    console.log("Votes to Submit:", votes,);
    console.log(elections[0].election_id);
    console.log(voter_id);
    
  
    dispatch(submitVotes({ 
      voter_id, 
      election_id: elections[0].election_id, 
      votes 
    }));
  };
  
  const getSelectedCandidateName = (post) => {
    const candidateId = selectedVotes[post];
    const candidate = elections[0].candidates[post].find(c => c.candidate_id === candidateId);
    return candidate ? candidate.candidate_name : '';
  };

  if (electionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading election details...</p>
        </div>
      </div>
    );
  }

  if (electionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-md">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error Loading Election</h3>
          </div>
          <p className="text-gray-600">{electionErrorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Election Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Vote className="h-7 w-7 text-indigo-600" />
                {elections[0].name}
              </h1>
              <p className="text-gray-600 mt-2">{elections[0].description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{elections[0].location} - Ward {elections[0].ward}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(elections[0].start_date), 'PPP')} to{' '}
                    {format(new Date(elections[0].end_date), 'PPP')}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 px-4 py-2 rounded-lg">
              <p className="text-sm font-medium text-indigo-600">
                Step {currentPostIndex + 1} of {posts.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Voting Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPost}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Select your candidate for {currentPost}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((candidate) => (
                <motion.div
                  key={candidate.candidate_id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <label className="relative block cursor-pointer">
                    <input
                      type="radio"
                      name={currentPost}
                      value={candidate.candidate_id}
                      onChange={() => handleSelectCandidate(currentPost, candidate.candidate_id)}
                      checked={selectedVotes[currentPost] === candidate.candidate_id}
                      className="sr-only"
                    />
                    <div className={`
                      p-6 rounded-lg border-2 transition-all duration-200
                      ${selectedVotes[currentPost] === candidate.candidate_id 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'}
                    `}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-gray-500" />
                            {candidate.candidate_name}
                          </h3>
                          <p className="text-gray-600 mt-1">{candidate.party_name}</p>
                        </div>
                        {selectedVotes[currentPost] === candidate.candidate_id && (
                          <div className="bg-indigo-600 text-white p-1 rounded-full">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentPostIndex === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedVotes[currentPost]}
                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              >
                {currentPostIndex === posts.length - 1 ? 'Review Votes' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Vote className="h-5 w-5 text-indigo-600" />
                Confirm Your Votes
              </DialogTitle>
              <DialogDescription>
                Please review your selections before submitting your vote.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              {posts.map((post) => (
                <div key={post} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{post}</h4>
                  <p className="text-indigo-600 mt-1">{getSelectedCandidateName(post)}</p>
                </div>
              ))}
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="mr-2"
              >
                Review Choices
              </Button>
              <Button
                onClick={handleVoteSubmit}
                disabled={voteLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {voteLoading ? "Submitting..." : "Confirm & Submit Vote"}
              </Button>
            </DialogFooter>

            {voteError && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">{voteErrorMessage}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VotingPage;
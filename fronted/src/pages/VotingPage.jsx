import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchElections } from "../Redux/slice/electionSlice";
import { submitVotes } from "../Redux/slice/votesSlice";
import { useNavigate } from "react-router-dom";

const VotingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get voter ID from localStorage
  const voter_id = localStorage.getItem("voterId");
  console.log("Voter ID:", voter_id);

  // Get elections and votes state from Redux
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

  // Local state to track selected candidates for each post
  const [selectedVotes, setSelectedVotes] = useState({});

  // Fetch elections on mount
  useEffect(() => {
    if (voter_id) {
      dispatch(fetchElections({ voter_id }));
    }
  }, [dispatch, voter_id]);

  // Handle candidate selection
  const handleSelectCandidate = (post, candidateId) => {
    setSelectedVotes((prev) => ({ ...prev, [post]: candidateId }));
  };

  // Submit votes
  const handleVoteSubmit = () => {
    console.log("Selected Votes:", selectedVotes);

    if (!elections || elections.length === 0) {
      alert("No elections found.");
      return;
    }

    // Construct votes array
    const votes = Object.keys(selectedVotes).map((post) => {
      const post_id = elections[0].candidates[post][0]?.post_id || 0;
      return {
        post_id,
        candidate_id: selectedVotes[post],
      };
    });

    console.log("Votes Payload:", votes);
    console.log("Election ID:", elections[0].election_id);
    console.log("Voter ID:", voter_id);

    // Dispatch vote submission
    dispatch(submitVotes({ voter_id, election_id: elections[0].election_id, votes }));
  };

  // Navigate to thank-you page if voting succeeded
  useEffect(() => {
    if (successful_votes && successful_votes.length > 0) {
      alert("Your vote was successfully submitted!");
      navigate("/thank-you");
    }
  }, [successful_votes, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-6">
        {electionLoading ? (
          <p className="text-center text-gray-500">Loading elections...</p>
        ) : electionError ? (
          <p className="text-center text-red-500">{electionErrorMessage}</p>
        ) : elections.length === 0 ? (
          <p className="text-center text-gray-500">No elections found.</p>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">{elections[0].name}</h1>
              <p className="text-gray-600">{elections[0].description}</p>
              <p className="text-gray-500">{elections[0].location} - Ward {elections[0].ward}</p>
              <p className="text-gray-500">
                Voting Period: {elections[0].start_date} to {elections[0].end_date}
              </p>
            </div>

            <div className="space-y-6">
              {elections[0].candidates &&
                Object.keys(elections[0].candidates).map((post) => (
                  <div key={post} className="border p-4 rounded-md">
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">{post}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {elections[0].candidates[post].map((candidate) => (
                        <label
                          key={candidate.candidate_id}
                          className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name={post}
                            value={candidate.candidate_id}
                            className="mr-2"
                            onChange={() =>
                              handleSelectCandidate(post, candidate.candidate_id)
                            }
                            checked={selectedVotes[post] === candidate.candidate_id}
                          />
                          <span className="text-gray-800">{candidate.candidate_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleVoteSubmit}
                disabled={voteLoading}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
              >
                {voteLoading ? "Submitting..." : "Submit Vote"}
              </button>
            </div>
            {voteError && (
              <p className="mt-4 text-center text-red-500">{voteErrorMessage}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VotingPage;

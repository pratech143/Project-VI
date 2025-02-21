import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchElectionResults } from "../Redux/slice/resultSlice";
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Award,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const ElectionResults = () => {
  const dispatch = useDispatch();
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showAllCandidates, setShowAllCandidates] = useState(false);

  const { elections, isLoading, isError, errorMessage } = useSelector(
    (state) => state.results
  );

  useEffect(() => {
    dispatch(fetchElectionResults());
  }, [dispatch]);

  useEffect(() => {
    if (elections.length > 0) {
      const firstElection = elections[0];
      setSelectedElection(firstElection);
      const firstResult = Object.values(firstElection.results)[0];
      setSelectedResult(firstResult);
    }
  }, [elections]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {errorMessage}</div>;
  }

  if (!selectedElection || !selectedResult) {
    return <div>No election data available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedElection.election_name} Results
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>{selectedElection.date || "TBD"}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{selectedElection.location || "TBD"}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>Status: {selectedElection.status || "TBD"}</span>
              </div>
            </div>

            <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
              {Object.values(selectedElection.results).map((result) => (
                <button
                  key={result.post_name}
                  onClick={() => setSelectedResult(result)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedResult === result
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {result.post_name}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Leading Candidates
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedResult.candidates.slice(0, 2).map((candidate) => (
                  <div
                    key={candidate.candidate_id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4"
                    style={{ borderLeftColor: candidate.color }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {candidate.candidate_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {candidate.party_name}
                    </p>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {candidate.vote_count}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">votes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remaining Candidates Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-gray-600" />
                All Candidates
              </h3>
              <div className="space-y-4">
                {selectedResult.candidates
                  .slice(2, showAllCandidates ? undefined : 4)
                  .map((candidate) => (
                    <div
                      key={candidate.candidate_id}
                      className="bg-gray-50 rounded-lg shadow-md p-4 flex justify-between items-center border border-gray-200"
                    >
                      <div>
                        <h3 className="text-md font-medium text-gray-900">
                          {candidate.candidate_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {candidate.party_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {candidate.vote_count}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          votes
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              {selectedResult.candidates.length > 4 && (
                <button
                  onClick={() => setShowAllCandidates(!showAllCandidates)}
                  className="mt-4 flex items-center text-indigo-600 hover:underline"
                >
                  {showAllCandidates ? (
                    <>
                      Show Less <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show All Candidates{" "}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Elections
            </h3>
            <div className="space-y-4">
              {elections.map((election) => (
                <button
                  key={election.election_name}
                  onClick={() => setSelectedElection(election)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedElection.election_id === election.election_id
                      ? "bg-indigo-50 border border-indigo-200"
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {election.election_name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {election.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionResults;

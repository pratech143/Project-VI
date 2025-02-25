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
  AlertCircle,
  UserCheck,
  Vote,
  Info
} from "lucide-react";

const ElectionResults = () => {
  const dispatch = useDispatch();
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showAllCandidates, setShowAllCandidates] = useState(true);
  const [view, setView] = useState('all'); // 'all' or 'voted'

  const { elections, isLoading, isError, errorMessage } = useSelector(
    (state) => state.results
  );

  useEffect(() => {
    dispatch(fetchElectionResults());
  }, [dispatch]);

  useEffect(() => {
    if (elections?.length > 0) {
      const validElection = elections.find(
        (election) =>
          election.results &&
          ((Array.isArray(election.results) && election.results.length > 0) ||
            (typeof election.results === "object" && Object.keys(election.results).length > 0))
      );

      if (validElection) {
        setSelectedElection(validElection);
        const firstResult = Array.isArray(validElection.results)
          ? validElection.results[0]
          : Object.values(validElection.results)[0];
        setSelectedResult(firstResult);
      }
    }
  }, [elections]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading election results...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-indigo-500 mx-auto" />
          <h1 className="text-4xl font-bold text-gray-900">No Votes Cast Yet</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            The voting process hasn't started or no votes have been recorded. 
            Check back later to see the results.
          </p>
        </div>
      </div>
    );
  }

  if (!elections?.length || !selectedElection || !selectedResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Info className="w-16 h-16 text-indigo-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">No Results Available</h2>
          <p className="text-gray-600">Please check back later for election results.</p>
        </div>
      </div>
    );
  }

  const noVotesCast = selectedResult.candidates.every(candidate => candidate.vote_count === 0);
  const votedCandidates = selectedResult.candidates.filter(candidate => candidate.vote_count > 0);
  const nonVotedCandidates = selectedResult.candidates.filter(candidate => candidate.vote_count === 0);

  const displayCandidates = view === 'all' ? selectedResult.candidates : 
    view === 'voted' ? votedCandidates : nonVotedCandidates;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedElection.election_name}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedElection.status === 'Active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedElection.status || "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <span className="text-gray-700">{selectedElection.date || "TBD"}</span>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                <MapPin className="h-5 w-5 text-indigo-500" />
                <span className="text-gray-700">{selectedElection.location || "TBD"}</span>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                <Users className="h-5 w-5 text-indigo-500" />
                <span className="text-gray-700">Total Candidates: {selectedResult.candidates.length}</span>
              </div>
            </div>

            <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
              {Object.values(selectedElection.results).map((result) => (
                <button
                  key={result.post_name}
                  onClick={() => setSelectedResult(result)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                    selectedResult === result
                      ? "bg-indigo-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {result.post_name}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-indigo-500" />
                  Candidates
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setView('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      view === 'all' 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setView('voted')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      view === 'voted'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    With Votes
                  </button>
                  <button
                    onClick={() => setView('nonVoted')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      view === 'nonVoted'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    No Votes
                  </button>
                </div>
              </div>

              {noVotesCast ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-xl font-medium text-gray-900 mb-2">No Votes Cast Yet</h4>
                  <p className="text-gray-500">Voting hasn't started or no votes have been recorded.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {displayCandidates.map((candidate) => (
                    <div
                      key={candidate.candidate_id}
                      className="bg-white rounded-lg shadow-md p-6 border-l-4 transform transition-all hover:scale-102 hover:shadow-lg"
                      style={{ borderLeftColor: candidate.color || '#6366F1' }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {candidate.candidate_name}
                          </h3>
                          <p className="text-sm text-gray-500">{candidate.party_name}</p>
                        </div>
                        {candidate.vote_count > 0 && (
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Rank #{votedCandidates.indexOf(candidate) + 1}
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-900">
                            {candidate.vote_count}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">votes</span>
                        </div>
                        {candidate.vote_count > 0 && (
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{
                                width: `${(candidate.vote_count / Math.max(...selectedResult.candidates.map(c => c.vote_count))) * 100}%`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              All Elections
            </h3>
            <div className="space-y-4">
              {elections.map((election) => (
                <button
                  key={election.election_id}
                  onClick={() => setSelectedElection(election)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedElection?.election_id === election.election_id
                      ? "bg-indigo-50 border-2 border-indigo-200 shadow-md"
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
                    <ChevronRight className={`h-5 w-5 transition-transform ${
                      selectedElection?.election_id === election.election_id ? 'transform rotate-90' : ''
                    }`} />
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
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchElectionResults } from '../Redux/slice/resultSlice';  // Adjust path as necessary
import { Calendar, MapPin, Users, ChevronRight, Award, Trophy } from 'lucide-react';

const ElectionResults = () => {
  const dispatch = useDispatch();
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  // Get election data from Redux store
  const { elections, isLoading, isError, errorMessage } = useSelector((state) => state.results);
  console.log(elections)

  useEffect(() => {
    dispatch(fetchElectionResults());
  }, [dispatch]);

  // Set default selection when elections data is loaded
  useEffect(() => {
    if (elections.length > 0) {
      // Set the first election as the default
      const firstElection = elections[0];
      setSelectedElection(firstElection);

      // Extract the first result using Object.values()
      const firstResult = Object.values(firstElection.results)[0]; // Convert results object to array and get the first result
      setSelectedResult(firstResult); // Set the first result as default
    }
  }, [elections]);

  // Loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Error state
  if (isError) {
    return <div>Error: {errorMessage}</div>;
  }

  // Ensure election and result data exists before rendering
  if (!selectedElection || !selectedResult) {
    return <div>No election data available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedElection.election_name} Results
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>{selectedElection.date || 'TBD'}</span> {/* Adjust date formatting as needed */}
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{selectedElection.location || 'TBD'}</span> {/* Adjust location formatting */}
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>{selectedElection.turnout || 'TBD'}% Turnout</span>
              </div>
            </div>

            {/* Post Selection (Results Navigation) */}
            <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
              {Object.keys(selectedElection.results).map((key) => {
                const result = selectedElection.results[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedResult(result)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedResult === result ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {result.name} {/* Assuming each result has a 'name' */}
                  </button>
                );
              })}
            </div>

            {/* Top Candidates Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Leading Candidates
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedResult.candidates.slice(0, 2).map((candidate, index) => (
                  <div key={candidate.id} className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: candidate.color }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-500">{candidate.party}</p>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-gray-900">{candidate.votes}</span>
                          <span className="text-sm text-gray-500 ml-1">votes</span>
                        </div>
                      </div>
                      {index <= 1 && (
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
                          <Trophy className={`w-6 h-6 ${index === 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Elections List (Sidebar) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Elections</h3>
            <div className="space-y-4">
              {elections.map((election) => (
                <button
                  key={election.election_id}
                  onClick={() => setSelectedElection(election)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedElection.election_id === election.election_id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{election.election_name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{election.description}</p>
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

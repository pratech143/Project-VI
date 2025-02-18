import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchElections } from '../Redux/slice/electionSlice';
import { Button } from '../components/ui/button';

export function Elections() {
  const dispatch = useDispatch();

  // Access elections data and loading state from the Redux store
  const { elections, isLoading, isError, errorMessage } = useSelector(state => state.election);

  // Fetch elections when the component mounts
  useEffect(() => {
    const voter_id = localStorage.getItem("voterId");
    if (voter_id) {
      dispatch(fetchElections({ voter_id })); // Pass voter_id to fetchElections
    }
  }, [dispatch]);

  // Render loading state, error state, or the elections list
  if (isLoading) {
    return <div className="text-white">Loading elections...</div>;
  }

  if (isError) {
    return <div className="text-white">Error: {errorMessage}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Elections</h1>

      {/* Displaying fetched elections */}
      <div className="space-y-4">
        {elections.length > 0 ? (
          elections.map((election) => (
            <div key={election.election_id} className="border p-4 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold">{election.name}</h2>
              <p className="text-sm text-gray-300">{election.description}</p>
              <div className="mt-2">
                <strong>Location:</strong> {election.location}
              </div>
              <div className="mt-2">
                <strong>Ward:</strong> {election.ward}
              </div>
              <div className="mt-2">
                <strong>Status:</strong> {election.status}
              </div>
              <div className="mt-2">
                <strong>Start Date:</strong> {election.start_date}
              </div>
              <div className="mt-2">
                <strong>End Date:</strong> {election.end_date}
              </div>

              {/* Display candidates by post */}
              <div className="mt-4 space-y-4">
                {Object.keys(election.candidates).map((post) => (
                  <div key={post}>
                    <h3 className="font-semibold">{post}</h3>
                    <ul>
                      {election.candidates[post].length > 0 ? (
                        election.candidates[post].map((candidate) => (
                          <li key={candidate.candidate_id} className="pl-4">
                            {candidate.candidate_name} - {candidate.party_name}
                          </li>
                        ))
                      ) : (
                        <li>No candidates for this post</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No elections available.</p>
        )}
      </div>

      {/* If you want to trigger a refetch */}
      <Button onClick={() => dispatch(fetchElections())} className="mt-4">
        Refresh Elections
      </Button>
    </div>
  );
}

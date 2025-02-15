import { useState } from 'react';
import { toast } from 'react-hot-toast';

const mockElections = [
  {
    id: 1,
    name: 'Presidential Election 2024',
    description: 'National presidential election for the term 2024-2028',
    start_date: '2024-11-03',
    end_date: '2024-11-03',
    status: 'upcoming',
    candidates: [
      { id: 1, name: 'John Smith', party: 'Democratic Party' },
      { id: 2, name: 'Sarah Johnson', party: 'Republican Party' },
    ]
  },
  {
    id: 2,
    name: 'State Assembly Election',
    description: 'State legislative assembly election for all constituencies',
    start_date: '2024-06-15',
    end_date: '2024-06-15',
    status: 'upcoming',
    candidates: [
      { id: 3, name: 'Michael Brown', party: 'Democratic Party' },
      { id: 4, name: 'Emily Davis', party: 'Republican Party' },
    ]
  },
  {
    id: 3,
    name: 'Local Council Election',
    description: 'Election for local council representatives',
    start_date: '2024-03-20',
    end_date: '2024-03-20',
    status: 'ongoing',
    candidates: [
      { id: 5, name: 'David Wilson', party: 'Democratic Party' },
      { id: 6, name: 'Lisa Anderson', party: 'Republican Party' },
    ]
  }
];

export function Elections() {
  const [elections] = useState(mockElections);
  const [loading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState({});
  const user=true

  const handleVote = async (electionId, candidateId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSelectedCandidate(prev => ({
        ...prev,
        [electionId]: candidateId
      }));
      
      toast.success('Vote cast successfully!');
    } catch (error) {
      toast.error('Failed to cast vote');
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);

    if (now < startDate) {
      return 'Not started yet';
    } else if (now > endDate) {
      return 'Election ended';
    } else {
      return 'Ongoing';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Elections</h2>
        {elections.length === 0 ? (
          <p className="text-gray-600">No elections available at the moment.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {elections.map((election) => {
              const status = getElectionStatus(election);
              const isOngoing = status === 'Ongoing';
              const hasVoted = selectedCandidate[election.id];

              return (
                <div
                  key={election.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{election.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{election.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Starts: {new Date(election.start_date).toLocaleDateString()}</p>
                    <p>Ends: {new Date(election.end_date).toLocaleDateString()}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2 ${
                      status === 'Ongoing'
                        ? 'bg-green-100 text-green-800'
                        : status === 'Not started yet'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {status}
                    </span>
                  </div>

                  {isOngoing && !hasVoted && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Candidates:</h4>
                      <div className="space-y-2">
                        {election.candidates.map((candidate) => (
                          <button
                            key={candidate.id}
                            onClick={() => handleVote(election.id, candidate.id)}
                            className="w-full text-left px-3 py-2 rounded border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                          >
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-sm text-gray-500">{candidate.party}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasVoted && (
                    <div className="mt-4 p-3 bg-green-50 rounded-md">
                      <p className="text-green-700 text-sm">
                        You have cast your vote in this election.
                      </p>
                    </div>
                  )}

                  {!isOngoing && status === 'Not started yet' && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                      <p className="text-yellow-700 text-sm">
                        This election has not started yet. Please check back on {new Date(election.start_date).toLocaleDateString()}.
                      </p>
                    </div>
                  )}

                  {!isOngoing && status === 'Election ended' && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-gray-700 text-sm">
                        This election has ended. Results will be announced soon.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fetchElectionResults } from '../Redux/slice/resultSlice'; // Adjust this path accordingly

export function ElectionResults() {
  const dispatch = useDispatch();
  
  // Selecting the state from Redux
  const { elections, isLoading, isError, errorMessage } = useSelector((state) => state.results);
  
  // Local state for selected election and post
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    // You can replace `voter_id` with an actual value or prop from your app
    const voter_id = localStorage.getItem("voterId") // Example voter ID
    dispatch(fetchElectionResults(voter_id)); // Dispatch the action to fetch data
  }, [dispatch]);

  useEffect(() => {
    if (elections.length > 0) {
      setSelectedElection(elections[0]); // Set the first election as the selected election
      setSelectedPost(elections[0]?.posts[0]); // Set the first post as the selected post
    }
  }, [elections]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {errorMessage}</div>;
  }

  if (!selectedElection || !selectedPost) {
    return <div>No election data available</div>;
  }

  // The rest of the code remains the same as the original component, rendering election data.
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedElection.name} Results
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>{format(new Date(selectedElection.date), 'PPP')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{selectedElection.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>{selectedElection.turnout}% Turnout</span>
              </div>
            </div>

            {/* Post Selection */}
            <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
              {selectedElection.posts.map((post) => (
                <button
                  key={post.title}
                  onClick={() => setSelectedPost(post)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedPost.title === post.title
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {post.title}
                </button>
              ))}
            </div>

            {/* Top Candidates Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Leading Candidates
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedPost.candidates.slice(0, 2).map((candidate, index) => (
                  <div key={candidate.name} className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: candidate.color }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-500">{candidate.party}</p>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {(candidate.votes / 1000000).toFixed(1)}M
                          </span>
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

            {/* Additional sections (charts, vote distribution, etc.) */}
            {/* Your charts and other sections can be placed here, similar to the rest of your previous code */}
          </div>
        </div>

        {/* Elections List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Elections</h3>
            <div className="space-y-4">
              {elections.map((election) => (
                <button
                  key={election.id}
                  onClick={() => setSelectedElection(election)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedElection.id === election.id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{election.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{election.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(election.date), 'PP')}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {election.turnout}% Turnout
                        </span>
                      </div>
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
}

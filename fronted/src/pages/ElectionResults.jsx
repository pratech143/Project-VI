import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Registering ChartJS components
ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

const mockElections = [
  {
    id: 1,
    name: 'Presidential Election 2024',
    description: 'National presidential election for the term 2024-2028',
    posts: [
      { 
        name: 'Mayor', 
        candidates: ['Candidate A', 'Candidate B', 'Candidate C', 'Candidate D', 'Candidate E'], 
        votes: [60, 25, 10, 4, 1] 
      },
      { 
        name: 'Vice Mayor', 
        candidates: ['Candidate X', 'Candidate Y', 'Candidate Z', 'Candidate W', 'Candidate V'], 
        votes: [55, 30, 10, 3, 2] 
      },
    ],
    status: 'completed'
  },
  {
    id: 2,
    name: 'Mayoral Election 2025',
    description: 'Mayoral election for the year 2025 in City XYZ',
    posts: [
      { 
        name: 'Mayor', 
        candidates: ['Candidate 1', 'Candidate 2', 'Candidate 3', 'Candidate 4', 'Candidate 5'], 
        votes: [70, 15, 10, 3, 2] 
      },
      { 
        name: 'Secretary', 
        candidates: ['Candidate A', 'Candidate B', 'Candidate C', 'Candidate D', 'Candidate E'], 
        votes: [80, 12, 5, 2, 1] 
      },
    ],
    status: 'upcoming'
  }
];

export function ElectionResults() {
  const [elections, setElections] = useState(mockElections);
  const [selectedElection, setSelectedElection] = useState(mockElections[0]);
  const [showResults, setShowResults] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleElectionClick = (election) => {
    setSelectedElection(election);
    setShowResults(true);
  };

  // Filter elections based on search query
  const filteredElections = elections.filter((election) => 
    election.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    election.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to render Pie chart data for each post
  const renderChartData = (post) => {
    return {
      labels: post.candidates,
      datasets: [{
        data: post.votes,
        backgroundColor: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#6B7280'],
        borderColor: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#6B7280'],
        borderWidth: 1,
      }]
    };
  };

  // Helper function to render Bar chart data for top 5 candidates
  const renderBarChartData = (post) => {
    return {
      labels: post.candidates,
      datasets: [{
        label: 'Votes',
        data: post.votes,
        backgroundColor: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#6B7280'],
        borderColor: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#6B7280'],
        borderWidth: 1,
      }]
    };
  };

  // Function to render leading candidates with percentages and vote bars
  const renderLeadingCandidates = (post) => {
    const totalVotes = post.votes.reduce((a, b) => a + b, 0);
    const sortedCandidates = post.candidates
      .map((candidate, index) => ({ name: candidate, votes: post.votes[index] }))
      .sort((a, b) => b.votes - a.votes);
    
    return (
      <div className="mt-6 space-y-4">
        {sortedCandidates.map((candidate, index) => (
          <div key={index} className="flex justify-between items-center p-2 rounded-md"
            style={{
              backgroundColor: index === 0 ? '#34D399' : index === 1 ? '#FBBF24' : 'transparent',
            }}>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-white">{candidate.name}</span>
              <span className="text-sm text-gray-400">{candidate.votes} votes ({Math.round((candidate.votes / totalVotes) * 100)}%)</span>
            </div>
            <div className="w-1/2 ml-4 flex items-center">
              <div className="w-full h-2 rounded-full bg-gray-600">
                <div 
                  className="h-full"
                  style={{
                    width: `${(candidate.votes / totalVotes) * 100}%`,
                    backgroundColor: index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#6B7280',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Election Results</h1>
      </div>

      <div className="flex space-x-4 mb-6">
        <Button
          className={`${
            showResults ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
          } transition duration-300 ease-in-out transform hover:scale-105`}
          onClick={() => setShowResults(true)}
        >
          Results
        </Button>
        <Button
          className={`${
            !showResults ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
          } transition duration-300 ease-in-out transform hover:scale-105`}
          onClick={() => setShowResults(false)}
        >
          All Elections
        </Button>
      </div>

      {showResults ? (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="text-xl font-semibold">{selectedElection.name} Results</h2>
            <p className="text-sm text-gray-400">{selectedElection.description}</p>
          </div>

          {selectedElection.posts.map((post, index) => (
            <motion.div
              key={index}
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.3, duration: 0.6 }}
            >
              <h3 className="text-lg font-medium">{post.name}</h3>

              {/* Container for Pie chart and Bar chart */}
              <div className="flex space-x-8 justify-center items-center">
                <div className="w-1/2 flex flex-col items-center">
                  <Pie data={renderChartData(post)} options={{ responsive: true }} height={250} />
                  <p className="text-center mt-2 text-sm text-gray-400">Pie Chart: Vote Distribution</p>
                </div>

                <div className="w-1/2 flex flex-col items-center">
                  <Bar data={renderBarChartData(post)} options={{ responsive: true }} height={200} />
                  <p className="text-center mt-2 text-sm text-gray-400">Bar Chart: Votes per Candidate</p>
                </div>
              </div>

              {renderLeadingCandidates(post)}

            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl font-semibold">All Elections</h2>

          {/* Search input for filtering elections */}
          <div className="mb-4">
            <input
              type="text"
              className="w-1/4 px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search elections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {filteredElections.map((election) => (
              <motion.div
                key={election.id}
                className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleElectionClick(election)}
              >
                <h3 className="text-lg font-medium">{election.name}</h3>
                <p className="text-sm text-gray-400">{election.description}</p>
                <div className="mt-2">
                  <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => handleElectionClick(election)}>
                    View Results
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

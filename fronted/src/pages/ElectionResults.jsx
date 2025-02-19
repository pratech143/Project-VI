import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  Trophy,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';

// Enhanced mock data with more candidates
const mockElections = [
  {
    id: 1,
    name: 'Presidential Election 2024',
    description: 'National presidential election for the term 2024-2028',
    date: '2024-11-03',
    location: 'National',
    totalVoters: 150000000,
    turnout: 67,
    posts: [
      {
        title: 'President',
        candidates: [
          { name: 'John Smith', party: 'Democratic Party', votes: 42000000, color: '#0088FE', trend: [65, 68, 72, 75, 78] },
          { name: 'Sarah Johnson', party: 'Republican Party', votes: 38000000, color: '#FF8042', trend: [70, 65, 62, 60, 58] },
          { name: 'Michael Brown', party: 'Independent', votes: 12000000, color: '#00C49F', trend: [20, 22, 25, 23, 20] },
          { name: 'Elizabeth Wilson', party: 'Green Party', votes: 8000000, color: '#82ca9d', trend: [15, 18, 16, 14, 12] },
          { name: 'Robert Taylor', party: 'Libertarian Party', votes: 5000000, color: '#8884d8', trend: [10, 12, 11, 9, 8] }
        ]
      },
      {
        title: 'Vice President',
        candidates: [
          { name: 'Emily Davis', party: 'Democratic Party', votes: 41000000, color: '#0088FE', trend: [62, 65, 70, 73, 76] },
          { name: 'Robert Wilson', party: 'Republican Party', votes: 39000000, color: '#FF8042', trend: [68, 65, 60, 58, 55] },
          { name: 'Lisa Anderson', party: 'Independent', votes: 11000000, color: '#00C49F', trend: [22, 24, 22, 20, 18] },
          { name: 'James Martin', party: 'Green Party', votes: 7500000, color: '#82ca9d', trend: [16, 15, 14, 13, 12] },
          { name: 'Patricia Moore', party: 'Libertarian Party', votes: 4500000, color: '#8884d8', trend: [12, 11, 10, 9, 8] }
        ]
      }
    ]
  },
  // ... (other elections)
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const TopCandidateCard = ({ candidate, position, animate = true }) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={animate ? "hidden" : "visible"}
      animate="visible"
      variants={variants}
      transition={{ duration: 0.5, delay: position * 0.2 }}
      className="bg-white rounded-lg shadow-md p-6 border-l-4"
      style={{ borderLeftColor: candidate.color }}
    >
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
        {position <= 2 && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
            <Trophy className={`w-6 h-6 ${position === 1 ? 'text-yellow-500' : 'text-gray-400'}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export function ElectionResults() {
  const [selectedElection, setSelectedElection] = useState(mockElections[0]);
  const [selectedPost, setSelectedPost] = useState(mockElections[0].posts[0]);

  const handleElectionClick = (election) => {
    setSelectedElection(election);
    setSelectedPost(election.posts[0]);
  };

  const handlePostChange = (post) => {
    setSelectedPost(post);
  };

  // Sort candidates by votes
  const sortedCandidates = [...selectedPost.candidates].sort((a, b) => b.votes - a.votes);
  const topTwoCandidates = sortedCandidates.slice(0, 2);

  // Generate trend data
  const trendData = topTwoCandidates[0].trend.map((_, index) => ({
    name: `Week ${index + 1}`,
    [topTwoCandidates[0].name]: topTwoCandidates[0].trend[index],
    [topTwoCandidates[1].name]: topTwoCandidates[1].trend[index],
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
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
                <motion.button
                  key={post.title}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePostChange(post)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedPost.title === post.title
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {post.title}
                </motion.button>
              ))}
            </div>

            {/* Top Candidates Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Leading Candidates
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {sortedCandidates.slice(0, 2).map((candidate, index) => (
                  <TopCandidateCard key={candidate.name} candidate={candidate} position={index + 1} />
                ))}
              </div>
            </div>

            {/* Trend Chart for Top Two Candidates */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Polling Trends
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {topTwoCandidates.map((candidate, index) => (
                      <Area
                        key={candidate.name}
                        type="monotone"
                        dataKey={candidate.name}
                        stroke={candidate.color}
                        fill={candidate.color}
                        fillOpacity={0.3}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Vote Distribution Charts */}
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-500" />
                Vote Distribution
              </h3>
              
              {/* Bar Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedPost.candidates}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="#8884d8">
                      {selectedPost.candidates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={selectedPost.candidates}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="votes"
                    >
                      {selectedPost.candidates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Elections List */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Elections</h3>
            <div className="space-y-4">
              <AnimatePresence>
                {mockElections.map((election) => (
                  <motion.button
                    key={election.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleElectionClick(election)}
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
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
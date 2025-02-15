import { useState } from 'react';
import { toast } from 'react-hot-toast';

const mockPendingVoters = [
  {
    id: 1,
    email: 'john.doe@example.com',
    voter_id: 'VOT123456',
    created_at: '2024-02-20'
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    voter_id: 'VOT789012',
    created_at: '2024-02-21'
  }
];

export function AdminDashboard() {
  const [pendingVoters, setPendingVoters] = useState(mockPendingVoters);
  const [loading] = useState(false);

  const handleVerifyVoter = async (userId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPendingVoters((prev) => prev.filter((voter) => voter.id !== userId));
      toast.success('Voter verified successfully');
    } catch (error) {
      toast.error('Failed to verify voter');
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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Pending Voter Verifications</h3>
        {pendingVoters.length === 0 ? (
          <p className="text-gray-600">No pending verifications</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voter ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingVoters.map((voter) => (
                  <tr key={voter.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {voter.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {voter.voter_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(voter.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleVerifyVoter(voter.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
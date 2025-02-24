import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminVoterApproval() {
  // Mock data for pending voters
  const mockVoters = [
    {
      voter_id: 1,
      name: "John Doe",
      age: 30,
      email: "johndoe@gmail.com",
      address: "123 Main Street, NY",
      id_card_url: "https://via.placeholder.com/250x150?text=Voter+ID+Card",
    },
    {
      voter_id: 2,
      name: "Jane Smith",
      age: 27,
      email: "janesmith@gmail.com",
      address: "456 Elm Street, CA",
      id_card_url: "https://via.placeholder.com/250x150?text=Voter+ID+Card",
    },
    {
      voter_id: 3,
      name: "Michael Johnson",
      age: 35,
      email: "michaelj@gmail.com",
      address: "789 Oak Avenue, TX",
      id_card_url: "https://via.placeholder.com/250x150?text=Voter+ID+Card",
    },
  ];

  const [voters, setVoters] = useState(mockVoters);
  const [selectedVoter, setSelectedVoter] = useState(null);

  // Approve Voter (removes from list)
  const handleApprove = (voterId) => {
    setVoters(voters.filter((voter) => voter.voter_id !== voterId));
    setSelectedVoter(null);
  };

  // Reject Voter (removes from list)
  const handleReject = (voterId) => {
    setVoters(voters.filter((voter) => voter.voter_id !== voterId));
    setSelectedVoter(null);
  };

  return (
    <div className="flex h-screen">
      {/* Left Side: Voter List */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Pending Voters</h2>
        {voters.length === 0 ? (
          <p>No pending voters</p>
        ) : (
          <ul>
            {voters.map((voter) => (
              <li
                key={voter.voter_id}
                onClick={() => setSelectedVoter(voter)}
                className="cursor-pointer p-2 bg-white mb-2 shadow-md rounded-md hover:bg-gray-200"
              >
                {voter.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Side: Voter Details & Image */}
      <div className="w-2/3 p-6">
        {selectedVoter ? (
          <Card className="flex gap-6 p-4">
            {/* Left: Voter ID Image */}
            <div className="w-1/2">
              <img
                src={selectedVoter.id_card_url}
                alt="Voter ID"
                className="w-full h-auto rounded-md shadow-lg"
              />
            </div>

            {/* Right: Voter Details */}
            <div className="w-1/2">
              <CardHeader>
                <h2 className="text-xl font-semibold">{selectedVoter.name}</h2>
                <p className="text-gray-500">Voter ID: {selectedVoter.voter_id}</p>
              </CardHeader>

              <CardContent>
                <p><strong>Age:</strong> {selectedVoter.age}</p>
                <p><strong>Email:</strong> {selectedVoter.email}</p>
                <p><strong>Address:</strong> {selectedVoter.address}</p>
                <p><strong>Status:</strong> Pending Approval</p>

                {/* Approve & Reject Buttons */}
                <div className="mt-4 flex gap-4">
                  <Button
                    onClick={() => handleApprove(selectedVoter.voter_id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedVoter.voter_id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ) : (
          <p className="text-gray-500">Select a voter to view details</p>
        )}
      </div>
    </div>
  );
}

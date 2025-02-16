import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

const electionData = {
  name: 'Mayoral Election 2024',
  description: 'Vote for the next mayor of your city.',
  posts: [
    {
      name: 'Mayor',
      candidates: [
        { id: 1, name: 'Alice Johnson', party: 'Democratic', votes: 0 },
        { id: 2, name: 'Bob Smith', party: 'Republican', votes: 0 },
        { id: 3, name: 'Charlie Lee', party: 'Independent', votes: 0 },
        { id: 4, name: 'Daisy Wright', party: 'Green Party', votes: 0 },
        { id: 5, name: 'Ethan Brown', party: 'Libertarian', votes: 0 },
      ],
    },
    {
      name: 'Vice Mayor',
      candidates: [
        { id: 6, name: 'Fiona Adams', party: 'Democratic', votes: 0 },
        { id: 7, name: 'George Carter', party: 'Republican', votes: 0 },
        { id: 8, name: 'Hannah White', party: 'Independent', votes: 0 },
        { id: 9, name: 'Ian Moore', party: 'Green Party', votes: 0 },
        { id: 10, name: 'Jack Wilson', party: 'Libertarian', votes: 0 },
      ],
    },
  ],
};

export default function VotingPage() {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [password, setPassword] = useState('');

  const currentPost = electionData.posts[currentPostIndex];

  const handleVote = (candidateId) => {
    setSelectedVotes({ ...selectedVotes, [currentPost.name]: candidateId });
  };

  const handleNext = () => {
    if (currentPostIndex < electionData.posts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmVote = () => {
    if (!password) {
      toast.error('Please enter your password to confirm your vote.');
      return;
    }
    toast.success('Your vote has been successfully submitted!');
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold text-gray-900">{electionData.name}</h1>
      <p className="text-gray-600 mb-4">{electionData.description}</p>
      
      <h2 className="text-xl font-semibold text-gray-800">Vote for {currentPost.name}</h2>
      <div className="mt-4 space-y-2">
        {currentPost.candidates.map((candidate) => (
          <button
            key={candidate.id}
            className={`block w-full text-left p-3 rounded-lg border transition ${selectedVotes[currentPost.name] === candidate.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => handleVote(candidate.id)}
          >
            {candidate.name} ({candidate.party})
          </button>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleNext} disabled={!selectedVotes[currentPost.name]}>
          {currentPostIndex < electionData.posts.length - 1 ? 'Next' : 'Review & Submit'}
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(selectedVotes).map(([post, candidateId]) => {
              const candidate = electionData.posts.find(p => p.name === post).candidates.find(c => c.id === candidateId);
              return (
                <p key={post} className="text-gray-700">
                  <strong>{post}:</strong> {candidate.name} ({candidate.party})
                </p>
              );
            })}
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmVote}>Submit Vote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

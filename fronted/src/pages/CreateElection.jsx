import { useState } from 'react';
import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import { format } from 'date-fns';
import { Plus, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

// Mock data for elections
const mockElections = [
  {
    id: 1,
    name: 'Presidential Election 2024',
    description: 'National presidential election for the term 2024-2028',
    location_id: 'LOC001',
    district_id: 'DIST001',
    ward_id: 'WARD001',
    start_date: '2024-11-03',
    end_date: '2024-11-03',
    status: 'upcoming'
  }
];

// const formSchema = z.object({
//   name: z.string().min(3, 'Election name must be at least 3 characters'),
//   description: z.string().min(10, 'Description must be at least 10 characters'),
//   location_id: z.string().min(1, 'Location ID is required'),
//   district_id: z.string().min(1, 'District ID is required'),
//   ward_id: z.string().min(1, 'Ward ID is required'),
//   start_date: z.string().min(1, 'Start date is required'),
//   end_date: z.string().min(1, 'End date is required')
// });

export function CreateElection() {
  const [elections, setElections] = useState(mockElections);
  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [electionData, setElectionData] = useState(null);

  const form = useForm({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      location_id: '',
      district_id: '',
      ward_id: '',
      start_date: '',
      end_date: ''
    }
  });

  const handleCreateElection = async (data) => {
    setElectionData(data);
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    if (adminPassword !== 'admin123') { // In production, this should be a secure verification
      toast.error('Invalid admin password');
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newElection = {
        id: elections.length + 1,
        ...electionData,
        status: 'upcoming'
      };
      
      setElections(prev => [...prev, newElection]);
      setOpen(false);
      setShowConfirmation(false);
      setAdminPassword('');
      form.reset();
      toast.success('Election created successfully!');
    } catch (error) {
      toast.error('Failed to create election');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Elections</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Election
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={form.handleSubmit(handleCreateElection)}>
              <DialogHeader>
                <DialogTitle>Create New Election</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new election.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Election Name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Enter election name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    {...form.register('description')}
                    placeholder="Enter election description"
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="location_id">Location ID</Label>
                    <Input
                      id="location_id"
                      {...form.register('location_id')}
                      placeholder="Enter location ID"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="district_id">District ID</Label>
                    <Input
                      id="district_id"
                      {...form.register('district_id')}
                      placeholder="Enter district ID"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ward_id">Ward ID</Label>
                  <Input
                    id="ward_id"
                    {...form.register('ward_id')}
                    placeholder="Enter ward ID"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      {...form.register('start_date')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      {...form.register('end_date')}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Creating...' : 'Create Election'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Admin Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-amber-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Admin Confirmation Required
              </DialogTitle>
              <DialogDescription>
                Please review the election details and enter your admin password to confirm creation.
              </DialogDescription>
            </DialogHeader>
            
            {electionData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3"
              >
                <div>
                  <span className="font-semibold">Name:</span> {electionData.name}
                </div>
                <div>
                  <span className="font-semibold">Description:</span> {electionData.description}
                </div>
                <div>
                  <span className="font-semibold">Location:</span> {electionData.location_id}
                </div>
                <div>
                  <span className="font-semibold">District:</span> {electionData.district_id}
                </div>
                <div>
                  <span className="font-semibold">Ward:</span> {electionData.ward_id}
                </div>
                <div>
                  <span className="font-semibold">Duration:</span>{' '}
                  {format(new Date(electionData.start_date), 'PP')} to{' '}
                  {format(new Date(electionData.end_date), 'PP')}
                </div>
              </motion.div>
            )}

            <div className="mt-4 space-y-2">
              <Label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
                Admin Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="pl-9"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  setAdminPassword('');
                }}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCreate}
                disabled={isSubmitting || !adminPassword}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm & Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {elections.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No elections</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new election.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {elections.map((election) => (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">{election.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{election.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Location: {election.location_id}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      District: {election.district_id}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Ward: {election.ward_id}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm text-gray-500">
                      Start: {format(new Date(election.start_date), 'PPP')}
                    </p>
                    <p className="text-sm text-gray-500">
                      End: {format(new Date(election.end_date), 'PPP')}
                    </p>
                  </div>
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                      {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
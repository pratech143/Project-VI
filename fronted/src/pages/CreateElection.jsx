import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Plus, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { createElection } from '../Redux/slice/electionSlice'; // Assuming this action is already defined

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

export function CreateElection() {
  const dispatch = useDispatch();
  const { isLoading, isError, errorMessage } = useSelector((state) => state.election); // Getting loading/error state from redux store

  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [electionData, setElectionData] = useState(null);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      location_name: '',
      location_type: '',
      district_name: '',
      ward: '',
      start_date: '',
      end_date: '',
      status: 'upcoming' // Default status can be 'upcoming', adjust based on your requirements
    }
  });

  const handleCreateElection = async (data) => {
    setElectionData(data);
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    if (adminPassword !== 'admin123') {
      toast.error('Invalid admin password');
      return;
    }

    try {
      // Dispatch the createElection action to trigger the API call
      await dispatch(createElection(electionData)).unwrap(); // Using unwrap to catch any errors

      // If successful, reset the form and close the dialog
      setOpen(false);
      setShowConfirmation(false);
      setAdminPassword('');
      form.reset();
      toast.success('Election created successfully!');
    } catch (error) {
      toast.error(`Failed to create election: ${errorMessage || error}`);
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    {...form.register('description')}
                    placeholder="Enter election description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location_name">Location Name</Label>
                  <Input
                    id="location_name"
                    {...form.register('location_name')}
                    placeholder="Enter location name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location_type">Location Type</Label>
                  <Input
                    id="location_type"
                    {...form.register('location_type')}
                    placeholder="Enter location type"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="district_name">District Name</Label>
                  <Input
                    id="district_name"
                    {...form.register('district_name')}
                    placeholder="Enter district name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ward">Ward</Label>
                  <Input
                    id="ward"
                    {...form.register('ward')}
                    placeholder="Enter ward name"
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
                <div className="grid gap-2">
                  <Label htmlFor="status">Election Status</Label>
                  <select
                    id="status"
                    {...form.register('status')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={form.formState.isSubmitting || isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Election'}
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
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <span className="font-semibold">Name:</span> {electionData.name}
                </div>
                <div>
                  <span className="font-semibold">Description:</span> {electionData.description}
                </div>
                <div>
                  <span className="font-semibold">Location:</span> {electionData.location_name}
                </div>
                <div>
                  <span className="font-semibold">Location Type:</span> {electionData.location_type}
                </div>
                <div>
                  <span className="font-semibold">District:</span> {electionData.district_name}
                </div>
                <div>
                  <span className="font-semibold">Ward:</span> {electionData.ward}
                </div>
                <div>
                  <span className="font-semibold">Duration:</span>{' '}
                  {format(new Date(electionData.start_date), 'PP')} to{' '}
                  {format(new Date(electionData.end_date), 'PP')}
                </div>
                <div>
                  <span className="font-semibold">Status:</span> {electionData.status}
                </div>
              </div>
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
                disabled={isLoading || !adminPassword}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? 'Confirming...' : 'Confirm & Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

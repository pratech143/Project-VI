import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
    end_time: '18:00', // New time field
    status: 'upcoming'
  }
];

export function CreateElection() {
  const [elections, setElections] = useState(mockElections);
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      location_id: '',
      district_id: '',
      ward_id: '',
      start_date: '',
      end_date: '',
      end_time: '', // New time field
    }
  });

  // Helper function to determine the election status
  const getElectionStatus = (startDate, endDate, endTime) => {
    const now = new Date();
    const start = new Date(startDate);
    const [hour, minute] = endTime.split(':');
    const end = new Date(endDate);
    end.setHours(hour);
    end.setMinutes(minute);

    if (now < start) {
      return 'upcoming';
    } else if (now > start && now < end) {
      return 'ongoing';
    } else if (now > end) {
      return 'completed';
    }
    return 'upcoming'; // default status
  };

  const onSubmit = async (data) => {
    try {
      const { start_date, end_date, end_time, ...rest } = data;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newElection = {
        id: elections.length + 1,
        ...rest,
        start_date,
        end_date,
        end_time,
        status: getElectionStatus(start_date, end_date, end_time),
      };
      
      setElections(prev => [...prev, newElection]);
      setOpen(false);
      form.reset();
      toast.success('Election created successfully!');
    } catch (error) {
      toast.error('Failed to create election');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-red-800';
      default:
        return 'bg-gray-100 text-red-800';
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
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
                <div className="grid gap-2">
                  <Label htmlFor="end_time">End Time (HH:MM)</Label>
                  <Input
                    id="end_time"
                    type="time"
                    {...form.register('end_time')}
                  />
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
          {elections.map((election) => (
            <div
              key={election.id}
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
                    End: {format(new Date(election.end_date), 'PPP')} at {election.end_time}
                  </p>
                </div>
                <div className="mt-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                    {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

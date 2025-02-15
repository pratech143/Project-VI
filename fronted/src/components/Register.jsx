import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRegister } from '@/Redux/slice/authSlice';
import { KeyRound, Mail, User } from 'lucide-react';
import { Card, CardDescription, CardTitle, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    voter_id: '',
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, errorMessage } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateInputs = () => {
    const newErrors = {};

    if (!formData.voter_id.trim()) {
      newErrors.voter_id = 'Voter ID is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid Gmail address.';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      await dispatch(fetchRegister(formData)).unwrap();
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/otp');
    } catch (error) {
      toast.error(error);
      setErrors((prev) => ({ ...prev, general: error }));
    }
  };

  return (
    <div className="flex items-center justify-center sm:px-6 lg:px-8">
      <Card className="w-full mx-11 space-y-6 p-5 shadow-lg bg-slate-blue text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-white">Register for a new account</CardTitle>
          <CardDescription className="text-white text-xl">Register your account here</CardDescription>
        </CardHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            {/* Voter ID */}
            <div className="relative">
              <label htmlFor="voter_id" className="text-xl text-white">Voter ID</label>
              <Input
                id="voter_id"
                name="voter_id"
                type="text"
                value={formData.voter_id}
                onChange={handleChange}
                required
                className="pl-10 min-h-9 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 w-[70%]"
              />
              <User className="absolute left-3 top-[70%] transform -translate-y-1/2 text-gray-400" />
              {errors.voter_id && <p className="text-red-400">{errors.voter_id}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <label htmlFor="email" className="text-xl text-white">Email Address</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-10 min-h-9 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 w-[70%]"
              />
              <Mail className="absolute left-3 top-[70%] transform -translate-y-1/2 text-gray-400" />
              {errors.email && <p className="text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="text-xl text-white">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10 min-h-9 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 w-[70%]"
              />
              <KeyRound className="absolute left-3 top-[70%] transform -translate-y-1/2 text-gray-400" />
              {errors.password && <p className="text-red-400">{errors.password}</p>}
            </div>
          </div>

          {errors.general && <p className="text-red-400">{errors.general}</p>}
          {errorMessage && <p className="text-red-400">{errorMessage}</p>}

          <Button
            type="submit"
            className="w-[30%] text-2xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </span>
            ) : null}
            Register
          </Button>
        </form>
      </Card>
    </div>
  );
}

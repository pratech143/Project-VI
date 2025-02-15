import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { KeyRound, Mail } from "lucide-react";
import { Card, CardDescription, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSelector, useDispatch } from "react-redux";
import { fetchLogin } from "@/Redux/slice/authSlice";  // Importing fetchLogin action

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError } = useSelector((state) => state.auth);  // Accessing the loading state and error state from Redux

  const validateInputs = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      newErrors.email = "Please enter a valid Gmail address.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!validateInputs()) return; 
    setLoading(true); 
    try {
    const data=  await dispatch(fetchLogin({ email, password })).unwrap();
    console.log(data)
      toast.success('Login Successful');
    
      localStorage.setItem("email",data.email)
        localStorage.setItem("role",data.role)
      
        setTimeout(()=>{
          navigate('/dashboard');
        }
        ,1000)
      
    } catch (error) {
      toast.error(error);
      setErrors((prev) => ({ ...prev, general: error.message || 'Login failed' }));
    } finally {
      setLoading(false); // Stop loading when the request is finished
    }
  };
  

  return (
    <div className="flex items-center justify-center bg-slate-blue text-white">
      <Card className="w-full mx-11 shadow-lg border-none bg-slate-blue text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-white">Login to vote</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xl font-medium text-white">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-10 w-6 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 w-[70%] min-h-16 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {errors.email && <p className="text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xl font-medium text-white">
                Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-10 w-6 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 w-[70%] min-h-16 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {errors.password && <p className="text-red-600">{errors.password}</p>}
            </div>

            {errors.general && <p className="text-red-600">{errors.general}</p>}

            <div className="flex justify-between items-center">
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

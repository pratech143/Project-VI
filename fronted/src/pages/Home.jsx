import { Link } from 'react-router-dom';
import { Vote, ShieldCheck, UserCheck, UserPlus, Search, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';

export function Home() {
  const { user } = useAuth();

  // State to manage visibility for animations
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [stepsVisible, setStepsVisible] = useState(false);

  const featuresRef = useRef(null);
  const stepsRef = useRef(null);

  useEffect(() => {
    // IntersectionObserver to handle the fade-in effect
    const options = {
      root: null, // defaults to viewport
      rootMargin: '0px',
      threshold: 0.3, // Trigger animation when 30% of element is visible
    };

    const handleIntersection = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === featuresRef.current) {
            setFeaturesVisible(true);
          } else if (entry.target === stepsRef.current) {
            setStepsVisible(true);
          }
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (stepsRef.current) observer.observe(stepsRef.current);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Vote className="h-8 w-8" />,
      title: 'Secure Voting',
      text: 'Cast your vote securely from anywhere using our advanced encryption system.',
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: 'Verified Identity',
      text: 'Multi-step verification ensures only eligible voters can participate.',
    },
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: 'Easy Access',
      text: 'Simple and intuitive interface makes voting accessible to everyone.',
    },
  ];

  const steps = [
    {
      icon: <UserPlus className="h-8 w-8" />,
      title: 'Register',
      text: 'Provide your details, upload voter ID, and verify via OTP.',
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: 'Admin Approval',
      text: 'Wait for verification and approval from election officials.',
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: 'Check Elections',
      text: 'Log in to see if there are any ongoing elections in your ward.',
    },
    {
      icon: <Vote className="h-8 w-8" />,
      title: 'Cast Your Vote',
      text: 'Securely vote for your preferred candidates when elections are live.',
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'View Results',
      text: 'Check results as they are calculated and made public.',
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="bg-gradient-to-b from-slate-blue to-indigo-900 flex flex-col lg:flex-row">
        {/* Left Section (Main Content) */}
        <div className="relative z-10 pb-16 lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16">
          <h1 className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl leading-tight">
            Secure <span className="text-indigo-400">Online</span> Voting System
          </h1>
          <p className="mt-6 text-lg text-gray-300">
            Exercise your right to vote securely and conveniently. Our platform ensures your vote is counted while maintaining complete privacy and security.
          </p>
          {!user && (
            <div className="mt-6 flex gap-4">
              <Link
                to="/auth/register"
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium text-lg shadow-lg hover:bg-indigo-700 transition"
              >
                Register to Vote
              </Link>
              <Link
                to="/auth/login"
                className="px-6 py-3 rounded-lg bg-white text-indigo-600 font-medium text-lg shadow-md hover:bg-gray-100 transition"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Right Section (Image) */}
        <div className="lg:w-1/2">
          <img className="h-64 w-full object-cover sm:h-80 md:h-96 lg:h-full" src="/ballot.png" alt="Voting" />
        </div>
      </div>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className={`bg-gradient-to-b from-indigo-900 to-indigo-500 py-20 ${
          featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } transition-all duration-700`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-indigo-400 tracking-wide uppercase">Features</h2>
            <p className="mt-3 text-4xl font-extrabold text-gray-900">A Better Way to Vote</p>
            <p className="mt-4 text-lg text-gray-900 font-semibold">
              Our secure and verified online voting system ensures fairness and accessibility.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon, title, text }, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition duration-300"
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500 text-white">{icon}</div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-3 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section
        ref={stepsRef}
        className={`bg-gradient-to-b from-indigo-500 to-indigo-300 py-20 ${
          stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } transition-all duration-700`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white tracking-wide uppercase">Election Guide</h2>
            <p className="mt-3 text-4xl font-extrabold text-white">How to Participate in Elections</p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ icon, title, text }, i) => (
              <div key={i} className="flex flex-col items-center text-center bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600 text-white">{icon}</div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-3 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

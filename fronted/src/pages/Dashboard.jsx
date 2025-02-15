

export function Dashboard() {
  const user={email:"prtkchapagain"}

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p className="text-gray-600">Welcome back, {user?.email}</p>
    </div>
  );
}
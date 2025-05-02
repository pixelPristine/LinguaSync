'use client';

import React, { useState } from 'react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:8000/api/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setMessage('Registered successfully! You can now log in.');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen flex items-center justify-center transition-colors duration-300 px-4 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{darkMode ? '🌙 Dark' : '☀️ Light'}</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-8 flex items-center rounded-full p-1 ${darkMode ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className={`w-full max-w-md shadow-xl rounded-2xl p-8 space-y-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <h2 className="text-3xl font-bold text-center text-blue-500">Register</h2>
        <p className={`text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Create an account to get started</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-white text-black border-gray-300 placeholder-gray-500'}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-white text-black border-gray-300 placeholder-gray-500'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          {message && <p className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}

          <button
            type="submit"
            className={`w-full p-3 font-semibold rounded-xl transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Already have an account?{' '}
          <a href="/" className="text-blue-500 hover:underline">
            Login here
          </a>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;

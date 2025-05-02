'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = '/home';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
      callbackUrl,
    });

    if (res?.error) {
      if (res.error === 'Configuration') {
        setErrorMsg('Invalid username or password. Please try again.');
      } else {
        setErrorMsg('An error occurred during login. Please try again later.');
      }
      setIsSubmitting(false);
    } else {
      router.push(callbackUrl);
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
        <h2 className="text-3xl font-bold text-center text-blue-500">Welcome Back</h2>
        <p className={`text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Please sign in to continue</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-white text-black border-gray-300 placeholder-gray-500'}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <input
            type="password"
            placeholder="Password"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-white text-black border-gray-300 placeholder-gray-500'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
          {errorMsg && <p className="text-sm text-red-400 dark:text-red-300">{errorMsg}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-3 font-semibold rounded-xl transition ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Don’t have an account?{' '}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;

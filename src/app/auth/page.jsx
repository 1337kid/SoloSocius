'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';

export default function Form() {
  const [data, setData] = useState({
    username: "",
    password: "",
    redirect: false
  })
  const [error,setError] = useState(null)
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await signIn('credentials', data);
    console.log({ response });
    if (response.error) {
      setError('Login failed. check user & pass again')
    }
    if (!response?.error) {
      router.push('/');
      router.refresh();
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-2'
    >
      {error && (
              <span className='bg-red-300 text-black'>
                {error}
              </span>
      )}
      <input
        name="username"
        className="border border-black text-black"
        type="text"
        onChange={(e) => setData({...data, username: e.target.value})}
      />
      <input
        name="password"
        className="border border-black  text-black"
        type="password"
        onChange={(e) => setData({...data, password: e.target.value})}
      />
      <button type="submit">Login</button>
    </form>
  );
}
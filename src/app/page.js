"use client"
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_PUBLIC } from '@/constants/api';

const ActorProfile = () => {
  const router = useRouter();
  const [data, setData] = useState({userActor: {}, connections: {}})
  useEffect(() => {
    const getUserActor = async () => {
      const data = await axios.get(`${API_PUBLIC}/getActor`)
      if (data.status == 404) router.push('/auth');
      setData(data?.data);
    }
    getUserActor();
  }, [])
  return (
    <div className='flex container w-full bg-slate-300 m-auto'>
      <div className='flex w-full'>
        <h3>{data?.userActor?.name}</h3>
      </div>
    </div>
  )
}

export default ActorProfile
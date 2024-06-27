"use client"
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_PUBLIC } from '@/constants/api';
import Image from 'next/image';
import DOMPurify from 'dompurify';

const ActorProfile = () => {
  const router = useRouter();
  const [data, setData] = useState({userActor: {}, stats: []})
  useEffect(() => {
    const getUserActor = async () => {
      const data = await axios.get(`${API_PUBLIC}/getActor`)
      if (data.status == 404) router.push('/auth');
      setData(data?.data);
    }
    getUserActor();
  }, [])
  return (
    <div className='flex container w-full m-auto p-2 text-white'>
      <div className='flex w-full gap-2'>
        <div className='flex w-3/12 flex-col bg-zinc-900 p-2 rounded-md pt-4'>
          <Image src={data?.userActor?.profilePhoto} alt="profile image" className='m-auto rounded-md' width={300} height={300}/>
          <div className='flex flex-col p-2'>
            <p className='text-lg'>{data?.userActor?.name}</p>
            <p className='text-zinc-500 text-sm'>{data?.userActor?.username}</p>
          </div>
          <p className='p-2' dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(data?.userActor?.summary) }} />
          <hr className='m-2 border-zinc-500'/>
          <div className='flex gap-1 justify-around p-2'>
            {data?.stats?.map((item) => (
              <div key={item.name} className='text-zinc-300 text-center flex gap-1 items-center'>
                {console.log('lmao')}
                <p className='font-[600] text-zinc-200 text-md'>{item?.data}</p>
                <p className='text-sm'>{item?.name}</p>
              </div>
            ))}
          </div>
        </div>
        <div className='flex w-9/12 bg-zinc-900 p-2 rounded-md'> 
          <h3 className='text-xl text-center w-full'>Notes</h3>

        </div>
      </div>
    </div>
  )
}

export default ActorProfile
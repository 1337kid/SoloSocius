"use client"
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_PUBLIC } from '@/constants/api';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import ReactLoading from 'react-loading';
import { FaCalendarAlt } from "react-icons/fa";
import Link from 'next/link';

const ActorProfile = ({children}) => {
  const router = useRouter();
  const [data, setData] = useState({userActor: {}, stats: []});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const getUserActor = async () => {
      const data = await axios.get(`${API_PUBLIC}/getActor`)
      if (data.status == 404) router.push('/auth');
      setData(data?.data);
    }
    getUserActor();
    setLoading(false);
  }, [])
  if (loading) {
    return (
      <div className='w-full h-dvh'>
              <ReactLoading type="bars" color="white" width={100} className='m-auto'/>
      </div>
    )
  } else return (
    <div className='flex container w-full m-auto p-2 text-white'>
      <div className='flex w-full gap-2'>
        <div className='flex w-3/12 flex-col bg-zinc-900 p-2 rounded-md pt-4 gap-1'>
          <Image src={data?.userActor?.profilePhoto} alt="profile image" className='m-auto rounded-md' width={300} height={300}/>
          <div className='flex flex-col'>
            <p className='text-2xl font-[600]'>{data?.userActor?.name}</p>
            <Link href='/'>
              <p className='text-zinc-500 text-sm underline underline-offset-3 hover:text-zinc-400'>{data?.userActor?.username}</p>
            </Link>
          </div>
          <p className='text-sm' dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(data?.userActor?.summary) }} />
          <p className='text-sm inline-flex items-center gap-1 text-zinc-500'>
            <FaCalendarAlt className='text-zinc-400'/>
            Joined on {new Date(data?.userActor?.createdOn).toDateString()}
          </p>
          <hr className='mt-2 border-zinc-500'/>
          <div className='flex gap-1 justify-around'>
            {data?.stats?.map((item) => (
              <div key={item.name} className='text-zinc-300 text-center flex gap-1 items-center'>
                {console.log('lmao')}
                <p className='font-[600] text-zinc-200 text-md'>{item?.data}</p>
                <Link href={`/${item?.name.toLowerCase()}`}>
                    <p className='underline underline-offset-3 hover:text-zinc-400 text-sm'>{item?.name}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className='bg-zinc-900 w-9/12 rounded-md'>
          <div className='flex justify-between px-4 py-2'>
            <h4>SoloSocius</h4>
            <button>LogIn</button>
          </div>
          <hr className='border-zinc-500'/>
          <div className='text-centre w-full'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActorProfile
"use client"
import {signOut} from 'next-auth/react'
import { useRouter } from 'next/navigation';
export default function Home() {
  const router = useRouter();
  return (
    <>    <form className=""
    action={() => {
      signOut()
    }}
  >
    <button>out</button>
  </form>
  
  <button onClick={() => router.push('/test')}>LMO</button>
  </>

  );
}

"use client"
import {signOut} from 'next-auth/react'
export default function Home() {
  return (
    <form className=""
      action={async() => {
        await signOut()
      }}
    >
      <button>out</button>
    </form>
  );
}

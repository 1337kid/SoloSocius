import { connectToDB } from "@/db"
import { NextResponse } from "next/server"

export const GET = async() => {
    try {
        await connectToDB()
        return NextResponse.json({})
        
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:'Internal Server Error'}, {status:500})
    }
}
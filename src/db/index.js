import mongoose from "mongoose"
import { DATABASE } from "@/constants"

let isConnected = false

export const connectToDB = async () => {
  if (isConnected) {
    console.log('DB already connected')
    return
  }

  try {
    await mongoose.connect(`${process.env.MONGO_URI}`,{
        dbName: DATABASE
    })
    isConnected = true
    console.log('Connected to DB')
    return
  } catch (error) {
    console.log(error)   
  }
}
import mongoose from "mongoose"

let isConnected = false

const connectToDB = async () => {
  if (isConnected) {
    console.log('DB already connected')
    return
  }

  try {
    await mongoose.connect(`${process.env.MONGO_URI}`,{
        dbName:'solosocius'
    })
    isConnected = true
    console.log('Connected to DB')
    return
  } catch (error) {
    console.log(error)   
  }
}

export default connectToDB
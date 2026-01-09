import mongoose from "mongoose"

const DB = async() =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Successfully estd connection with MONGODB Database")
    } catch (error) {
        console.log(error);
        process.exit(1);    
    }
}

export default DB;
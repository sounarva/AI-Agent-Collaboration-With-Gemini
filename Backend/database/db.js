import mongoose from "mongoose"


const URI = process.env.MONGO_URI 
// console.log(URI)

async function connection(){
    await mongoose.connect(URI)
    .then(()=>{
        console.log("DB Connected")
    })
    .catch((err) =>{
        console.log(err.message)
    })
}

export default connection
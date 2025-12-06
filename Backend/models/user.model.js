import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        minLength: [6, "Email must be of 6 characters"],
        maxLength: [50, "Email should not be greater than 50 characters"]
    },
    password: {
        type: String,
        select: false
    }
})

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10)
}

userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateJWT = function () {
    return jwt.sign(
        { email: this.email },
        process.env.JWT_TOKEN,
        { expiresIn: '24h' }
    )
}

const User = mongoose.model('user', userSchema)
export default User
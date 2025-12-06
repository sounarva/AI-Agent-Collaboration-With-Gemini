import React, { useState , useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'

const Register = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()
    const { setUser } = useContext(UserContext)

    function registerDetails(evt) {
        if (evt.target.name === "email") {
            setEmail(evt.target.value)
        } else if (evt.target.name === "password") {
            setPassword(evt.target.value)
        }
    }

    function submitHandler(evt) {
        evt.preventDefault()

        axios.post('/users/register', {
            email,
            password
        }).then((res) => {
            console.log(res.data)
            localStorage.setItem("token", res.data.token)
            setUser(res.data.user)
            navigate('/')
        }).catch((err) => {
            console.log("Error Occured")
        })
    }



    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-[#181818] via-[#1F2430] to-[#23272f] p-4">
            <div className="w-full max-w-md rounded-2xl shadow-2xl bg-[#23272f] px-8 py-10 flex flex-col items-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 text-white tracking-tight text-center">Create Your Account</h2>
                <p className="mb-8 text-gray-400 text-center text-sm">Sign up to get started</p>
                <form
                    onSubmit={submitHandler}
                    className="w-full flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-gray-300 text-sm ml-1">Email Address</label>
                        <input
                            onChange={registerDetails}
                            type="email"
                            name='email'
                            value={email}
                            id="email"
                            className="w-full px-4 py-3 bg-[#181c24] text-white rounded-lg border border-[#323840] focus:outline-none focus:ring-[2.5px] focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all"
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-gray-300 text-sm ml-1">Password</label>
                        <input
                            onChange={registerDetails}
                            type="password"
                            name='password'
                            value={password}
                            id="password"
                            className="w-full px-4 py-3 bg-[#181c24] text-white rounded-lg border border-[#323840] focus:outline-none focus:ring-[2.5px] focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all"
                            placeholder="Create a password"
                            autoComplete="new-password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 mt-2 rounded-lg bg-linear-to-r from-blue-600 via-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-bold text-white text-lg transition-all duration-200 shadow-lg shadow-blue-900/40 uppercase tracking-wider"
                    >
                        Register
                    </button>
                </form>
                <div className="flex justify-center items-center align-middle mt-8 gap-2">
                    <span className="text-gray-400 text-sm">Already have an account?</span>
                    <Link to="/login" className="text-blue-400 font-semibold text-sm hover:underline">Login</Link>
                </div>
            </div>
        </div>
    )
}

export default Register


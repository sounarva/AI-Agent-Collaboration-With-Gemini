import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from '../config/axios.js'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projects, setProjects] = useState([])
  const [isProjectCreated, setIsProjectCreated] = useState(false)

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setProjectName('')
  }

  // console.log(user)

  useEffect(() => {
    axios.get('/projects/all')
      .then((res) => {
        // console.log(res.data)
        setProjects(res.data)
      })
      .catch((err) => {
        console.log(err.response.data)
      })
  }, [])

  useEffect(() => {
    if (isProjectCreated) {
      axios.get('/projects/all')
        .then((res) => {
          // console.log(res.data)
          setProjects(res.data)
        })
        .catch((err) => {
          console.log(err.response.data)
        })
    }
    setIsProjectCreated(false)
  }, [isProjectCreated])

  const handleSubmit = async (e) => {
    e.preventDefault()

    axios.post('/projects/create', { name: projectName })
      .then((res) => {
        // console.log(res.data)
        setIsProjectCreated(true)
      })
      .catch((err) => {
        console.log(err.response.data)
      })

    setIsModalOpen(false)
    setProjectName('')
  }

  return (
    <div>
      <main className='h-screen w-full'>
        <div id="create-project" className='pt-3 pl-3 flex gap-5 items-start'>
          <h3
            className='px-8 py-4 text-lg font-serif font-semibold rounded-lg border border-slate-400 inline-block cursor-pointer active:scale-95 transition-all'
            onClick={handleOpenModal}
          >
            Create New Project <i className="ri-link ml-2 text-blue-300"></i>
          </h3>
          <div className='flex flex-col gap-3'>
            {projects.map((project) => (
              <div
                onClick={() => {
                  navigate(`/project`, {
                    state: { project }
                  })
                }}
                key={project._id} className='px-8 py-4 text-lg font-serif font-semibold rounded-lg border border-slate-400 inline-block cursor-pointer active:scale-95 hover:bg-slate-800 transition-all'>
                <h3>{project.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {isModalOpen && (
          <div id='modal-div' className="fixed inset-0 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96">
              <label htmlFor="projectName" className="block text-lg font-medium text-gray-700 mb-3 font-mono leading-tight">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                className="my-1 block w-full px-3 py-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <div className="w-full flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-1/3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  OK
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
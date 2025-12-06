import { useLocation } from 'react-router-dom'
import React, { useEffect, useState, useContext, useRef } from 'react'
import axios from '../config/axios.js'
import { initializeSocket, recieveMessage, sendMessage } from '../config/socket.js'
import { UserContext } from '../context/user.context.jsx'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer.js'

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}


const Project = () => {
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState([])
  const [users, setUsers] = useState([])
  const [projectUsers, setProjectUsers] = useState([])
  const [message, setMessage] = useState("")
  const [projectMessages, setProjectMessages] = useState([])
  const [fileTree, setFileTree] = useState({})

  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const messageBox = useRef(null)
  const [webContainer, setWebContainer] = useState(null)
  const [iFrameUrl, setIFrameUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)

  const { user } = useContext(UserContext)

  const handleUserClick = (id) => {
    setSelectedUserId(prev => {
      const newArr = [...prev]
      if (newArr.indexOf(id) != -1) {
        newArr.splice(newArr.indexOf(id), 1)
      } else {
        newArr.push(id)
      }
      return Array.from(new Set(newArr))
    })
  }


  useEffect(() => {
    const socket = initializeSocket(location.state.project._id)

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container)
        console.log("Web Container Loaded")
      })
    }

    recieveMessage("project-message", data => {

      // console.log(data)

      if (data.sender._id == 'AI') {

        const message = JSON.parse(data.message)

        // console.log(message)

        webContainer?.mount(message.fileTree)

        if (message.fileTree) {
          console.log(message.fileTree)
          setFileTree(message.fileTree || {})
          saveFileTree(message.fileTree)
        }
        setProjectMessages(prevMessages => [...prevMessages, data]) // Update messages state
      } else {


        setProjectMessages(prevMessages => [...prevMessages, data]) // Update messages state
      }
    })

    axios.get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        setProjectUsers(res.data.users)
        setFileTree(res.data.fileTree || {})
        // console.log(res.data)
      })
      .catch((err) => {
        console.log(err)
      })

    axios.get("/users/all")
      .then((res) => {
        setUsers(res.data.users)
      })
      .catch((err) => {
        console.log(err)
      })

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [projectMessages])

  function scrollToBottom() {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight
    }
  }

  function saveFileTree(ft) {
    axios.put("/projects/update-file-tree", {
      projectId: location.state.project._id,
      fileTree: ft
    })
      .then((res) => {
        // console.log(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const send = () => {
    sendMessage("project-message", {
      message,
      sender: user,
    })
    setProjectMessages(prev => [...prev, {
      message,
      sender: user,
    }])
    setMessage("")
  }

  function WriteAiMessage(message) {

    const messageObject = JSON.parse(message)
    // console.log(messageObject)

    return (
      <div
        className='overflow-auto bg-slate-950 text-white rounded-sm p-2'
      >
        <Markdown
          children={messageObject.text || messageObject.response || messageObject.message || messageObject.fileTree || messageObject.status || messageObject.description || messageObject.definition || messageObject}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>)
  }

  const handleAddCollaborator = () => {
    console.log("Selected Users:", selectedUserId)

    axios.put('/projects/add-user', {
      projectId: location.state.project._id,
      users: selectedUserId
    })
      .then((res) => {
        console.log(res.data)
      })
      .catch((err) => {
        console.log(err)
      })

    setIsAddModalOpen(false)
  }


  return (
    <main className='h-screen w-screen flex'>
      <section className="left h-full flex flex-col min-w-96 bg-gray-600 relative">

        <header className='w-full p-4 px-2 flex items-center justify-between bg-gray-300'>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className='bg-white px-4 py-1 rounded-full flex items-center gap-3 active:scale-95 transition-all cursor-pointer'>
            <i className="ri-add-line text-black text-lg"></i>
            <small className='text-black font-mono'>Add Collaborators</small>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className='bg-white px-4 py-1 rounded-full flex items-center gap-3 active:scale-95 transition-all cursor-pointer'>
            <small className='text-black font-mono'>Collaborators</small>
            <i className="ri-group-line text-black text-lg"></i>
          </button>
        </header>

        <div className="conersation-sec flex flex-col grow min-h-0">
          <div ref={messageBox} className="message-box grow p-2 flex flex-col gap-2 overflow-y-auto">
            {projectMessages.map((msg, index) => (
              <div key={index} className={`${msg.sender._id === user._id ? 'ml-auto' : ''} ${msg.sender._id === 'AI' ? 'max-w-80' : 'max-w-56'} message flex flex-col p-2 bg-slate-50 w-fit rounded-md text-black font-serif`}>
                <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                <div className='text-sm'>
                  {msg.sender._id === 'AI' ? (
                    WriteAiMessage(msg.message)
                  ) : (
                    <p>{msg.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="input-box flex items-center justify-between bg-white pr-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              type="text" placeholder='Type Your Message' className='w-full border-none outline-none bg-transparent p-4 text-black' />
            <button onClick={send} className='bg-blue-500 px-4 py-1 rounded-full flex items-center gap-2 active:scale-95 transition-all cursor-pointer'><small className='text-white font-mono text-sm'>Send</small><i className="ri-send-plane-fill text-white text-lg"></i></button>
          </div>
        </div>

        <div className={`side-panel absolute h-full w-full ${isModalOpen ? 'translate-x-0' : '-translate-x-full'} transition-all`}>
          <header className='flex items-center justify-between bg-white p-4 text-black'>
            <h3 className='font-serif text-xl leading-tight'>Collaborators</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className='bg-gray-400 px-2 py-1 rounded-full flex items-center gap-2 active:scale-95 transition-all cursor-pointer'><i className="ri-close-line text-white"></i></button>
          </header>

          <div className="p-4">
            <div className="users flex flex-col gap-4">
              {projectUsers.map((user) => {
                return (
                  <div key={user._id} className="user flex items-center gap-3 bg-gray-200 px-3 py-2 rounded-xl text-black font-serif hover:bg-gray-300 transition-all cursor-pointer">
                    <h4 className='bg-gray-600 px-3 py-2 rounded-full'><i className="ri-user-6-fill text-xl text-white"></i></h4>
                    <p className='text-xl font-semibold'>{user.email}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="right bg-black/50 grow h-full flex">

        <div className="explorer h-full max-w-64 min-w-52 bg-slate-400">
          <div className="file-tree w-full flex flex-col gap-1">
            {
              Object.keys(fileTree).map((file, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFile(file)
                    setOpenFiles([...new Set([...openFiles, file])])
                  }}
                  className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-50 w-full">
                  <p
                    className='font-semibold text-lg text-black'
                  >{file}</p>
                </button>))

            }
          </div>

        </div>

        {(currentFile || iFrameUrl) && (
          <div className="code-editor flex flex-col grow h-full">
            <div className="top flex justify-between w-full">
              <div className="files flex">
                {
                  openFiles.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFile(file)}
                      className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${currentFile === file ? 'bg-slate-500' : 'text-black'}`}>
                      <p
                        className='font-semibold text-lg'
                      >{file}</p>
                      <i onClick={(e) => {
                        e.stopPropagation()
                        const newOpenFiles = openFiles.filter((f) => f !== file)
                        setOpenFiles(newOpenFiles)
                        if (currentFile === file) {
                          if (newOpenFiles.length > 0) {
                            setCurrentFile(newOpenFiles[newOpenFiles.length - 1])
                          } else {
                            setCurrentFile(null)
                          }
                        }
                      }} className={`${currentFile === file ? 'text-white' : 'text-black'} ri-close-line cursor-pointer`}></i>
                    </button>
                  ))
                }
              </div>
              <div className="action-btns p-2">
                <button
                  onClick={async () => {
                    await webContainer?.mount(fileTree)
                    const installProcess = await webContainer.spawn('npm', ['install']);
                    installProcess.output.pipeTo(new WritableStream({
                      write(chunk) {
                        console.log(chunk)
                      }
                    }))

                    if (runProcess) {
                      runProcess.kill()
                    }

                    const tempRunProcess = await webContainer.spawn('npm', ['start']);
                    tempRunProcess.output.pipeTo(new WritableStream({
                      write(chunk) {
                        console.log(chunk)
                      }
                    }))

                    setRunProcess(tempRunProcess)

                    webContainer.on('server-ready', (port, url) => {
                      console.log(port, url)
                      setIFrameUrl(url)
                    })
                  }}
                  className='bg-blue-500 px-4 py-1 rounded-full flex items-center gap-2 active:scale-95 transition-all cursor-pointer'>
                  <small className='text-white font-mono text-sm'>Run</small><i className="ri-play-fill text-white text-lg"></i></button>
              </div>

            </div>
            <div className="bottom flex grow">
              {
                fileTree[currentFile] && (
                  <div className="code-editor-area h-full grow bg-slate-800">
                    <pre
                      className="hljs h-full">
                      <code
                        className="hljs h-full outline-none"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const updatedContent = e.target.innerText;
                          const ft = {
                            ...fileTree,
                            [currentFile]: {
                              file: {
                                contents: updatedContent
                              }
                            }
                          }
                          setFileTree(ft)
                          saveFileTree(ft)
                        }}
                        dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value }}
                        style={{
                          whiteSpace: 'pre-wrap',
                          paddingBottom: '25rem',
                          counterSet: 'line-numbering',
                        }}
                      />
                    </pre>
                  </div>
                )
              }
              {
                iFrameUrl && webContainer && currentFile && (
                  (<div className={`iframe-box flex flex-col h-full ${currentFile ? 'w-1/2' : 'w-full'}`}>
                    <input onChange={(e) => setIFrameUrl(e.target.value)} type="text" className='address-bar w-full p-2 bg-blue-200 text-black text-sm font-sans font-semibold' value={iFrameUrl} />
                    <iframe
                      src={iFrameUrl}
                      className={`iframe-portion h-full`}
                    />
                  </div>)

                )
              }
            </div>

          </div>
        )
        }

      </section >


      {isAddModalOpen && (
        <div className="fixed w-full h-full bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative transform transition-all">
            <header className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-black'>Select User</h2>
              <button onClick={() => setIsAddModalOpen(false)} className='p-2'>
                <i className="ri-close-line text-black text-xl cursor-pointer"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-y-auto">
              {users.map(user => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className={`user cursor-pointer hover:bg-slate-200 ${selectedUserId.indexOf(user._id) != -1 ? 'bg-slate-200' : ''} p-2 flex gap-2 items-center rounded-md`}>
                  <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className='font-semibold text-lg text-black'>{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddCollaborator}
              className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-md active:scale-95 transition-all cursor-pointer'>
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main >
  )
}

export default Project
import React from 'react'
import AppRotes from './routes/AppRotes'
import { UserProvider } from './context/user.context'

const App = () => {
  return (
    <UserProvider>
      <AppRotes />
    </UserProvider>
  )
}

export default App

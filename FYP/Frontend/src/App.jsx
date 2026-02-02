import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SinhalaLegalAI from './Page/SinhalaLegalAI.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
         <SinhalaLegalAI/>
      </div>
    </>
  )
}

export default App

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FileUploadComponent from "../src/components/FileUpload"
import Hero from "./components/Hero"

function App() {
  return (
    <div className="bg-black flex flex-col">
      <Hero />

      <div className="mt-16 p-96">
        <FileUploadComponent />
      </div>
    </div>
  );
}

export default App

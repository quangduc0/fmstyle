import React from 'react'
import Topbar from '../Layout/Topbar'
import Navbar from './Navbar'

const Header = () => {
  return (
    <header className='sticky top-0 z-40 bg-white'>
      <Topbar />
      <Navbar />
      <div className="border-b border-gray-200"></div>
    </header>
  )
}

export default Header
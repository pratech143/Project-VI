
import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-blue shadow-2xl border-b-4 border-white">
    <Header/>
    <Outlet/>
    </div>
  )
}

export default Layout
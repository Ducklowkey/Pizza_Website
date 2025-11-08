import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import DashBoard from './pages/DashBoard/DashBoard'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Users from './pages/Users/Users'
import Messages from './pages/Messages/Messages'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className='app'>
      <ToastContainer/>
      {/* <Navbar/> */}
      <hr />
      <div className="app-content">
        <Sidebar/>
        <Routes>
          <Route path="/dashboard" element={<DashBoard/>}/>
          <Route path="/add" element={<Add/>}/>
          <Route path="/list" element={<List/>}/>
          <Route path="/orders" element={<Orders/>}/>
          <Route path="/users" element={<Users/>}/>
          <Route path="/messages" element={<Messages/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App

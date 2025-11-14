import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import DashBoard from './pages/DashBoard/DashBoard'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Users from './pages/Users/Users'
import Messages from './pages/Messages/Messages'
import AddCustomer from './pages/AddCustomer/AddCustomer'
import EditProduct from './pages/EditProduct/EditProduct'
import Settings from './pages/Settings/Settings'
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
          <Route path="/list/edit/:id" element={<EditProduct/>}/>
          <Route path="/orders" element={<Orders/>}/>
          <Route path="/users" element={<Users/>}/>
          <Route path="/users/add" element={<AddCustomer/>}/>
          <Route path="/messages" element={<Messages/>}/>
          <Route path="/settings" element={<Settings/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App

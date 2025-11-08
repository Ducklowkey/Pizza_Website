import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-header">  
        <img src={assets.logo} alt="logo" className='sidebar-logo-img' />
        <span className="sidebar-logo-text">
          PI<span className="logo-highlight">Z</span>ZA
        </span>
      </div>
      <div className="sidebar-options">
        <NavLink 
          to='/dashboard' 
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <h3>Dashboard</h3>
        </NavLink>
        <NavLink 
          to='/users' 
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">people</span>
          <h3>Customers</h3>
        </NavLink>
        <NavLink 
          to='/orders' 
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">receipt_long</span>
          <h3>Orders</h3>
        </NavLink>
        <NavLink 
          to='/' 
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">analytics</span>
          <h3>Analytics</h3>
        </NavLink>
        <NavLink 
          to='/' 
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">mail</span>
          <h3>Messages</h3>
          <span className="notification-badge">26</span>
        </NavLink>
        <NavLink 
          to='/list' 
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">inventory_2</span>
          <h3>Products</h3>
        </NavLink>
        <NavLink 
          to='/' 
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">assessment</span>
          <h3>Reports</h3>
        </NavLink>
        <NavLink 
          to='/' 
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">settings</span>
          <h3>Settings</h3>
        </NavLink>
        <NavLink 
          to='/add' 
          className={({ isActive }) => `sidebar-option ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">add_box</span>
          <h3>Add Product</h3>
        </NavLink>
      </div>
      <div className="sidebar-footer">
        <NavLink 
          to='/' 
          className={({ isActive }) => `sidebar-option logout ${isActive ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">logout</span>
          <h3>Logout</h3>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar

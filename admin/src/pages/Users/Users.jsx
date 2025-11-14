import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Users.css'
import { url } from '../../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';

const Users = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  const fetchUsers = async () => {
    const response = await axios.get(`${url}/api/user/list`)
    if(response.data.success)
    {
      setUsers(response.data.data);
    }
    else{
      toast.error("Error fetching users")
    }
  }

  useEffect(()=>{
    fetchUsers();
  },[])

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user._id?.toString().toLowerCase().includes(searchLower) ||
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );


  const handleView = (user) => {
    // View user details - you can implement a modal or navigate to detail page
    toast.info(`Viewing user: ${user.name}`);
  };

  const handleEdit = (user) => {
    // Edit user - you can implement edit functionality
    toast.info(`Editing user: ${user.name}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Note: Delete endpoint needs to be implemented in backend
        // For now, showing a message that this feature is not available
        toast.info('Delete functionality will be available soon');
        // Uncomment below when backend endpoint is ready:
        // const response = await axios.post(`${url}/api/user/remove`, { id: userId });
        // if (response.data.success) {
        //   toast.success('User deleted successfully');
        //   fetchUsers();
        // } else {
        //   toast.error('Error deleting user');
        // }
      } catch (error) {
        toast.error('Error deleting user');
      }
    }
  };

  const formatDate = (item) => {
    let createdDate = 'N/A';
    if (item.createdAt) {
      createdDate = new Date(item.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } else if (item._id) {
      try {
        const timestamp = parseInt(item._id.toString().substring(0, 8), 16) * 1000;
        createdDate = new Date(timestamp).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } catch (e) {
        createdDate = 'N/A';
      }
    }
    return createdDate;
  };

  return (
    <div className='users list'>
      <div className="users-header">
        <h1>Customer</h1>
        <div className="users-breadcrumb">
          <span>Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-active">Customer</span>
        </div>
      </div>

      <div className="users-actions-bar">
        <div className="search-container">
          <span className="material-symbols-outlined search-icon">search</span>
          <input 
            type="text" 
            placeholder="Search for id, name Customer" 
            className="search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="action-buttons">
          <button className="action-btn filter-btn">
            <span className="material-symbols-outlined">filter_list</span>
            Filter
          </button>
          <button className="action-btn export-btn">
            <span className="material-symbols-outlined">download</span>
            Export
          </button>
          <button 
            className="action-btn add-btn"
            onClick={() => navigate('/users/add')}
          >
            <span className="material-symbols-outlined">add</span>
            Add Customer
          </button>
        </div>
      </div>

      <div className='users-table'>
        <div className="users-table-format title">
          <b>ID</b>
          <b>Name Customer</b>
          <b>Email</b>
          <b>Cart Items</b>
          <b>Create Date</b>
          <b>Action</b>
        </div>
        {paginatedUsers.length === 0 ? (
          <div className="no-users">No customers found</div>
        ) : (
          paginatedUsers.map((item, index) => {
            const cartItemCount = item.cartData ? Object.keys(item.cartData).length : 0;
            const createdDate = formatDate(item);
            const userId = item._id;
            const userDisplayId = userId ? userId.toString().substring(18, 24) : `#${index + 1}`;
            
            return (
              <div key={index} className='users-table-format'>
                <p className="user-id-display">ID {userDisplayId}</p>
                <p className="user-name">{item.name || 'N/A'}</p>
                <p className="user-email">{item.email || 'N/A'}</p>
                <p className="cart-items">{cartItemCount} items</p>
                <p className="create-date">{createdDate}</p>
                <div className="action-icons">
                  <button 
                    className="action-icon-btn view-btn"
                    onClick={() => handleView(item)}
                    title="View"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button 
                    className="action-icon-btn edit-btn"
                    onClick={() => handleEdit(item)}
                    title="Edit"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button 
                    className="action-icon-btn delete-btn"
                    onClick={() => handleDelete(userId)}
                    title="Delete"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredUsers.length > 0 && (
        <div className="pagination">
          <span className="pagination-info">
            {((currentPage - 1) * usersPerPage) + 1}-{Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} Pages
          </span>
          <div className="pagination-controls">
            <span>The page on</span>
            <select 
              className="page-select"
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <option key={page} value={page}>{page}</option>
              ))}
            </select>
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users


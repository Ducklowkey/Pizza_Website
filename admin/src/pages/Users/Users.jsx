import React, { useEffect, useState } from 'react'
import './Users.css'
import { url } from '../../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';

const Users = () => {

  const [users, setUsers] = useState([]);
  
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

  return (
    <div className='users list'>
        <p>All Users</p>
        <div className='users-table'>
          <div className="users-table-format title">
            <b>ID</b>
            <b>Name</b>
            <b>Email</b>
            <b>Cart Items</b>
            <b>Created Date</b>
          </div>
          {users.map((item,index)=>{
            const cartItemCount = item.cartData ? Object.keys(item.cartData).length : 0;
            // Extract date from MongoDB ObjectId (first 4 bytes = timestamp)
            let createdDate = 'N/A';
            if (item.createdAt) {
              createdDate = new Date(item.createdAt).toLocaleDateString('vi-VN');
            } else if (item._id) {
              try {
                // MongoDB ObjectId contains timestamp in first 4 bytes
                const timestamp = parseInt(item._id.toString().substring(0, 8), 16) * 1000;
                createdDate = new Date(timestamp).toLocaleDateString('vi-VN');
              } catch (e) {
                createdDate = 'N/A';
              }
            }
            return (
              <div key={index} className='users-table-format'>
                <p>#{index + 1}</p>
                <p>{item.name}</p>
                <p>{item.email}</p>
                <p>{cartItemCount} items</p>
                <p>{createdDate}</p>
              </div>
            )
          })}
        </div>
    </div>
  )
}

export default Users


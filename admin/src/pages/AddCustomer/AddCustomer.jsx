import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddCustomer.css'
import { url } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const AddCustomer = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${url}/api/user/add`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Customer added successfully')
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          dateOfBirth: '',
          address: ''
        })
        // Navigate back to users page after 1 second
        setTimeout(() => {
          navigate('/users')
        }, 1000)
      } else {
        toast.error(response.data.message || 'Error adding customer')
      }
    } catch (error) {
      console.error('Error adding customer:', error)
      toast.error(error.response?.data?.message || 'Error adding customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='add-customer'>
      <div className="add-customer-header">
        <div className="add-customer-breadcrumb">
          <span>Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span>Customer</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-active">Add Customer</span>
        </div>
      </div>

      <div className="add-customer-card">
        <h1 className="add-customer-title">Customer</h1>
        <p className="add-customer-description">
          Lorem ipsum dolor sit amet consectetur. Non ac nulla aliquam aenean in velit mattis.
        </p>

        <form onSubmit={handleSubmit} className="add-customer-form">
          <div className="form-group">
            <label htmlFor="name">Name Customer</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Input name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Input email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">PhoneNumber</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Input phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Input password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                placeholder="Date of Birth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              placeholder="Input address"
              value={formData.address}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <button 
            type="submit" 
            className="save-customer-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Customer'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddCustomer


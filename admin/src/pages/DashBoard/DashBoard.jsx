import { useState, useEffect } from 'react'
import './DashBoard.css'
import { assets, url } from '../../assets/assets'
import axios from 'axios'

const DashBoard = () => {
  const [orders, setOrders] = useState([])
  const [totalSales, setTotalSales] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedDate, setSelectedDate] = useState('10 / 21 / 2021')
  const [adminName, setAdminName] = useState('Daniel')
  const [profileImage, setProfileImage] = useState(assets.profile_image)

  useEffect(() => {
    fetchOrders()
    fetchSettings()
    
    // Listen for settings updates
    const handleStorageChange = () => {
      fetchSettings()
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(() => {
      if (localStorage.getItem('settingsUpdated')) {
        fetchSettings()
        localStorage.removeItem('settingsUpdated')
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${url}/api/settings`)
      if (response.data.success) {
        const data = response.data.data
        if (data.adminName) {
          setAdminName(data.adminName)
        }
        if (data.profileImage) {
          setProfileImage(`${url}/images/${data.profileImage}`)
        } else {
          setProfileImage(assets.profile_image)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`)
      if (response.data.success) {
        const ordersData = response.data.data
        setOrders(ordersData.slice(0, 7)) // Get first 7 orders for recent orders
        
        // Calculate totals
        const sales = ordersData.reduce((sum, order) => sum + order.amount, 0)
        setTotalSales(sales)
        // For expenses, you might want to calculate from actual expenses data
        // For now, using a percentage of sales
        setTotalExpenses(sales * 0.57)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const totalIncome = totalSales - totalExpenses

  // Recent updates data (mock data - you can replace with real data)
  const recentUpdates = [
    {
      name: 'Mike Tyson',
      action: 'received his order of Night lion tech GPS drone.',
      time: '2 Minutes Ago',
      avatar: assets.profile_image
    },
    {
      name: 'Diana Ayi',
      action: 'declined her order of 2 DJI Air 2S.',
      time: '5 Minutes Ago',
      avatar: assets.profile_image
    },
    {
      name: 'Mandy Roy',
      action: 'received his order of LARVENDER KF102 Drone.',
      time: '6 Minutes Ago',
      avatar: assets.profile_image
    }
  ]

  // Sales analytics data
  const salesAnalytics = [
    {
      label: 'ONLINE ORDERS',
      value: '3849',
      change: '+39%',
      changeType: 'positive',
      icon: '🛒',
      color: 'purple'
    },
    {
      label: 'OFFLINE ORDERS',
      value: '1100',
      change: '-17%',
      changeType: 'negative',
      icon: '🛍️',
      color: 'red'
    },
    {
      label: 'NEW CUSTOMER',
      value: '849',
      change: '+25%',
      changeType: 'positive',
      icon: '👤',
      color: 'teal'
    }
  ]

  const getStatusColor = (status) => {
    if (status === 'Delivered') return 'success'
    if (status === 'Pending' || status === 'Food Processing') return 'warning'
    if (status === 'Declined') return 'danger'
    return 'info'
  }

  const formatPaymentStatus = (status) => {
    if (status === 'Paid') return 'Payment Paid'
    if (status === 'Refunded') return 'Payment Refunded'
    return 'Payment Due'
  }

  return (
    <div className='dashboard'>
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Dashboard</h1>
          <div className="date-picker">
            <span>{selectedDate}</span>
            <button onClick={() => setSelectedDate('')} className="date-clear">
              <img src={assets.close} alt="clear" />
            </button>
          </div>
        </div>
        <div className="dashboard-header-right">
          <div className="theme-toggle">
            <button 
              className={`theme-btn ${!isDarkMode ? 'active' : ''}`}
              onClick={() => setIsDarkMode(false)}
            >
              ☀️
            </button>
            <button 
              className={`theme-btn ${isDarkMode ? 'active' : ''}`}
              onClick={() => setIsDarkMode(true)}
            >
              🌙
            </button>
          </div>
          <div className="user-info">
            <div className="user-text">
              <p>Hey, {adminName}</p>
              <small>Admin</small>
            </div>
            <div className="profile-photo">
              <img src={profileImage} alt="profile" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-content">
            <div className="card-icon purple">
              <span className="material-symbols-outlined">bar_chart</span>
            </div>
            <div className="card-info">
              <h3>Total Sales</h3>
              <h2>${totalSales.toLocaleString()}</h2>
              <small>Last 24 Hours</small>
            </div>
          </div>
          <div className="card-chart">
            <div className="donut-chart purple" data-percent="81">
              <span>81%</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <div className="card-icon red">
              <span className="material-symbols-outlined">trending_down</span>
            </div>
            <div className="card-info">
              <h3>Total Expenses</h3>
              <h2>${totalExpenses.toLocaleString()}</h2>
              <small>Last 24 Hours</small>
            </div>
          </div>
          <div className="card-chart">
            <div className="donut-chart blue" data-percent="62">
              <span>62%</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-content">
            <div className="card-icon teal">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div className="card-info">
              <h3>Total Income</h3>
              <h2>${totalIncome.toLocaleString()}</h2>
              <small>Last 24 Hours</small>
            </div>
          </div>
          <div className="card-chart">
            <div className="donut-chart purple" data-percent="44">
              <span>44%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="dashboard-card recent-orders">
          <h2>Recent Orders</h2>
          <div className="orders-table">
            <div className="table-header">
              <p>Product Name</p>
              <p>Product Number</p>
              <p>Payment</p>
              <p>Status</p>
              <p>Details</p>
            </div>
            {orders.map((order, index) => (
              <div key={index} className="table-row">
                <p className="product-name">
                  {order.items.map((item, i) => 
                    i === order.items.length - 1 ? item.name : item.name + ', '
                  )}
                </p>
                <p className="product-number">{order._id.slice(-5)}</p>
                <p>{formatPaymentStatus(order.status)}</p>
                <p className={`status ${getStatusColor(order.status)}`}>
                  {order.status}
                </p>
                <a href="#" className="details-link">Details</a>
              </div>
            ))}
          </div>
          <a href="#" className="show-all">Show All</a>
        </div>

        {/* Recent Updates */}
        <div className="dashboard-card recent-updates">
          <h2>Recent Updates</h2>
          <div className="updates-list">
            {recentUpdates.map((update, index) => (
              <div key={index} className="update-item">
                <div className="profile-photo">
                  <img src={update.avatar} alt={update.name} />
                </div>
                <div className="update-content">
                  <p>
                    <b>{update.name}</b> {update.action}
                  </p>
                  <small>{update.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Analytics */}
        <div className="dashboard-card sales-analytics">
          <h2>Sales Analytics</h2>
          <div className="analytics-list">
            {salesAnalytics.map((item, index) => (
              <div key={index} className="analytics-item">
                <div className={`analytics-icon ${item.color}`}>
                  <span>{item.icon}</span>
                </div>
                <div className="analytics-content">
                  <p className="analytics-label">{item.label}</p>
                  <small>Last 24 Hours</small>
                  <div className="analytics-stats">
                    <span className={`change ${item.changeType}`}>
                      {item.change}
                    </span>
                    <h3>{item.value}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="add-product-btn">
            <span className="material-symbols-outlined">add</span>
            Add Product
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashBoard


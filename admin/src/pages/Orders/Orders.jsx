import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Orders.css'
import { toast } from 'react-toastify';
import axios from 'axios';
import { url } from '../../assets/assets';

const Order = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const fetchAllOrders = async () => {
    const response = await axios.get(`${url}/api/order/list`)
    if (response.data.success) {
      const ordersData = response.data.data.reverse();
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    }
    else {
      toast.error("Error fetching orders")
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [])

  // Filter orders by status
  useEffect(() => {
    let filtered = orders;

    // Filter by status tab
    if (activeTab === 'shipping') {
      filtered = filtered.filter(order => 
        order.status === 'Out for delivery' || order.status === 'Shipping'
      );
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(order => order.status === 'Delivered' || order.status === 'Completed');
    } else if (activeTab === 'cancel') {
      filtered = filtered.filter(order => order.status === 'Cancelled');
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        const orderId = order._id?.toString().toLowerCase() || '';
        const productNames = order.items?.map(item => item.name?.toLowerCase() || '').join(' ') || '';
        return orderId.includes(query) || productNames.includes(query);
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [activeTab, searchQuery, orders]);

  // Get counts for tabs
  const getOrderCounts = () => {
    const all = orders.length;
    const shipping = orders.filter(order => 
      order.status === 'Out for delivery' || order.status === 'Shipping'
    ).length;
    const completed = orders.filter(order => 
      order.status === 'Delivered' || order.status === 'Completed'
    ).length;
    const cancel = orders.filter(order => 
      order.status === 'Cancelled'
    ).length;
    return { all, shipping, completed, cancel };
  };

  const counts = getOrderCounts();

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const statusHandler = async (event, orderId) => {
    const response = await axios.post(`${url}/api/order/status`, {
      orderId,
      status: event.target.value
    })
    if (response.data.success) {
      await fetchAllOrders();
      toast.success('Order status updated');
    } else {
      toast.error('Error updating status');
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  }

  const getOrderId = (orderId) => {
    if (!orderId) return 'N/A';
    return orderId.toString().substring(18, 24);
  }

  const getStatusClass = (status) => {
    if (!status) return 'processing';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('shipping') || statusLower.includes('delivery')) return 'shipping';
    if (statusLower.includes('delivered') || statusLower.includes('completed')) return 'completed';
    if (statusLower.includes('cancel')) return 'cancelled';
    return 'processing';
  }

  const getStatusLabel = (status) => {
    if (!status) return 'Processing';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('shipping') || statusLower.includes('delivery')) return 'Shipping';
    if (statusLower.includes('delivered') || statusLower.includes('completed')) return 'Completed';
    if (statusLower.includes('cancel')) return 'Cancelled';
    return status;
  }


  return (
    <div className='orders'>
      <div className="orders-header">
        <h1>Orders</h1>
        <div className="orders-breadcrumb">
          <span>Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span>Orders</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-active">All Orders</span>
        </div>
      </div>

      <div className="orders-actions-bar">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search for iid, name product" 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="material-symbols-outlined search-icon-right">search</span>
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
        </div>
      </div>

      <div className="orders-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Orders ({counts.all})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
          onClick={() => setActiveTab('shipping')}
        >
          Shipping ({counts.shipping})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({counts.completed})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cancel' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancel')}
        >
          Cancel ({counts.cancel})
        </button>
      </div>

      <div className='orders-table'>
        <div className="orders-table-format title">
          <b>Orders</b>
          <b>Customer</b>
          <b>Price</b>
          <b>Date</b>
          <b>Payment</b>
          <b>Status</b>
        </div>
        {paginatedOrders.length === 0 ? (
          <div className="no-orders">No orders found</div>
        ) : (
          paginatedOrders.map((order, index) => {
            const customerName = order.address ? 
              `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() : 
              'N/A';
            const orderId = getOrderId(order._id);
            const productNames = order.items?.map(item => item.name).join(', ') || 'N/A';
            
            return (
              <div key={index} className='orders-table-format'>
                <div className="order-products">
                  <span className="order-id">ID {orderId}</span>
                  <span className="product-names">{productNames}</span>
                </div>
                <p className="customer-name">{customerName}</p>
                <p className="order-price">${order.amount?.toFixed(2) || '0.00'}</p>
                <p className="order-date">{formatDate(order.date)}</p>
                <div className="payment-status">
                  <span className={`status-tag ${order.payment ? 'paid' : 'unpaid'}`}>
                    {order.payment ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <div className="order-status">
                  <select 
                    value={order.status || 'Food Processing'} 
                    onChange={(e) => statusHandler(e, order._id)}
                    className={`status-select ${getStatusClass(order.status)}`}
                    title={getStatusLabel(order.status)}
                  >
                    <option value="Food Processing">Food Processing</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredOrders.length > 0 && (
        <div className="pagination">
          <span className="pagination-info">
            {((currentPage - 1) * ordersPerPage) + 1} - {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} Pages
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

export default Order

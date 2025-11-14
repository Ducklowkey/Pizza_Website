import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './List.css'
import { url } from '../../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';

const List = () => {
  const navigate = useNavigate()
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  
  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`)
    if(response.data.success) {
      setList(response.data.data);
      setFilteredList(response.data.data);
    }
    else {
      toast.error("Error fetching products")
    }
  }

  useEffect(() => {
    fetchList();
  }, [])

  // Filter products by category and search
  useEffect(() => {
    let filtered = list;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const productId = item._id?.toString().toLowerCase() || '';
        const productName = item.name?.toLowerCase() || '';
        return productId.includes(query) || productName.includes(query);
      });
    }

    setFilteredList(filtered);
    setCurrentPage(1);
  }, [activeCategory, searchQuery, list]);

  // Get category counts
  const getCategoryCounts = () => {
    const categories = ['Pizza', 'Salad', 'Sandwich', 'Cake', 'Pasta', 'Noodles'];
    const counts = {};
    categories.forEach(cat => {
      counts[cat.toLowerCase()] = list.filter(item => 
        item.category?.toLowerCase() === cat.toLowerCase()
      ).length;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // Pagination
  const totalPages = Math.ceil(filteredList.length / productsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const removeFood = async (foodId) => {
    const response = await axios.post(`${url}/api/food/remove`, {
      id: foodId
    })
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message);
    }
    else {
      toast.error("Error")
    }
  }

  const getProductId = (productId) => {
    if (!productId) return 'N/A';
    return productId.toString().substring(18, 24);
  }

  // Determine status (Available or Out of Stock)
  // Since we don't have quantity in the model, we'll use a simple logic
  // You can update this based on your actual data structure
  const getProductStatus = (item) => {
    // For now, we'll randomly assign or use a default
    // In a real app, this would be based on quantity or a status field
    return 'Available'; // Default to Available, you can add status field to model later
  }

  const handleView = (item) => {
    navigate(`/list/edit/${item._id}`);
  }

  const handleEdit = (item) => {
    navigate(`/list/edit/${item._id}`);
  }

  const getCategoryName = () => {
    if (activeCategory === 'all') return 'All Products';
    return activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
  }

  return (
    <div className='list'>
      <div className="list-header">
        <h1>Product</h1>
        <div className="list-breadcrumb">
          <span>Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span>Product</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-active">{getCategoryName()}</span>
        </div>
      </div>

      <div className="list-actions-bar">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search for id, name product" 
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
          <button 
            className="action-btn add-btn"
            onClick={() => navigate('/add')}
          >
            <span className="material-symbols-outlined">add</span>
            New Product
          </button>
        </div>
      </div>

      <div className="list-tabs">
        <button 
          className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Products ({list.length})
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'pizza' ? 'active' : ''}`}
          onClick={() => setActiveCategory('pizza')}
        >
          Pizza ({categoryCounts.pizza || 0})
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'salad' ? 'active' : ''}`}
          onClick={() => setActiveCategory('salad')}
        >
          Salad ({categoryCounts.salad || 0})
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'sandwich' ? 'active' : ''}`}
          onClick={() => setActiveCategory('sandwich')}
        >
          Sandwich ({categoryCounts.sandwich || 0})
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'cake' ? 'active' : ''}`}
          onClick={() => setActiveCategory('cake')}
        >
          Cake ({categoryCounts.cake || 0})
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'pasta' ? 'active' : ''}`}
          onClick={() => setActiveCategory('pasta')}
        >
          Pasta ({categoryCounts.pasta || 0})
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'noodles' ? 'active' : ''}`}
          onClick={() => setActiveCategory('noodles')}
        >
          Noodles ({categoryCounts.noodles || 0})
        </button>
      </div>

      <div className='list-table'>
        <div className="list-table-format title">
          <b>Product</b>
          <b>Price</b>
          <b>Category</b>
          <b>Status</b>
          <b>Action</b>
        </div>
        {paginatedList.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          paginatedList.map((item, index) => {
            const productId = getProductId(item._id);
            const status = getProductStatus(item);
            
            return (
              <div key={index} className='list-table-format'>
                <div className="product-cell">
                  <img src={`${url}/images/`+item.image} alt={item.name} />
                  <div className="product-info">
                    <span className="product-id">ID {productId}</span>
                    <span className="product-name">{item.name}</span>
                  </div>
                </div>
                <p className="product-price">${item.price?.toFixed(2) || '0.00'}</p>
                <p className="product-category">{item.category || 'N/A'}</p>
                <div className="product-status">
                  <span className={`status-tag ${status === 'Available' ? 'available' : 'out-of-stock'}`}>
                    {status}
                  </span>
                </div>
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
                    onClick={() => removeFood(item._id)}
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

      {filteredList.length > 0 && (
        <div className="pagination">
          <span className="pagination-info">
            {((currentPage - 1) * productsPerPage) + 1} - {Math.min(currentPage * productsPerPage, filteredList.length)} of {filteredList.length} Pages
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

export default List

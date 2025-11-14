import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './EditProduct.css'
import { url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [data, setData] = useState({
    name: "",
    description: "",
    category: "Pizza",
    price: "",
    quantity: "",
    status: "Available"
  });

  const [images, setImages] = useState([null, null, null, null]);
  const [existingImages, setExistingImages] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${url}/api/food/${id}`);
      if (response.data.success) {
        const product = response.data.data;
        setData({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "Pizza",
          price: product.price?.toString() || "",
          quantity: "",
          status: "Available"
        });
        // Set first image from existing product
        if (product.image) {
          const imageUrl = `${url}/images/${product.image}`;
          setExistingImages([imageUrl, null, null, null]);
        }
      } else {
        toast.error("Product not found");
        navigate('/list');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error("Error fetching product");
      navigate('/list');
    } finally {
      setFetching(false);
    }
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("id", id);
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    
    // Use the first uploaded image if available, otherwise keep existing
    if (images[0]) {
      formData.append("image", images[0]);
    }
    
    try {
      const response = await axios.post(`${url}/api/food/update`, formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setTimeout(() => {
          navigate('/list');
        }, 1000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error updating product");
    } finally {
      setLoading(false);
    }
  }

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
    // Clear existing image at this index when new image is uploaded
    const newExisting = [...existingImages];
    newExisting[index] = null;
    setExistingImages(newExisting);
  }

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard changes?')) {
      navigate('/list');
    }
  }

  const getCategoryName = () => {
    return data.category || 'Product';
  }

  if (fetching) {
    return (
      <div className='edit-product'>
        <div className="loading-message">Loading product...</div>
      </div>
    );
  }

  return (
    <div className='edit-product'>
      <div className="edit-product-header">
        <h1>Product</h1>
        <div className="edit-product-breadcrumb">
          <span>Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span>Product</span>
          <span className="breadcrumb-separator">›</span>
          <span>{getCategoryName()}</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-active">Edit Product</span>
        </div>
      </div>

      <div className="edit-product-content">
        <form className='edit-product-form' onSubmit={onSubmitHandler}>
          <div className="edit-product-form-grid">
            {/* Left Section: Product Information */}
            <div className="edit-product-section product-information">
              <h2 className="section-title">Product Information</h2>
              <p className="section-description">
                Lorem ipsum dolor sit amet consectetur. Non ac nulla aliquam aenean in velit mattis.
              </p>

              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Input product name"
                  value={data.name}
                  onChange={onChangeHandler}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Product Category</label>
                  <select
                    id="category"
                    name="category"
                    value={data.category}
                    onChange={onChangeHandler}
                    required
                  >
                    <option value="Pizza">Pizza</option>
                    <option value="Salad">Salad</option>
                    <option value="Sandwich">Sandwich</option>
                    <option value="Cake">Cake</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Noodles">Noodles</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Input Price"
                    value={data.price}
                    onChange={onChangeHandler}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Input description"
                  value={data.description}
                  onChange={onChangeHandler}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  placeholder="Input stock"
                  value={data.quantity}
                  onChange={onChangeHandler}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status Product</label>
                <select
                  id="status"
                  name="status"
                  value={data.status}
                  onChange={onChangeHandler}
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Right Section: Image Product */}
            <div className="edit-product-section image-product">
              <h2 className="section-title">Image Product</h2>
              <p className="image-note">
                Note: Format photos SVG, PNG, or JPG (Max size 4mb)
              </p>

              <div className="image-upload-grid">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="image-upload-box">
                    <label htmlFor={`image-${index}`} className="image-upload-label">
                      {images[index] ? (
                        <img
                          src={URL.createObjectURL(images[index])}
                          alt={`Product ${index + 1}`}
                          className="uploaded-image"
                        />
                      ) : existingImages[index] ? (
                        <img
                          src={existingImages[index]}
                          alt={`Product ${index + 1}`}
                          className="uploaded-image"
                        />
                      ) : (
                        <div className="image-placeholder">
                          <span className="material-symbols-outlined">image</span>
                        </div>
                      )}
                      <span className="photo-label">Photo {index + 1}</span>
                    </label>
                    <input
                      type="file"
                      id={`image-${index}`}
                      accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          if (e.target.files[0].size > 4 * 1024 * 1024) {
                            toast.error("Image size must be less than 4MB");
                            return;
                          }
                          handleImageChange(index, e.target.files[0]);
                        }
                      }}
                      hidden
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type='button' className='discard-btn' onClick={handleDiscard}>
              Discard Changes
            </button>
            <button type='submit' className='save-changes-btn' disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProduct


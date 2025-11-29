import { useState, useEffect, useContext } from 'react'
import './Settings.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Settings = () => {
  const { token, url, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error("Please sign in first");
      navigate('/');
      return;
    }
    fetchUserData();
  }, [token, url, navigate]);

  const fetchUserData = async () => {
    try {
      setFetching(true);
      const response = await axios.post(`${url}/api/user/userdata`, {}, { headers: { token } });
      if (response.data.success) {
        const data = response.data.data;
        const nameParts = (data.name || "").split(" ");
        setUserData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: data.email || "",
          address: data.address || ""
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error("Error fetching user data");
    } finally {
      setFetching(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password if changing
    if (passwordData.newPassword || passwordData.currentPassword || passwordData.confirmPassword) {
      if (!passwordData.currentPassword) {
        toast.error("Please enter current password");
        return;
      }
      if (passwordData.newPassword.length < 8) {
        toast.error("New password must be at least 8 characters");
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", `${userData.firstName} ${userData.lastName}`.trim());
      formData.append("address", userData.address);
      
      if (passwordData.newPassword) {
        formData.append("currentPassword", passwordData.currentPassword);
        formData.append("newPassword", passwordData.newPassword);
      }

      const response = await axios.post(`${url}/api/user/update`, formData, { 
        headers: { 
          token,
          'Content-Type': 'multipart/form-data'
        } 
      });
      
      if (response.data.success) {
        toast.success("Profile updated successfully!");
        await fetchUserData();
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast.error(response.data.message || "Error updating profile");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className='settings-page'>
        <div className="loading-message">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className='settings-page'>
      <div className="settings-container">
        <div className="settings-content">
          <div className="settings-main">
            <h2 className="settings-main-title">Edit Your Profile</h2>
            
            <form onSubmit={handleSubmit} className="settings-form">
              {/* Profile Information */}
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={userData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Changes */}
              <div className="form-section">
                <h3 className="section-title">Password Changes</h3>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    fetchUserData();
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

import { useState, useEffect } from 'react'
import './Settings.css'
import { url } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: "",
    copyright: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    adminName: ""
  });
  const [logo, setLogo] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${url}/api/settings`);
      if (response.data.success) {
        const data = response.data.data;
        setSettings({
          siteName: data.siteName || "",
          copyright: data.copyright || "",
          seoTitle: data.seoTitle || "",
          seoDescription: data.seoDescription || "",
          seoKeywords: data.seoKeywords || "",
          adminName: data.adminName || ""
        });
        if (data.profileImage) {
          setExistingLogo(`${url}/images/${data.profileImage}`);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error("Error fetching settings");
    } finally {
      setFetching(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].size > 4 * 1024 * 1024) {
        toast.error("Image size must be less than 4MB");
        return;
      }
      setLogo(e.target.files[0]);
      setExistingLogo(null);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("siteName", settings.siteName);
      formData.append("copyright", settings.copyright);
      formData.append("seoTitle", settings.seoTitle);
      formData.append("seoDescription", settings.seoDescription);
      formData.append("seoKeywords", settings.seoKeywords);
      formData.append("adminName", settings.adminName);
      
      if (logo) {
        formData.append("logo", logo);
      }

      const response = await axios.post(`${url}/api/settings/update`, formData);
      if (response.data.success) {
        toast.success(response.data.message);
        // Update localStorage to trigger Dashboard refresh
        localStorage.setItem('settingsUpdated', Date.now().toString());
        // Refresh settings
        await fetchSettings();
      } else {
        toast.error(response.data.message || "Error updating settings");
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error("Error updating settings");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className='settings'>
        <div className="loading-message">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className='settings'>
      <h1 className="settings-title">General Settings</h1>

      <div className="settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          {/* Logo Upload */}
          <div className="logo-upload-section">
            <label htmlFor="logo" style={{ cursor: 'pointer' }}>
              <div className="logo-preview">
                {logo ? (
                  <img src={URL.createObjectURL(logo)} alt="Logo preview" />
                ) : existingLogo ? (
                  <img src={existingLogo} alt="Logo" />
                ) : (
                  <div className="logo-placeholder">
                    <span className="material-symbols-outlined">camera_alt</span>
                  </div>
                )}
              </div>
            </label>
            <label htmlFor="logo" className="upload-logo-label">
              Upload Logo
            </label>
            <input
              type="file"
              id="logo"
              accept="image/svg+xml,image/png,image/jpeg,image/jpg"
              onChange={handleLogoChange}
              hidden
            />
          </div>

          {/* Form Fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="siteName">Site Name</label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                placeholder="Input site name"
                value={settings.siteName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminName">Admin Name</label>
              <input
                type="text"
                id="adminName"
                name="adminName"
                placeholder="Input admin name"
                value={settings.adminName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seoTitle">SEO Title</label>
              <input
                type="text"
                id="seoTitle"
                name="seoTitle"
                placeholder="Input SEO title"
                value={settings.seoTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="seoDescription">SEO Description</label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                placeholder="Input SEO description"
                value={settings.seoDescription}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seoKeywords">SEO Keywords</label>
              <input
                type="text"
                id="seoKeywords"
                name="seoKeywords"
                placeholder="Input SEO keywords"
                value={settings.seoKeywords}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="copyright">Copy Right</label>
              <input
                type="text"
                id="copyright"
                name="copyright"
                placeholder="Input copyright"
                value={settings.copyright}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings


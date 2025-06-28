import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminPrad.css';

const AdminProductForm = () => {
  const navigate = useNavigate();
  const productImageInputRef = useRef(null);
  const flavorImageInputRef = useRef(null);

  // Initialize form data with proper flavor structure
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    flavors_data: { flavours: [] },
    nicotine_level: '',
    description: '',
    image_base64: '',
    price: '',
    stock: '0',
    category: '',
    product_group: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    brand: '',
    price: '',
    flavors: '',
    global: ''
  });

  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newFlavor, setNewFlavor] = useState({
    name: '',
    image: null,
    imagePreview: ''
  });

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (newFlavor.imagePreview) URL.revokeObjectURL(newFlavor.imagePreview);
      if (formData.image_base64 && formData.image_base64.startsWith('blob:')) {
        URL.revokeObjectURL(formData.image_base64);
      }
    };
  }, [newFlavor.imagePreview, formData.image_base64]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name': return value.trim() ? '' : 'Product name is required';
      case 'brand': return value.trim() ? '' : 'Brand name is required';
      case 'price':
        if (!value) return 'Price is required';
        if (isNaN(parseFloat(value))) return 'Price must be a number';
        if (parseFloat(value) <= 0) return 'Price must be greater than 0';
        return '';
      case 'stock':
        if (isNaN(parseInt(value))) return 'Stock must be a number';
        if (parseInt(value) < 0) return 'Stock cannot be negative';
        return '';
      default: return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleFlavorNameChange = (e) => {
    setNewFlavor(prev => ({ ...prev, name: e.target.value }));
    setErrors(prev => ({ ...prev, flavors: '' }));
  };

  const validateImage = (file, maxSize) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Only JPG, PNG, or WEBP images are allowed';
    }
    if (file.size > maxSize) {
      return `Image must be less than ${maxSize / (1024 * 1024)}MB`;
    }
    return '';
  };

  const handleFlavorImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImage(file, 2 * 1024 * 1024);
    if (error) {
      setErrors(prev => ({ ...prev, flavors: error }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewFlavor(prev => ({
        ...prev,
        image: reader.result,
        imagePreview: URL.createObjectURL(file)
      }));
    };
    reader.readAsDataURL(file);
    flavorImageInputRef.current.value = '';
  };

  const addFlavor = () => {
    if (!newFlavor.name.trim()) {
      setErrors(prev => ({ ...prev, flavors: 'Flavor name is required' }));
      return;
    }

    if (!newFlavor.image) {
      setErrors(prev => ({ ...prev, flavors: 'Flavor image is required' }));
      return;
    }

    const flavorExists = formData.flavors_data.flavours.some(
      flavor => flavor.flr.toLowerCase() === newFlavor.name.trim().toLowerCase()
    );

    if (flavorExists) {
      setErrors(prev => ({ ...prev, flavors: 'This flavor already exists' }));
      return;
    }

    const cleanImageString = newFlavor.image.replace(/^data:image\/\w+;base64,/, '');

    setFormData(prev => ({
      ...prev,
      flavors_data: {
        flavours: [
          ...prev.flavors_data.flavours,
          {
            flr: newFlavor.name.trim(),
            imagestring: cleanImageString
          }
        ]
      }
    }));

    setNewFlavor({
      name: '',
      image: null,
      imagePreview: ''
    });
  };

  const removeFlavor = (index) => {
    setFormData(prev => {
      const updatedFlavours = [...prev.flavors_data.flavours];
      updatedFlavours.splice(index, 1);
      return {
        ...prev,
        flavors_data: {
          flavours: updatedFlavours
        }
      };
    });
  };

  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImage(file, 5 * 1024 * 1024);
    if (error) {
      setErrors(prev => ({ ...prev, global: error }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const cleanImageString = reader.result.replace(/^data:image\/\w+;base64,/, '');
      setFormData(prev => ({
        ...prev,
        image_base64: cleanImageString
      }));
    };
    reader.readAsDataURL(file);
    productImageInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField('name', formData.name),
      brand: validateField('brand', formData.brand),
      price: validateField('price', formData.price),
      stock: validateField('stock', formData.stock),
      flavors: '',
      global: ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ ...errors, global: '' });
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        is_active: true
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/products`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      setSuccess('Product created successfully!');
      setTimeout(() => navigate('/admin/products'), 2000);

    } catch (err) {
      console.error('Product creation error:', err);
      
      let errorMessage = 'Failed to create product';
      if (err.response) {
        if (err.response.status === 413) {
          errorMessage = 'Image file size is too large';
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
          if (err.response.data.details) {
            errorMessage += `: ${err.response.data.details}`;
          }
        }
      }
      
      setErrors(prev => ({ ...prev, global: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some(error => error);

  return (
    <div className="admin-product-container">
       <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back
      </button>
      <h1 className="admin-product-header">Add New Product</h1>
      
      {errors.global && <div className="admin-status-message error-message">{errors.global}</div>}
      {success && <div className="admin-status-message success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="admin-product-form">
        <div className="admin-form-grid">
          {/* Name */}
          <div className="admin-input-group">
            <label className="admin-input-label">Product Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`admin-input-field ${errors.name ? 'error' : ''}`}
              placeholder="Enter product name"
              autoFocus
            />
            {errors.name && <span className="admin-field-error">{errors.name}</span>}
          </div>

          {/* Brand */}
          <div className="admin-input-group">
            <label className="admin-input-label">Brand*</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className={`admin-input-field ${errors.brand ? 'error' : ''}`}
              placeholder="Enter brand name"
            />
            {errors.brand && <span className="admin-field-error">{errors.brand}</span>}
          </div>

          {/* Price */}
          <div className="admin-input-group">
            <label className="admin-input-label">Price*</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              className={`admin-input-field ${errors.price ? 'error' : ''}`}
              placeholder="0.00"
            />
            {errors.price && <span className="admin-field-error">{errors.price}</span>}
          </div>

          {/* Stock */}
          <div className="admin-input-group">
            <label className="admin-input-label">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className={`admin-input-field ${errors.stock ? 'error' : ''}`}
              placeholder="0"
            />
            {errors.stock && <span className="admin-field-error">{errors.stock}</span>}
          </div>

          {/* Category */}
          <div className="admin-input-group">
            <label className="admin-input-label">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="admin-input-field"
              placeholder="Enter category"
            />
          </div>

          {/* Product Group */}
          <div className="admin-input-group">
            <label className="admin-input-label">Product Group</label>
            <input
              type="text"
              name="product_group"
              value={formData.product_group}
              onChange={handleChange}
              className="admin-input-field"
              placeholder="Enter product group"
            />
          </div>

          {/* Nicotine Level */}
          <div className="admin-input-group">
            <label className="admin-input-label">Nicotine Level</label>
            <select
              name="nicotine_level"
              value={formData.nicotine_level}
              onChange={handleChange}
              className="admin-input-field"
            >
              <option value="">Select level</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Product Image */}
        <div className="admin-input-group">
          <label className="admin-input-label">Product Image (max 5MB)</label>
          <div className="admin-file-upload">
            <input
              type="file"
              id="product-image-upload"
              accept="image/*"
              onChange={handleProductImageUpload}
              className="admin-file-input"
              ref={productImageInputRef}
            />
            <label htmlFor="product-image-upload" className="admin-file-upload-button">
              {formData.image_base64 ? 'Change Image' : 'Select Product Image'}
            </label>
          </div>
          {formData.image_base64 && (
            <div className="admin-image-preview-container">
              <img 
                src={`data:image/jpeg;base64,${formData.image_base64}`} 
                alt="Product Preview" 
                className="admin-image-preview"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="admin-input-group">
          <label className="admin-input-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="admin-input-field"
            placeholder="Enter product description"
          />
        </div>

        {/* Flavors Section */}
        <div className="admin-flavors-section">
          <h2 className="admin-flavors-header">Flavors</h2>
          
          {/* Add New Flavor */}
          <div className="admin-input-group">
            <label className="admin-input-label">Add New Flavor (max 2MB)</label>
            <div className="admin-flavor-form-grid">
              <div className="admin-flavor-input-group">
                <input
                  type="text"
                  value={newFlavor.name}
                  onChange={handleFlavorNameChange}
                  className={`admin-input-field ${errors.flavors ? 'error' : ''}`}
                  placeholder="Flavor Name"
                />
              </div>
              <div className="admin-flavor-input-group">
                <div className="admin-file-upload">
                  <input
                    type="file"
                    id="flavor-image-upload"
                    accept="image/*"
                    onChange={handleFlavorImageChange}
                    className="admin-file-input"
                    ref={flavorImageInputRef}
                  />
                  <label htmlFor="flavor-image-upload" className="admin-file-upload-button">
                    {newFlavor.image ? 'Change Image' : 'Select Flavor Image'}
                  </label>
                </div>
              </div>
              <div className="admin-flavor-input-group">
                <button
                  type="button"
                  onClick={addFlavor}
                  className="admin-submit-button admin-flavor-button"
                >
                  Add Flavor
                </button>
              </div>
            </div>
            {errors.flavors && <span className="admin-field-error">{errors.flavors}</span>}
            {newFlavor.imagePreview && (
              <div className="admin-image-preview-container">
                <img 
                  src={newFlavor.imagePreview} 
                  alt="Flavor Preview" 
                  className="admin-image-preview"
                  style={{ maxHeight: '100px' }}
                />
              </div>
            )}
          </div>

          {/* Added Flavors List */}
          {formData.flavors_data.flavours.length > 0 && (
            <div className="admin-input-group">
              <h3 className="admin-input-label">Added Flavors</h3>
              <div className="admin-flavors-grid">
                {formData.flavors_data.flavours.map((flavor, index) => (
                  <div key={index} className="admin-flavor-card">
                    <div className="admin-flavor-name">{flavor.flr}</div>
                    <div className="admin-image-preview-container">
                      <img 
                        src={`data:image/jpeg;base64,${flavor.imagestring}`} 
                        alt={flavor.flr} 
                        className="admin-image-preview"
                        style={{ maxHeight: '80px' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFlavor(index)}
                      className="admin-remove-flavor-button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="admin-submit-container">
          <button
            type="submit"
            disabled={isLoading || hasErrors}
            className="admin-submit-button"
          >
            {isLoading ? (
              <>
                <span className="admin-spinner"></span>
                Creating Product...
              </>
            ) : (
              'Create Product'
            )}

            
          </button>
            
        </div>
        {errors.global && <div className="admin-status-message error-message">{errors.global}</div>}
      {success && <div className="admin-status-message success-message">{success}</div>}
      </form>
    </div>
  );
};

export default AdminProductForm;
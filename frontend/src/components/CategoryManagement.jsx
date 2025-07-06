import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './CategoryManagement.css';
import { useNavigate } from 'react-router-dom';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const navigate=useNavigate()

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch categories from the API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://e-commerce-web-application-k9ho.onrender.com/api/admin/categories');
      const data = response.data;
      const normalizedCategories = Array.isArray(data) ? data : 
                                (Array.isArray(data?.categories) ? data.categories : []);
      setCategories(normalizedCategories);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open modal for adding or editing a category
  const openModal = (category = null) => {
    setCurrentCategory(category);
    setFormData({
      name: category?.name || '',
      description: category?.description || '',
      is_active: category?.is_active ?? true
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
  };

  // Handle form submission for adding or updating a category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCategory) {
        await axios.put(
          `https://e-commerce-web-application-k9ho.onrender.com/api/admin/categories/${currentCategory.id}`, 
          formData
        );
        showNotification('Category updated successfully!');
      } else {
        await axios.post(
          'https://e-commerce-web-application-k9ho.onrender.com/api/admin/categories', 
          formData
        );
        showNotification('Category created successfully!');
      }
      closeModal();
      fetchCategories();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save category', 'error');
    }
  };

  // Delete a category
  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(
        `https://e-commerce-web-application-k9ho.onrender.com/api/admin/categories/${categoryId}`
      );
      showNotification('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="category-management">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back
      </button>
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            className="notification-close" 
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          >
            &times;
          </button>
        </div>
      )}

      <div className="header">
        <h1>Category Management</h1>
        <p>Manage your product categories and their visibility</p>
      </div>

      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search categories..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button
          onClick={() => openModal()}
          className="add-button"
        >
          <span>+</span> Add Category
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="empty-state loading">
            <div className="spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : (
          <>
            <div className="table-header">
              <div>Category</div>
              <div>Description</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div key={category.id} className="table-row">
                  <div className="category-name">{category.name}</div>
                  <div className="category-description">
                    {category.description || <span className="no-description">No description</span>}
                  </div>
                  <div>
                    <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="action-buttons">
                    <button
                      onClick={() => openModal(category)}
                      className="action-button edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="action-button delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <h3>{searchTerm ? 'No matching categories found' : 'No categories yet'}</h3>
                <p>
                  {searchTerm 
                    ? 'Try adjusting your search query' 
                    : 'Get started by creating a new category'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => openModal()}
                    className="add-button"
                  >
                    <span>+</span> New Category
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h2 className="modal-header">
              {currentCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="e.g. Electronics, Clothing"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-input"
                  placeholder="Optional description for the category"
                />
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_active" className="checkbox-label">
                  Active (visible to customers)
                </label>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                >
                  {currentCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
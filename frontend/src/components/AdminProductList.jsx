import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminProductList.css';
 

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || "https://e-commerce-web-application-k9ho.onrender.com"}/api/admin/products`
      );
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setLocalLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || 'https://e-commerce-web-application-k9ho.onrender.com/api/products'}/api/admin/products/${productId}`
      );
      setSuccess('Product deleted successfully');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete product');
      console.error('Delete product error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      setLocalLoading(true);
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://e-commerce-web-application-k9ho.onrender.com/api/products'}/api/admin/products/${productId}/status`,
        { is_active: !currentStatus }
      );
      setSuccess(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update product status');
      console.error('Toggle status error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const startEditing = (product) => {
    setEditingProduct({
      ...product,
      flavors_data: product.flavors_data || { flavours: [] }
    });
    setIsModalOpen(true);
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setEditingProduct(prev => ({
        ...prev,
        image_base64: base64String
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFlavorChange = (index, field, value) => {
    setEditingProduct(prev => {
      const updatedFlavors = [...prev.flavors_data.flavours];
      updatedFlavors[index][field] = value;
      return {
        ...prev,
        flavors_data: {
          flavours: updatedFlavors
        }
      };
    });
  };

  const removeFlavorImage = (index) => {
    setEditingProduct(prev => {
      const updatedFlavors = [...prev.flavors_data.flavours];
      updatedFlavors[index].imagestring = '';
      return {
        ...prev,
        flavors_data: {
          flavours: updatedFlavors
        }
      };
    });
  };

  const removeFlavor = (index) => {
    setEditingProduct(prev => {
      const updatedFlavors = [...prev.flavors_data.flavours];
      updatedFlavors.splice(index, 1);
      return {
        ...prev,
        flavors_data: {
          flavours: updatedFlavors
        }
      };
    });
  };

  const addFlavor = () => {
    setEditingProduct(prev => ({
      ...prev,
      flavors_data: {
        flavours: [
          ...prev.flavors_data.flavours,
          { 
            flr: '', 
            stock: 0,
            vat: 20
          }
        ]
      }
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLocalLoading(true);
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'https://e-commerce-web-application-k9ho.onrender.com/api/products'}/api/admin/products/${editingProduct.id}`,
        editingProduct
      );
      setSuccess('Product updated successfully');
      cancelEditing();
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update product');
      console.error('Update product error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="admin-product-list-container">
      {/* Global Loading Popup */}
      {loading && (
        <div className="admin-loading-popup">
          <div className="admin-loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      )}

      {/* Local Loading Popup */}
      {localLoading && (
        <div className="admin-local-loading-popup">
          <div className="admin-loading-spinner"></div>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="admin-back-button">
        <i className="fas fa-arrow-left"></i> Back to Dashboard
      </button>
      
      <div className="admin-product-list-header">
        <h1><i className="fas fa-cubes"></i> Product Management</h1>
        <button 
          onClick={() => navigate('/admin/product/new')} 
          className="admin-add-product-button"
        >
          <i className="fas fa-plus"></i> Add New Product
        </button>

        <button 
          onClick={() => navigate('/admin/product/category')} 
          className="admin-add-category-button"
        >
          <i className="fas fa-plus"></i> Add New Category
        </button>
      </div>

      {error && (
        <div className="admin-message admin-error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
      {success && (
        <div className="admin-message admin-success-message">
          <i className="fas fa-check-circle"></i> {success}
        </div>
      )}

      {loading && !products.length ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          Loading products...
        </div>
      ) : (
        <div className="admin-product-list">
          {products.length === 0 ? (
            <div className="admin-no-products">
              <i className="fas fa-box-open"></i>
              <p>No products found</p>
              <button 
                onClick={() => navigate('/admin/product/new')} 
                className="admin-add-product-button"
              >
                <i className="fas fa-plus"></i> Create Your First Product
              </button>
            </div>
          ) : (
            <div className="admin-product-table-container">
              <table className="admin-product-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Flavors</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        {product.image_base64 && (
                          <div className="admin-product-image-container">
                            <img
                              src={`data:image/jpeg;base64,${product.image_base64}`}
                              alt={product.name}
                              className="admin-product-thumbnail"
                            />
                          </div>
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td>{product.brand}</td>
                      <td>${product.price}</td>
                      <td>{product.stock}</td>
                      <td>
                        {product.flavors_data?.flavours?.length || 0} flavors
                      </td>
                      <td>
                        <span className={`admin-status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                          {product.is_active ? (
                            <>
                              <i className="fas fa-check-circle"></i> Active
                            </>
                          ) : (
                            <>
                              <i className="fas fa-times-circle"></i> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="admin-action-buttons">
                          <button
                            onClick={() => startEditing(product)}
                            className="admin-edit-button"
                            disabled={localLoading}
                          >
                            {localLoading ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <>
                                <i className="fas fa-edit"></i> Edit
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="admin-delete-button"
                            disabled={localLoading}
                          >
                            {localLoading ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <>
                                <i className="fas fa-trash"></i> Delete
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => toggleProductStatus(product.id, product.is_active)}
                            className={`admin-status-button ${product.is_active ? 'deactivate' : 'activate'}`}
                            disabled={localLoading}
                          >
                            {localLoading ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : product.is_active ? (
                              <>
                                <i className="fas fa-toggle-off"></i> Deactivate
                              </>
                            ) : (
                              <>
                                <i className="fas fa-toggle-on"></i> Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <button className="admin-modal-close" onClick={cancelEditing}>
              <i className="fas fa-times"></i>
            </button>
            <h2 className="admin-modal-header">
              <i className="fas fa-edit"></i> Edit Product
            </h2>
            
            <form onSubmit={handleEditSubmit} className="admin-edit-form">
              <div className="admin-edit-form-grid">
                <div className="admin-edit-form-group">
                  <label>
                    <i className="fas fa-image"></i> Main Product Image
                  </label>
                  <div className="admin-image-upload-container">
                    <label className="admin-image-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageUpload}
                        className="admin-image-upload-input"
                      />
                      <span className="admin-image-upload-button">
                        <i className="fas fa-cloud-upload-alt"></i> Choose Image
                      </span>
                    </label>
                    {editingProduct.image_base64 && (
                      <div className="admin-current-image-container">
                        <img
                          src={`data:image/jpeg;base64,${editingProduct.image_base64}`}
                          alt="Current product"
                          className="admin-current-image-preview"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingProduct(prev => ({
                            ...prev,
                            image_base64: null
                          }))}
                          className="admin-remove-image-button"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-edit-form-group">
                  <label>
                    <i className="fas fa-tag"></i> Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editingProduct.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="admin-edit-form-group">
                  <label>
                    <i className="fas fa-building"></i> Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={editingProduct.brand}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="admin-edit-form-group">
                  <label>
                    <i className="fas fa-dollar-sign"></i> Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={editingProduct.price}
                    onChange={handleEditChange}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div className="admin-edit-form-group">
                  <label>
                    <i className="fas fa-boxes"></i> Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={editingProduct.stock}
                    onChange={handleEditChange}
                    min="0"
                  />
                </div>

                <div className="admin-edit-form-group">
                  <label>
                    <i className="fas fa-smoking"></i> Nicotine Level
                  </label>
                  <select
                    name="nicotine_level"
                    value={editingProduct.nicotine_level || ''}
                    onChange={handleEditChange}
                  >
                    <option value="">Select</option>
                    <option value="10 mg">10 mg</option>
                    <option value="20 mg">20 mg</option>
                  </select>
                </div>

                <div className="admin-edit-form-group">
                  <label>
                    <i className="fas fa-list"></i> Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={editingProduct.category || ''}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="admin-edit-form-group">
                  <label>
                    <i className="fas fa-layer-group"></i> Product Group
                  </label>
                  <input
                    type="text"
                    name="product_group"
                    value={editingProduct.product_group || ''}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="admin-edit-form-group admin-full-width">
                  <label>
                    <i className="fas fa-align-left"></i> Description
                  </label>
                  <textarea
                    name="description"
                    value={editingProduct.description || ''}
                    onChange={handleEditChange}
                    rows="4"
                  />
                </div>

                <div className="admin-flavors-edit-section admin-full-width">
                  <h4>
                    <i className="fas fa-ice-cream"></i> Flavors
                  </h4>
                  {editingProduct.flavors_data.flavours.map((flavor, index) => (
                    <div key={index} className="admin-flavor-edit-item">
                      <div className="admin-flavor-input-group">
                        <label>Flavor Name</label>
                        <input
                          type="text"
                          value={flavor.flr}
                          onChange={(e) => handleFlavorChange(index, 'flr', e.target.value)}
                          placeholder="Flavor name"
                          required
                        />
                      </div>

                      <div className="admin-flavor-input-group">
                        <label>Stock</label>
                        <input
                          type="number"
                          value={flavor.stock || 0}
                          onChange={(e) => handleFlavorChange(index, 'stock', e.target.value)}
                          min="0"
                          placeholder="Stock"
                        />
                      </div>

                      <div className="admin-flavor-input-group">
                        <label>VAT (%)</label>
                        <input
                          type="number"
                          value={flavor.vat || 20}
                          onChange={(e) => handleFlavorChange(index, 'vat', e.target.value)}
                          min="0"
                          step="0.1"
                          placeholder="VAT %"
                        />
                      </div>

                      {flavor.imagestring && (
                        <div className="admin-current-image-container">
                          <img
                            src={`data:image/jpeg;base64,${flavor.imagestring}`}
                            alt={flavor.flr}
                            className="admin-flavor-image-preview"
                          />
                          <button
                            type="button"
                            onClick={() => removeFlavorImage(index)}
                            className="admin-remove-image-button"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFlavor(index)}
                        className="admin-remove-flavor-button"
                      >
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFlavor}
                    className="admin-add-flavor-button"
                  >
                    <i className="fas fa-plus"></i> Add Flavor
                  </button>
                </div>

                <div className="admin-edit-form-buttons admin-full-width">
                  <button 
                    type="submit" 
                    className="admin-save-button"
                    disabled={localLoading}
                  >
                    {localLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="admin-cancel-button"
                    disabled={localLoading}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
       
    </div>
  );
};

export default AdminProductList;
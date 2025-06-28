import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminProductList.css';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/products`
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
      setLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/products/${productId}`
      );
      setSuccess('Product deleted successfully');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete product');
      console.error('Delete product error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      setLoading(true);
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/products/${productId}/status`,
        { is_active: !currentStatus }
      );
      setSuccess(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update product status');
      console.error('Toggle status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (product) => {
    setEditingProduct({
      ...product,
      flavors_data: product.flavors_data || { flavours: [] }
    });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleFlavorImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setEditingProduct(prev => {
        const updatedFlavors = [...prev.flavors_data.flavours];
        updatedFlavors[index].imagestring = base64String;
        return {
          ...prev,
          flavors_data: {
            flavours: updatedFlavors
          }
        };
      });
    };
    reader.readAsDataURL(file);
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
          { flr: '', imagestring: '' }
        ]
      }
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/products/${editingProduct.id}`,
        editingProduct
      );
      setSuccess('Product updated successfully');
      setEditingProduct(null);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update product');
      console.error('Update product error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-product-list-container">
      <div className="admin-product-list-header">
        <h1>Product Management</h1>
        <button onClick={() => navigate('/admin/product/new')} className="admin-add-product-button">
          Add New Product
        </button>
      </div>

      {error && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-success-message">{success}</div>}

      {loading && !products.length ? (
        <div className="admin-loading">Loading products...</div>
      ) : (
        <div className="admin-product-list">
          {products.length === 0 ? (
            <div className="admin-no-products">No products found</div>
          ) : (
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
                  <React.Fragment key={product.id}>
                    {editingProduct?.id === product.id ? (
                      <tr className="admin-edit-form-row">
                        <td colSpan="8">
                          <form onSubmit={handleEditSubmit} className="admin-edit-form">
                            <div className="admin-edit-form-grid">
                              <div className="admin-edit-form-group">
                                <label>Name</label>
                                <input
                                  type="text"
                                  name="name"
                                  value={editingProduct.name}
                                  onChange={handleEditChange}
                                  required
                                />
                              </div>
                              <div className="admin-edit-form-group">
                                <label>Brand</label>
                                <input
                                  type="text"
                                  name="brand"
                                  value={editingProduct.brand}
                                  onChange={handleEditChange}
                                  required
                                />
                              </div>
                              <div className="admin-edit-form-group">
                                <label>Price</label>
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
                                <label>Stock</label>
                                <input
                                  type="number"
                                  name="stock"
                                  value={editingProduct.stock}
                                  onChange={handleEditChange}
                                  min="0"
                                />
                              </div>
                              <div className="admin-edit-form-group">
                                <label>Nicotine Level</label>
                                <select
                                  name="nicotine_level"
                                  value={editingProduct.nicotine_level || ''}
                                  onChange={handleEditChange}
                                >
                                  <option value="">Select</option>
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>
                              <div className="admin-edit-form-group">
                                <label>Category</label>
                                <input
                                  type="text"
                                  name="category"
                                  value={editingProduct.category || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                              <div className="admin-edit-form-group">
                                <label>Product Group</label>
                                <input
                                  type="text"
                                  name="product_group"
                                  value={editingProduct.product_group || ''}
                                  onChange={handleEditChange}
                                />
                              </div>
                              <div className="admin-edit-form-group">
                                <label>Description</label>
                                <textarea
                                  name="description"
                                  value={editingProduct.description || ''}
                                  onChange={handleEditChange}
                                  rows="3"
                                />
                              </div>

                              <div className="admin-flavors-edit-section">
                                <h4>Flavors</h4>
                                {editingProduct.flavors_data.flavours.map((flavor, index) => (
                                  <div key={index} className="admin-flavor-edit-item">
                                    <input
                                      type="text"
                                      value={flavor.flr}
                                      onChange={(e) => handleFlavorChange(index, 'flr', e.target.value)}
                                      placeholder="Flavor name"
                                      required
                                    />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFlavorImageUpload(e, index)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeFlavor(index)}
                                      className="admin-remove-flavor-button"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={addFlavor}
                                  className="admin-add-flavor-button"
                                >
                                  Add Flavor
                                </button>
                              </div>

                              <div className="admin-edit-form-buttons">
                                <button type="submit" className="admin-save-button">
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="admin-cancel-button"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td>
                          {product.image_base64 && (
                            <img
                              src={`data:image/jpeg;base64,${product.image_base64}`}
                              alt={product.name}
                              className="admin-product-thumbnail"
                            />
                          )}
                        </td>
                        <td>{product.name}</td>
                        <td>{product.brand}</td>
                        <td>${product.price}</td>
                        <td>{product.stock}</td>
                        <td>
                          {product.flavors_data?.flavours?.length > 0 ? (
                            <div className="admin-flavor-badges">
                              {product.flavors_data.flavours.map((flavor, i) => (
                                <span key={i} className="admin-flavor-badge">
                                  {flavor.flr}
                                  {flavor.imagestring && (
                                    <img
                                      src={`data:image/jpeg;base64,${flavor.imagestring}`}
                                      alt={flavor.flr}
                                      className="admin-flavor-image"
                                    />
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            'No flavors'
                          )}
                        </td>
                        <td>
                          <span className={`admin-status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-action-buttons">
                            <button
                              onClick={() => startEditing(product)}
                              className="admin-edit-button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="admin-delete-button"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                              className={`admin-status-button ${product.is_active ? 'deactivate' : 'activate'}`}
                            >
                              {product.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProductList;

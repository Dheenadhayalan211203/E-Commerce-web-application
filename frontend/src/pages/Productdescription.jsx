import { useParams } from 'react-router-dom';
import ProductDisplay from '../components/productdisplay';
import Navigation from '../components/Navigationbar';
import './Productdescription.css'; // Import the CSS file

const Product = () => {
  const { id } = useParams();
   
  return (
    <div className="product-page-container">
      <Navigation />
      <main className="product-main-content">
        <ProductDisplay id={id} />
      </main>
    </div>
  );
};

export default Product;
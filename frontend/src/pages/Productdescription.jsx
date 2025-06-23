import { useParams } from 'react-router-dom';
import ProductDisplay from '../components/productdisplay';
import Navigation from '../components/Navigationbar';

const Product = () => {
  const { id } = useParams();
   
  return(
    <>
    <Navigation/>
    <ProductDisplay id={id}/>
    </>
  )
};

export default Product
import { useContext, useState, useEffect } from 'react';
import { usecontext } from "../App"; // Use the exact same name as exported
import AdminProductForm from '../components/Adminprad';

const AdminProductAdd = () => {
    const { user, handleLogout } = useContext(usecontext); // lowercase
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
 

    return  <AdminProductForm /> 
}

export default AdminProductAdd;
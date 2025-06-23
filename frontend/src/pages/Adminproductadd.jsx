import { useContext, useState, useEffect } from 'react';
import { usecontext } from "../App";

const AdminProductAdd = () => {
    const { user, handleLogout } = useContext(usecontext);
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        // Check if IsAdmin equals 1 (number)
        if (user?.IsAdmin === 1) {
            setAdmin(true);
        } else {
            setAdmin(false); // Explicitly set false if not admin
        }
    }, [user]);

    return (
        <>
            {admin ? (
                <div>Admin Content Here</div>
            ) : (
                <div>Regular User Content</div>
            )}
        </>
    );
}

export default AdminProductAdd;
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">RideShare</Link>

            <div className="navbar-links">
                {user ? (
                    <>
                        <span className="navbar-user">Hi, {user.name}</span>
                        <Link to="/dashboard" className="navbar-link">Trips</Link>
                        <button onClick={handleLogout} className="btn btn-dark">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-dark">Log in</Link>
                        <Link to="/register" className="btn btn-primary">Sign up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
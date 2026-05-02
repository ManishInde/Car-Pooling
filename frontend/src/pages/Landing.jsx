import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user } = useAuth();

    return (
        <div className="landing">
            <div className="landing-content">
                <h1 className="landing-title">Go anywhere<br />with Ride Share</h1>
                <p className="landing-subtitle">
                    University carpooling made simple. Find rides, share costs, travel together.
                </p>
                <div className="landing-actions">
                    {user ? (
                        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/register" className="btn btn-primary">Get started</Link>
                            <Link to="/login" className="btn btn-dark">Sign in</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Landing;
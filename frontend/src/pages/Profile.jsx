import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { token } = useAuth();

    const [profile, setProfile] = useState(null);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setProfile(response.data.user);
                setPhone(response.data.user.phone || '');
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load profile');
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await api.put('/auth/profile', { phone }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update the profile state with the new user data returned by the server
            setProfile(response.data.user);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        }
    };

    if (loading) return <div className="page-container">Loading profile...</div>;
    if (error && !profile) return <div className="page-container auth-error">{error}</div>;

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Your Profile</h2>

                {error && <div className="auth-error">{error}</div>}

                {success && (
                    <div className="alert alert-success" style={{
                        backgroundColor: 'rgba(5, 148, 79, 0.1)',
                        color: 'var(--success)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontWeight: '500',
                        border: '1px solid rgba(5, 148, 79, 0.2)'
                    }}>{success}</div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={profile.name}
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Role</label>
                        <input
                            type="text"
                            value={profile.role}
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">Save Profile</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;






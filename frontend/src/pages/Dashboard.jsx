import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


const Dashboard = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();
    const [searchOrigin, setSearchOrigin] = useState('');
    const [searchDestination, setSearchDestination] = useState('');

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await api.get('/trips', {
                    headers: { Authorization: `Bearer ${token}` },

                    params: {
                        origin: searchOrigin || undefined,
                        destination: searchDestination || undefined
                    }
                });
                setTrips(response.data.trips);
            } catch (err) {
                setError('Failed to load trips');
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, [token, searchOrigin, searchDestination]);


    const handleJoinTrip = async (tripId) => {
        try {
            await api.post(`/trips/${tripId}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Successfully joined the trip!');


            navigate(`/trip/${tripId}`);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to join trip');
        }
    };


    if (loading) return <div className="page-container">Loading trips...</div>;
    if (error) return <div className="page-container auth-error">{error}</div>;

    return (
        <div className="page-container">
            <div className="dashboard-header">
                <h2>Available Trips</h2>
                <Link to="/create-trip" className="btn btn-primary">Offer a Ride</Link>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search Origin (eg. MITWPU)"
                    className="form-control"
                    value={searchOrigin}
                    onChange={(e) => setSearchOrigin(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Search Destination"
                    className="form-control"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                />
            </div>

            <div style={{ marginBottom: '30px' }}>
                <MapContainer center={[18.518330, 73.815079]} zoom={12} scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {trips.map((trip) => {
                        if (trip.origin_lat && trip.origin_lng) {
                            return (
                                <Marker key={trip.id} position={[trip.origin_lat, trip.origin_lng]}>
                                    <Popup>
                                        <strong>{trip.origin}</strong> to <strong>{trip.destination}</strong>
                                        <br />
                                        Seats: {trip.seats_available} | Price: ${trip.price}
                                        <br />
                                        <button
                                            className="btn btn-primary mt-4"
                                            style={{ padding: '5px 10px', fontSize: '12px' }}
                                            onClick={() => handleJoinTrip(trip.id)}
                                        >
                                            Join Trip
                                        </button>
                                    </Popup>
                                </Marker>
                            );
                        }
                        return null;
                    })}
                </MapContainer>
            </div>

            <div className="trips-grid">
                {trips.length === 0 ? (
                    <p className="no-trips">No trips available right now. Be the first to offer one!</p>
                ) : (
                    trips.map((trip) => (
                        <div key={trip.id} className="trip-card">
                            <div className="trip-locations">
                                <strong>{trip.origin}</strong>
                                <span className="arrow">→</span>
                                <strong>{trip.destination}</strong>
                            </div>

                            <div className="trip-details">
                                <p>Driver: <strong>{trip.driver_name || 'Unknown'}</strong></p>
                                <p>Departure: {new Date(trip.departure_time).toLocaleString()}</p>
                                <p>Seats: {trip.seats_available} left</p>
                                <p>Price: ${trip.price}</p>


                                <div style={{
                                    marginTop: '10px',
                                    paddingTop: '10px',
                                    borderTop: '1px solid #444',
                                    color: '#aaa',
                                    fontSize: '0.9em'
                                }}>
                                    <p style={{ margin: '2px 0' }}>🚗 {trip.car_model || 'Standard Sedan'}</p>
                                    <p style={{ margin: '2px 0', fontWeight: 'bold', letterSpacing: '1px' }}>
                                        {trip.license_plate || 'Not Provided'}
                                    </p>
                                </div>
                            </div>

                            <button className="btn btn-dark btn-block mt-4"
                                onClick={() => handleJoinTrip(trip.id)}
                            >
                                Join Trip
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;

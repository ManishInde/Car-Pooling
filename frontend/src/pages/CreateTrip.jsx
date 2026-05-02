import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CreateTrip = () => {

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [originCoords, setOriginCoords] = useState(null);
    const [destCoords, setDestCoords] = useState(null);
    const [pickingMode, setPickingMode] = useState('origin')
    const [departureTime, setDepartureTime] = useState('');
    const [seats, setSeats] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');

    const { token } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {

            await api.post('/trips', {
                origin,
                destination,
                origin_lat: originCoords?.lat,
                origin_lng: originCoords?.lng,
                dest_lat: destCoords?.lat,
                dest_lng: destCoords?.lng,
                departure_time: departureTime,
                seats_available: parseInt(seats),
                price: parseFloat(price)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create trip');
        }
    };

    const LocationPicker = () => {
        useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;

                if (pickingMode === 'origin') {
                    setOriginCoords({ lat, lng });
                } else {
                    setDestCoords({ lat, lng });
                }

                try {
                    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const addressName = response.data.display_name.split(',')[0];

                    if (pickingMode === 'origin') setOrigin(addressName);
                    else setDestination(addressName);
                } catch (err) {
                    console.log("Could not find address name for this location");
                }
            },
        });
        return null;
    };


    return (
        <div className="page-container">
            <div className="auth-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2>Offer a Ride</h2>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px ' }}>
                    <button
                        type="button"
                        className={`btn ${pickingMode === 'origin' ? 'btn-primary' : 'btn-dark '}`}
                        onClick={() => setPickingMode('origin')}
                    >
                        Pick Origin
                    </button>

                    <button
                        type="button"
                        className={`btn ${pickingMode === 'destination' ? 'btn-primary' : 'btn-dark'}`}
                        onClick={() => setPickingMode('destination')}
                    >
                        Pick Destination
                    </button>

                </div>

                <div style={{ marginBottom: '20px' }}>
                    <MapContainer center={[18.518330, 73.815079]} zoom={12} scrollWheelZoom={true}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationPicker />

                        {originCoords && <Marker position={[originCoords.lat, originCoords.lng]} />}

                        {destCoords && <Marker position={[destCoords.lat, destCoords.lng]} />}

                    </MapContainer>
                </div>



                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Origin (From)</label>
                        <input
                            type="text"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            required
                            placeholder="e.g. PCMC"
                        />
                    </div>

                    <div className="form-group">
                        <label>Destination (To)</label>
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            required
                            placeholder="e.g. Main gate"
                        />
                    </div>

                    <div className="form-group">
                        <label>Departure Time</label>
                        <input
                            type="datetime-local"
                            value={departureTime}
                            onChange={(e) => setDepartureTime(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Seats Available</label>
                        <input
                            type="number"
                            min="1"
                            max="7"
                            value={seats}
                            onChange={(e) => setSeats(e.target.value)}
                            required
                            placeholder="e.g. 4"
                        />
                    </div>

                    <div className="form-group">
                        <label>Price per seat($)</label>
                        <input
                            type="number"
                            step="0.50"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            placeholder="e.g. 5.50"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block mt-4">Publish Trip</button>

                </form>
            </div>
        </div>
    );
};

export default CreateTrip;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { useEffect } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CreateTrip = () => {

    const [tripDirection, setTripDirection] = useState('to_campus');
    const [customCoords, setCustomCoords] = useState(null);
    const [customAddress, setCustomAddress] = useState('');

    const campusCoords = { lat: 18.5538, lng: 73.8253 };
    const campusName = "MIT WPU Front Gate";

    const originCoords = tripDirection === 'to_campus' ? customCoords : campusCoords;
    const destCoords = tripDirection === 'to_campus' ? campusCoords : customCoords;

    const originName = tripDirection === 'to_campus' ? customAddress : campusName;
    const destName = tripDirection === 'to_campus' ? campusName : customAddress;

    const [departureTime, setDepartureTime] = useState('');
    const [seats, setSeats] = useState('');
    const [error, setError] = useState('');
    const [carModel, setCarModel] = useState('');
    const [licensePlate, setLicensePlate] = useState('');

    const { token } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {

            await api.post('/trips', {
                origin: originName,
                destination: destName,
                origin_lat: originCoords?.lat,
                origin_lng: originCoords?.lng,
                dest_lat: destCoords?.lat,
                dest_lng: destCoords?.lng,
                departure_time: departureTime,
                seats_available: parseInt(seats),
                car_model: carModel,
                license_plate: licensePlate
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
                setCustomCoords({ lat, lng });

                try {
                    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    setCustomAddress(response.data.display_name.split(',')[0]);
                } catch (err) {
                    console.log("Could not find address name");
                }
            },
        });
        return null;
    };

    const SearchField = () => {
        const map = useMapEvents({});

        useEffect(() => {
            const provider = new OpenStreetMapProvider();
            const searchControl = new GeoSearchControl({
                provider: provider,
                style: 'bar',
                showMarker: false,
                showPopup: false,
                autoClose: true,
                retainZoomLevel: false,
                animateZoom: true,
                keepResult: true,
                searchLabel: 'Search for an address...'
            });

            map.addControl(searchControl);
            return () => map.removeControl(searchControl);
        }, [map]);

        return null;
    };



    return (
        <div className="page-container">
            <div className="auth-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2>Offer a Ride</h2>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px ' }}>
                    <button
                        type="button"
                        className={`btn ${tripDirection === 'to_campus' ? 'btn-primary' : 'btn-dark '}`}
                        onClick={() => setTripDirection('to_campus')}
                    >
                        Going TO Campus
                    </button>

                    <button
                        type="button"
                        className={`btn ${tripDirection === 'from-campus' ? 'btn-primary' : 'btn-dark'}`}
                        onClick={() => setTripDirection('from_campus')}
                    >
                        Leaving FROM Campus
                    </button>

                </div>

                <MapContainer center={[18.518330, 73.815079]} zoom={12} scrollWheelZoom={true}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker />
                    <SearchField />   {/* ADD THIS LINE! */}

                    {originCoords && <Marker position={[originCoords.lat, originCoords.lng]} />}
                    {destCoords && <Marker position={[destCoords.lat, destCoords.lng]} />}
                </MapContainer>


                <div style={{
                    background: '#222', padding: '15px', borderRadius: '8px',
                    marginBottom: '20px', border: '1px solid #444'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-blue)' }}>Trip Summary</h4>
                    <p style={{ margin: '5px 0' }}><strong>From:</strong> {originName || 'Click map to select...'}</p>
                    <p style={{ margin: '5px 0' }}><strong>To:</strong> {destName || 'Click map to select...'}</p>
                </div>




                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">


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
                        <label>Car Model</label>
                        <input
                            type="text"
                            value={carModel}
                            onChange={(e) => setCarModel(e.target.value)}
                            required
                            placeholder="e.g. Honda City"
                        />
                    </div>

                    <div className="form-group">
                        <label>License Plate</label>
                        <input
                            type="text"
                            value={licensePlate}
                            onChange={(e) => setLicensePlate(e.target.value)}
                            required
                            placeholder="AB VA XX 1234"
                        />
                    </div>



                    <button type="submit" className="btn btn-primary btn-block mt-4">Publish Trip</button>

                </form>
            </div>
        </div >
    );
};

export default CreateTrip;
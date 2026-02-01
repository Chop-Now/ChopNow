import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not showing in Webpack/Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SearchPage = () => {
    // Kigali Coordinates
    const center = [-1.9441, 30.0619];

    const stores = [
        { id: 1, name: 'Kigali Heights Bakery', lat: -1.9540, lng: 30.0820, items: 3 },
        { id: 2, name: 'Green Farm Market', lat: -1.9350, lng: 30.0600, items: 5 },
    ];

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
            {/* List View */}
            <div className="w-full lg:w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-4 z-10 order-2 lg:order-1 h-1/2 lg:h-full">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search for food..."
                        className="w-full border border-gray-300 rounded-md py-2 px-4 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                <div className="space-y-4">
                    {stores.map(store => (
                        <div key={store.id} className="border border-gray-200 rounded-lg p-4 hover:bg-orange-50 cursor-pointer transition">
                            <h3 className="font-bold text-gray-900">{store.name}</h3>
                            <p className="text-gray-500 text-sm">~ 1.2 km away</p>
                            <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {store.items} bags left
                            </span>
                        </div>
                    ))}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-bold text-gray-900">Gourmet Coffee</h3>
                        <p className="text-gray-500 text-sm">~ 2.5 km away</p>
                        <span className="inline-block mt-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Sold Out
                        </span>
                    </div>
                </div>
            </div>

            {/* Map View */}
            <div className="w-full lg:w-2/3 h-1/2 lg:h-full order-1 lg:order-2">
                <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {stores.map(store => (
                        <Marker key={store.id} position={[store.lat, store.lng]}>
                            <Popup>
                                <strong>{store.name}</strong> <br /> {store.items} items available.
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default SearchPage;

"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

export function Map({ markers, routePlan, onMarkersGenerated }) {
    const [loading, setLoading] = useState(false);

    // Function to generate random orders
    const generateOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    count: 20,
                    bounds: {
                        north: 24.8500,
                        south: 24.5500,
                        east: 46.8500,
                        west: 46.5500
                    }
                })
            });

            const data = await response.json();
            if (data.success) {
                console.log('Generated orders:', data.orders);
                // Convert orders to markers
                const newMarkers = data.orders.map(order => ({
                    lat: order.latitude,
                    lng: order.longitude,
                    id: order.order_id
                }));
                onMarkersGenerated(newMarkers);
            }
        } catch (error) {
            console.error('Error generating orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Draw routes when routePlan changes
    useEffect(() => {
        if (routePlan) {
            console.log('Drawing routes:', routePlan);
            // Add your route drawing logic here
        }
    }, [routePlan]);

    return (
        <div className="relative h-full">
            <MapContainer
                center={[24.7136, 46.6753]}
                zoom={11}
                className="h-full w-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {markers?.map((marker, index) => (
                    <Marker
                        key={marker.id || index}
                        position={[marker.lat, marker.lng]}
                    >
                        <Popup>
                            Delivery Point {index + 1}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            <button
                className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded shadow"
                onClick={generateOrders}
                disabled={loading}
            >
                {loading ? 'Generating...' : 'Generate Orders'}
            </button>
        </div>
    );
} 
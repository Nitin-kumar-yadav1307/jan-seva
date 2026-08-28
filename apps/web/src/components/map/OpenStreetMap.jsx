import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Star, ShieldCheck, Clock, MapPin, ArrowRight } from 'lucide-react';

// Fix default leaflet marker icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom HTML Markers
const createWorkerIcon = (worker, isSelected = false) => {
  const categoryColor = worker.skills?.[0]?.category === 'Plumbing' ? '#2563EB' :
                        worker.skills?.[0]?.category === 'Electrical' ? '#D97706' :
                        worker.skills?.[0]?.category === 'Cleaning' ? '#059669' : '#4F46E5';

  return L.divIcon({
    className: 'custom-worker-pin',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background-color: white;
        border: 3px solid ${isSelected ? '#10B981' : categoryColor};
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: transform 0.2s;
      ">
        <img 
          src="${worker.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100'}" 
          style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" 
          alt="${worker.name}"
        />
        <span style="
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: #10B981;
          color: white;
          font-size: 8px;
          font-weight: bold;
          padding: 1px 3px;
          border-radius: 4px;
          border: 1px solid white;
        ">★${worker.rating || 4.9}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
};

const createCustomerIcon = () => {
  return L.divIcon({
    className: 'custom-customer-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #1E40AF;
        color: white;
        box-shadow: 0 0 0 6px rgba(30, 64, 175, 0.2), 0 4px 10px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Component to dynamically fit map bounds
const ChangeMapView = ({ center, zoom, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, bounds, map]);
  return null;
};

export const OpenStreetMap = ({
  workers = [],
    customerLocation = [19.0760, 72.8777], // [lat, lon] — Mumbai, Maharashtra
  customerLocationLabel = 'Service Location',
  selectedWorker = null,
  onSelectWorker = null,
  showRoute = false,
  height = '420px',
  zoom = 13
}) => {
  // Convert worker coords from [lon, lat] (GeoJSON) to [lat, lon] (Leaflet)
  const workerMarkers = workers.map(w => {
    const coords = w.currentLocation?.coordinates || [72.8777, 19.0760];
    return {
      worker: w,
      latLng: [coords[1], coords[0]]
    };
  });

  const activeWorkerMarker = selectedWorker ? {
    worker: selectedWorker,
    latLng: [
      (selectedWorker.currentLocation?.coordinates || [72.8777, 19.0760])[1],
      (selectedWorker.currentLocation?.coordinates || [72.8777, 19.0760])[0]
    ]
  } : null;

  // Route Polyline between customer and selected worker
  const routePoints = showRoute && activeWorkerMarker ? [
    customerLocation,
    // Midpoint curve simulation
    [
      (customerLocation[0] + activeWorkerMarker.latLng[0]) / 2 + 0.002,
      (customerLocation[1] + activeWorkerMarker.latLng[1]) / 2 - 0.001
    ],
    activeWorkerMarker.latLng
  ] : [];

  const mapCenter = activeWorkerMarker ? activeWorkerMarker.latLng : customerLocation;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0" style={{ height }}>
      {/* OpenStreetMap Attribution Badge */}
      <div className="absolute top-2.5 right-2.5 z-1000 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200">
        🗺️ OpenStreetMap (OSM) Live
      </div>

      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <ChangeMapView center={mapCenter} zoom={zoom} />

        {/* Standard OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Customer / Destination Marker */}
        {customerLocation && (
          <Marker position={customerLocation} icon={createCustomerIcon()}>
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <span className="font-bold text-coop-900 block">📍 Service Location</span>
                <p className="text-slate-600">{customerLocationLabel}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline (if tracking active job) */}
        {showRoute && routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            color="#2563EB"
            weight={4}
            opacity={0.85}
            dashArray="6, 8"
          />
        )}

        {/* Worker Markers */}
        {workerMarkers.map(({ worker, latLng }) => {
          const isSelected = selectedWorker?._id === worker._id;
          return (
            <Marker
              key={worker._id}
              position={latLng}
              icon={createWorkerIcon(worker, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectWorker) onSelectWorker(worker);
                }
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 text-xs min-w-[170px]">
                  <div className="flex items-center gap-2">
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        {worker.name}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </h4>
                      <p className="text-[10px] text-coop-600 font-semibold">
                        {worker.skills?.[0]?.category || 'Artisan'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100">
                    <span className="font-bold text-slate-800">₹{worker.hourlyRate}/hr</span>
                    <span className="text-emerald-700 font-semibold">
                      {worker.workloadScore > 70 ? 'High Activity' : 'Available & Fresh'}
                    </span>
                  </div>

                  {onSelectWorker && (
                    <button
                      onClick={() => onSelectWorker(worker)}
                      className="w-full bg-coop-600 hover:bg-coop-700 text-white font-bold py-1.5 rounded-lg text-[11px] transition-colors mt-1"
                    >
                      Book Worker
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

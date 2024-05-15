import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import pinIcon from './pin-icon.png';

const Map = ({ onMarkerDrag, markedLocation }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    let map; // Declare map outside initMap to access in cleanup

    const initMap = () => {
      const initialView = markedLocation || [14.800859, 120.921863]; // Use markedLocation or default
      map = L.map(mapRef.current).setView(initialView, 15); // Set view during initialization

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const pinMarkerIcon = L.icon({
        iconUrl: pinIcon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker(
        markedLocation || [14.800859, 120.921863],
        {
          draggable: true,
          icon: pinMarkerIcon,
        }
      ).addTo(map);

      marker.on('dragend', (event) => {
        onMarkerDrag(event.target.getLatLng().lat, event.target.getLatLng().lng);
      });

      markerRef.current = marker;
      return map;
    };

    map = initMap(); // Initialize the map

    // Update view whenever markedLocation changes
    if (markedLocation && map) {
      map.setView(markedLocation, 15); // Adjust zoom level as needed
    }

    return () => {
      if (map) {
        map.remove(); // Properly remove the map on cleanup
      }
    };
  }, [onMarkerDrag, markedLocation]); // Include markedLocation in dependency array

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

export default Map;
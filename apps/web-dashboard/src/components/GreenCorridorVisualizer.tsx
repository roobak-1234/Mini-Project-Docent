
import React, { useEffect, useRef, useState } from 'react';
import * as azureMaps from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';
import { Coordinate } from '../types/JunctionSchema';

interface GreenCorridorVisualizerProps {
    ambulanceLocation?: Coordinate;
    junctions?: Coordinate[];
    corridorPath?: Coordinate[];
    subscriptionKey?: string;
}

const GreenCorridorVisualizer: React.FC<GreenCorridorVisualizerProps> = ({
    ambulanceLocation,
    junctions = [],
    corridorPath = [],
    subscriptionKey = process.env.REACT_APP_AZURE_MAPS_SUBSCRIPTION_KEY || ''
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<azureMaps.Map | null>(null);
    const [dataSource, setDataSource] = useState<azureMaps.source.DataSource | null>(null);

    // Initial Map Setup
    useEffect(() => {
        if (!mapRef.current) return;

        const map = new azureMaps.Map(mapRef.current, {
            center: [-122.3321, 47.6062], // Seattle default
            zoom: 13,
            view: 'Auto',
            style: 'night', // Dark mode for officer dashboard
            authOptions: {
                authType: azureMaps.AuthenticationType.subscriptionKey,
                subscriptionKey: subscriptionKey
            }
        });

        const source = new azureMaps.source.DataSource();

        map.events.add('ready', () => {
            map.sources.add(source);
            setDataSource(source);

            // Layer for Path (Green Corridor)
            map.layers.add(new azureMaps.layer.LineLayer(source, undefined, {
                strokeColor: '#00FF00', // Neon Green
                strokeWidth: 5,
                blur: 0.5
            }));

            // Layer for Junctions (Red dots)
            map.layers.add(new azureMaps.layer.BubbleLayer(source, undefined, {
                createIndicators: true, // For accessibility
                color: 'red',
                radius: 6,
                strokeColor: 'white',
                strokeWidth: 2
            }));

            // Layer for Ambulance (Blue icon or distinct marker)
            map.layers.add(new azureMaps.layer.SymbolLayer(source, undefined, {
                iconOptions: {
                    image: 'pin-round-blue',
                    allowOverlap: true
                }
            }));

            setMapInstance(map);
        });

        return () => map.dispose();
    }, [subscriptionKey]);

    // Update Data
    useEffect(() => {
        if (!dataSource || !mapInstance) return;

        dataSource.clear();

        // Draw Corridor Path
        if (corridorPath.length > 1) {
            const pathCoordinates = corridorPath.map(c => [c.longitude, c.latitude]);
            const line = new azureMaps.data.LineString(pathCoordinates);
            dataSource.add(line);
        }

        // Draw Junctions
        junctions.forEach(j => {
            const point = new azureMaps.data.Point([j.longitude, j.latitude]);
            dataSource.add(new azureMaps.data.Feature(point, { type: 'junction' }));
        });

        // Draw Ambulance
        if (ambulanceLocation) {
            const point = new azureMaps.data.Point([ambulanceLocation.longitude, ambulanceLocation.latitude]);
            dataSource.add(new azureMaps.data.Feature(point, { type: 'ambulance' }));

            // Auto center on ambulance
            mapInstance.setCamera({
                center: [ambulanceLocation.longitude, ambulanceLocation.latitude],
                zoom: 15,
                type: 'fly'
            });
        }

    }, [ambulanceLocation, junctions, corridorPath, dataSource, mapInstance]);

    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-slate-700 shadow-xl">
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            <div className="absolute top-2 right-2 bg-black/70 text-green-400 px-3 py-1 rounded text-xs font-mono">
                LIVE TRAFFIC DATA: ACTIVE
            </div>
        </div>
    );
};

export default GreenCorridorVisualizer;

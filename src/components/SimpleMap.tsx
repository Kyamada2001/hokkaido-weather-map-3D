import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
 

// interface MarkerProps {
//     feature: any; // 任意の型に置き換える
// }
const Marker = () => {  
    return (
      <button onClick={() => {}} className="marker">
        <div>アイコンアイコン</div>
      </button>
    );
};
export default function SimpleMap() {
  mapboxgl.accessToken = "pk.eyJ1Ijoia3lhbWFkIiwiYSI6ImNsdHJueGk0ODA4d3MyanBleTRhYWMxbHMifQ.mpKpByZH_GUNVMXK1n86aA";
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
 
  useEffect(() => {
    const initializeMap = ({
      setMap,
      mapContainer,
    }: {
      setMap: any;
      mapContainer: any;
    }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        center: [143.21, 42.73], // 東京駅を初期値点として表示（緯度、経度を指定）
        zoom: 15,
        style: 'mapbox://styles/mapbox/streets-v12',
        pitch: 60,
        bearing: -18.6,
        antialias: true,
      });
      // 言語変更設定参考
      // defaultLanguageとしてjaを指定
      const language = new MapboxLanguage({ defaultLanguage: 'ja' });
      map.addControl(language);

      // Create a React ref
      const ref: any = React.createRef();
      ref.current = document.createElement('div');
      createRoot(ref.current).render(
        <Marker/>
      );

      // Create a Mapbox Marker at our new DOM node
      new mapboxgl.Marker(ref.current)
        .setLngLat([143.21, 42.73])
        .addTo(map);
 
      map.on('load', () => {
        setMap(map);
        map.resize();
      });
    };
 
    if (!map) initializeMap({ setMap, mapContainer });
  }, [map]);
 
  return (
    <>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    </>
  );
}
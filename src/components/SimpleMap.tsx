import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { IoVideocam } from "react-icons/io5";
import "../index.css"
import axios from "axios";
import Youtube from 'react-youtube';

type MarkerProps = {
    youtubeUrl: string;
    lng: number;
    lat: number;
};
const Marker = ({youtubeUrl,lng,lat}: MarkerProps) => {
    const youtubeRegex = /(?<=watch\?v=)([^&\s]+)/;
    const [modalStatus, setModalStatus] = useState(false)
    const [videoId, setVideoId] = useState<string>("")
    
    
    useEffect(() => {
        const match = youtubeUrl.match(youtubeRegex);
        const tmpVideoId = match ? match[0] : '';
        setVideoId(tmpVideoId)
    })

    return (
        <>
            {
                modalStatus ? (
                    <div className='w-30 h-30'>
                        <Youtube videoId={videoId}/>
                    </div>
                ) : ''
            }
            <button onClick={()=> setModalStatus(true)} className="rounded-full bg-black inline p-3">
                <IoVideocam size={30} color='#f8fafc'/>
            </button>
        </>
    );
};
export default function SimpleMap() {
    // TODO: トークンは環境変数にいれ、GIt履歴に残っているトークンは削除
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_KEY
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [features, setFeatures] = useState([])

    const getFeatures = async () => {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${import.meta.env.VITE_FEATURE_SPREADSHEET_SHEETID}/values/${import.meta.env.VITE_FEATURE_SPREADSHEET_SHEETNAME}?key=${import.meta.env.VITE_FEATURE_SPREADSHEET_KEY}`
        const res = await axios.get(url);
        setFeatures(res.data.values)
    }
    
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

        getFeatures();
        map.on('load', () => {
            setMap(map);
            map.resize();
        });
        }
        if (!map) initializeMap({ setMap, mapContainer });
  }, [map]);

  useEffect(() => {
    console.log(map)

    if(!features || !map) return;
    features.forEach((feature: any) => {
        // const liveName = feature[0]
        const lng: number = feature[1]
        const lat: number = feature[2]
        const youtubeUrl: string = feature[3]
        
        const ref: any = React.createRef();
        ref.current = document.createElement('div');
        createRoot(ref.current).render(
            <Marker youtubeUrl={youtubeUrl} lat={lat} lng={lng}/>
        );
        // Create a Mapbox Marker at our new DOM node
        new mapboxgl.Marker(ref.current)
            .setLngLat([lng, lat])
            .addTo(map!);
        })
  },[features,map])
 
  return (
    <>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    </>
  );
}
import { useEffect, useState, useRef, useContext } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { IoVideocam } from "react-icons/io5";
import { FaCompass } from "react-icons/fa";
import "../index.css"
import axios from "axios";
import Youtube from 'react-youtube';
import { MdOutlineCancel } from "react-icons/md";
// import  MapContext  from 'react-map-gl';
import RainLayer from 'mapbox-gl-rain-layer';
// import { any } from 'three/examples/jsm/nodes/Nodes.js';
// import { render } from 'react-dom';


type LiveInfo = {
    liveName: string,
    videoId: string,
    lng: number,
    lat: number
}


const Marker: React.FC<LiveInfo & any> = ({clickCamera, liveName,youtubeUrl,lng,lat}) => {
    const youtubeRegex = /(?<=watch\?v=)([^&\s]+)/;
    const [modalStatus, setModalStatus] = useState(false)
    const [videoId, setVideoId] = useState<string>("")
    
    useEffect(() => {
        const match = youtubeUrl.match(youtubeRegex);
        const tmpVideoId = match ? match[0] : '';
        setVideoId(tmpVideoId)
    })

    const onClickCamera = () => {
        const sendLiveInfo: LiveInfo = {
            liveName: liveName,
            videoId: videoId,
            lng: lng,
            lat: lat
        }
        clickCamera(sendLiveInfo)
        setModalStatus(true)
    }

    return (
        <>
            <div className='relative'>
                <button onClick={onClickCamera} className="block rounded-full bg-black p-2">
                    <IoVideocam size={25} color='#f8fafc'/>
                </button>
            </div>
        </>
    );
};


export default function SimpleMap() {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_KEY;
    const mapContainer = useRef<any>(null);
    const [map, setMap] = useState<any>(null);
    // const renderer = useRef<any>(null);
    // const snowflakes = useRef<any>([]);
    const [features, setFeatures] = useState([])
    const [showLiveInfo, setShowLiveInfo] = useState<null | LiveInfo>(null)
    const [isMapRendering, setIsMapRendering] = useState<boolean>(false)

    const getFeatures = async () => {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${import.meta.env.VITE_FEATURE_SPREADSHEET_SHEETID}/values/${import.meta.env.VITE_FEATURE_SPREADSHEET_SHEETNAME}?key=${import.meta.env.VITE_FEATURE_SPREADSHEET_KEY}`
        const res = await axios.get(url);
        setFeatures(res.data.values)
    }

    const onClickCamera = (liveInfo: LiveInfo) => {
        setShowLiveInfo(liveInfo)
    }

    const cancelLive = () => {
        setShowLiveInfo(null)
    }


    
    useEffect(() => {
        const initializeMap = ({
            setMap,
            mapContainer,
        }: {
        setMap: any;
        mapContainer: any;
        }) => {
            console.log("レンダリング")
            const map = new mapboxgl.Map({
                container: mapContainer.current,
                center: [142.79, 42.87], // 東京駅を初期値点として表示（緯度、経度を指定）
                zoom: 6.5,
                minZoom: 6, 
                style: 'mapbox://styles/mapbox/navigation-night-v1',
                pitch: 50,
                bearing: -15.6,
                antialias: true,
            });
            // 言語変更設定参考
            // defaultLanguageとしてjaを指定
            const language = new MapboxLanguage({ defaultLanguage: 'ja' });
            map.addControl(language);
    
            map.on('load', () => {
                const rainLayer = new RainLayer({
                    id: 'rain',
                    source: 'rainviewer',
                    scale: 'noaa',
                    meshOpacity: 0.1,
                    rainColor: '#1e3a8a',
                    snowColor: '#f0f9ff'
                });
                map.addLayer(rainLayer);

                map.addLayer(
                    {
                    'id': 'add-3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                    'fill-extrusion-color': '#aaa',
                     
                    // Use an 'interpolate' expression to
                    // add a smooth transition effect to
                    // the buildings as the user zooms in.
                    'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.9
                    }
                    },
                    'building'
                );
    
                setMap(map);
                map.resize();
                // scene.current.add(camera)
            });
        }

        if(features.length < 1) {
            console.log("ライブカメラ取得")
            getFeatures()
        }
        if (!map && !isMapRendering) {
            console.log(isMapRendering)
            setIsMapRendering(true)
            initializeMap({ setMap, mapContainer });
        }
    },[isMapRendering])

    const flyMap = (lng: number,lat: number) => {
        let zoomLevel = 10;
        if(!map) return ;

        const currentZoomLevel = map.getZoom()
        if(currentZoomLevel > 10) zoomLevel = currentZoomLevel
        map.flyTo({
            center: [
            lng,
            lat
            ],
            zoom: zoomLevel,
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
    }

    useEffect(() => {
        if(!features || !map) return;
        features.forEach((feature: any) => {
            const liveName = feature[0]
            const lng: number = feature[1]
            const lat: number = feature[2]
            const youtubeUrl: string = feature[3]
            
            const ref: any = React.createRef();
            ref.current = document.createElement('div');
            createRoot(ref.current).render(
                <>
                    <button onClick={() => flyMap(lng, lat)}>
                        <Marker clickCamera={onClickCamera} liveName={liveName} youtubeUrl={youtubeUrl} lat={lat} lng={lng}/>
                    </button>
                </>
            );
            // Create a Mapbox Marker at our new DOM node
            new mapboxgl.Marker(ref.current)
                .setLngLat([lng, lat])
                .addTo(map!);
            })
    },[features, map])

    return (
        <>
            <div>
                <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
                {   
                    showLiveInfo ?
                    <div className="fixed bottom-1 left-1/2 -translate-x-1/2 bg-gray-800 p-3 bg-opacity-70 space-y-2">
                        <button className='absolute top-0 right-0' onClick={() => cancelLive()}>
                            <MdOutlineCancel color='#f8fafc' size={30}/>
                        </button>
                        <div className='flex flex-row space-x-2'>
                            <p className='text-white'>{showLiveInfo.liveName}</p>
                            <button onClick={() => flyMap(showLiveInfo.lng,showLiveInfo.lat)}>
                                <FaCompass size={30} color='#60a5fa'/>
                            </button>
                        </div>
                        <Youtube className="opacity-100" opts={{height: '300',width: '400'}} videoId={showLiveInfo.videoId}/>
                    </div>
                    : ''
                }
            </div>
        </>
    );
}
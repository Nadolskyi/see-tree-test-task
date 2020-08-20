import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import Marker from '../marker/Marker';
import fetchFakeData from '../../api/fetchFakeData';
import './containerStyles.css';

const Container = () => {
  const initializeFeatureCollection = {
    type: "FeatureCollection",
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [],
      },
      properties: {},
    }]
  }
  const [points, setPoints] = useState(initializeFeatureCollection);

  const [lngState, setLng] = useState(31);
  const [latState, setLat] = useState(49);
  const [zoom, setZoom] = useState(5);
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lngState, latState],
      zoom: zoom
    });

    map.on("load", () => {
      map.addSource("random-points-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });
      map.addLayer({
        id: "random-points-layer",
        source: "random-points-data",
        type: 'circle',
        paint: {
          // "icon-image": "amusement-park-15",
          // "icon-padding": 0,
          // "icon-allow-overlap": true,
          'circle-radius': 6.5,
          'circle-color': [
            'match',
            ['get', 'score'],
            0,
            'black',
            1,
            'gray',
            2,
            'red',
            3,
            'orange',
            4,
            'lime',
            5,
            'green'
          ],
        }
      });
    });

    map.on('click', (e) => {

      const newPoints = setFeaturePoint(e.lngLat.toArray());
      console.log('newPoints', newPoints)
      setPoints(newPoints)
      map.getSource("random-points-data").setData(newPoints);
    });

  }, [])


  const setFeaturePoint = (lngLat) => {
    const newPointsfeatures = [...points.features];
    debugger
    const randomScore = Math.floor(Math.random() * 6);
    points.features.push(
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: lngLat,
        },
        properties: {
          id: newPointsfeatures.length + 1,
          score: randomScore
        },
      }
    )
    console.log('newPointsfeatures', newPointsfeatures)
    return points
  }

  return (
    <div>
      <div ref={mapContainer} className="mapContainer" />
    </div>
  )
}

// class Container extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       lng: 5,
//       lat: 34,
//       zoom: 2
//     };
//   }

//   componentDidMount() {
//     const map = new mapboxgl.Map({
//       container: this.mapContainer,
//       style: 'mapbox://styles/mapbox/streets-v11',
//       center: [this.state.lng, this.state.lat],
//       zoom: this.state.zoom
//     });
//   }

//   render() {
//     return (
//       <div>
//         <div ref={el => this.mapContainer = el} className="mapContainer" />
//       </div>
//     )
//   }
// }

export default Container;
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import Popup from '../popup/Popup';
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
  // const [popupOpen, setPopupOpen] = useState(false);
  const [lngState, setLng] = useState(31);
  const [latState, setLat] = useState(49);
  const [zoom, setZoom] = useState(5);
  const mapContainer = useRef(null);
  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lngState, latState],
      zoom: zoom
    });

    const canvas = map.getCanvasContainer();
    let currentFeatureId;
    let isPopupOpen = false;

    const changePointScore = (id, score) => {
      console.log('score, id', score, id)
      var currentMarker = points.features.find(obj => {
        return obj.properties.id === id
      })
      currentMarker.properties.score = Number(score);
      setPoints({ ...points })
      map.getSource("random-points-data").setData(points);
    }

    const onMove = (e) => {
      canvas.style.cursor = "grabbing";
      var currentMarker = points.features.find(obj => {
        return obj.properties.id === currentFeatureId
      })
      currentMarker.geometry.coordinates = e.lngLat.toArray();
      setPoints({ ...points })
      map.getSource("random-points-data").setData(points);
    }

    const onUp = () => {
      canvas.style.cursor = "";
      map.off("mousemove", onMove);
      map.off("touchmove", onMove);
    }

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
          'circle-radius': 7.5,
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
            'green',
            'violet'
          ],
        }
      });
    });

    map.on("click", "random-points-layer", e => {
      if (e.features.length) {
        isPopupOpen = true;
        const feature = e.features[0];
        const popupNode = document.createElement("div");
        ReactDOM.render(<Popup feature={feature} changePointScore={changePointScore} />, popupNode);
        popUpRef.current
          .setLngLat(feature.geometry.coordinates)
          .setDOMContent(popupNode)
          .addTo(map);
      }
    });

    map.on('click', (e) => {
      if (!isPopupOpen) {
        const newPoints = setFeaturePoint(e.lngLat.toArray());
        map.getSource("random-points-data").setData(newPoints);
      }
      isPopupOpen = false;
    });

    map.on("mouseenter", "random-points-layer", function () {
      canvas.style.cursor = "pointer";
    });

    map.on("mouseleave", "random-points-layer", function () {
      canvas.style.cursor = "";
    });

    map.on("mousedown", "random-points-layer", function (e) {
      currentFeatureId = e.features[0].properties.id;
      e.preventDefault();
      canvas.style.cursor = "grab";
      map.on("mousemove", onMove);
      map.once("mouseup", onUp);
    });

    map.on("touchstart", "random-points-layer", function (e) {
      if (e.points.length !== 1) return;

      e.preventDefault();

      map.on("touchmove", onMove);
      map.once("touchend", onUp);
    });

  }, [])

  const setFeaturePoint = (lngLat) => {
    const randomScore = Math.floor(Math.random() * 6);
    const randomId = Math.random().toFixed(3) * 1000;
    points.features.push(
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: lngLat,
        },
        properties: {
          id: randomId,
          score: randomScore
        },
      }
    )
    setPoints({ ...points });
    return points;
  }

  const getSumByScore = (score) => {
    return points.features.filter((point) => point.properties.score === score).length
  }

  return (
    <div>
      <div className='score-block'>
        <div>{`Total: ${points.features.length - 1}`}</div>
        <div>{`Five: ${getSumByScore(5)}`}</div>
        <div>{`Four: ${getSumByScore(4)}`}</div>
        <div>{`Three: ${getSumByScore(3)}`}</div>
        <div>{`Two: ${getSumByScore(2)}`}</div>
        <div>{`One: ${getSumByScore(1)}`}</div>
        <div>{`Zero: ${getSumByScore(0)}`}</div>
      </div>
      <div ref={mapContainer} className="mapContainer" />
    </div>
  )
}

export default Container;
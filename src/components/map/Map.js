import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import Popup from "../popup/Popup";
import { SCORE_COLORS } from "../const";
import "./mapStyles.css";

const Map = () => {
  const initializeFeatureCollection = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [],
      },
      properties: {},
    }]
  }

  const [points, setPoints] = useState(initializeFeatureCollection);
  const mapContainer = useRef(null);
  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }));
  const [isUploaded, setIsUploaded] = useState(false);
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [31, 49],
      zoom: 5
    });

    const canvas = map.getCanvasContainer();
    let currentFeatureId;
    let isPopupOpen = false;

    const setNewPoints = (newPoints) => {
      setPoints({ ...points });
      map.getSource("random-points-data").setData(points);
    }

    const findById = (id) => {
      return points.features.find(point => point.properties.id === id)
    }

    const changePointScore = (id, score) => {
      findById(id).properties.score = Number(score);
      popUpRef.current.remove();
      setNewPoints(points);
    }

    const deletePoint = (id) => {
      const currentMarkerIndex = points.features.indexOf(findById(id));
      points.features.splice(currentMarkerIndex, 1);
      popUpRef.current.remove();
      setNewPoints(points);
    }

    const onMove = (e) => {
      canvas.style.cursor = "grabbing";
      findById(currentFeatureId).geometry.coordinates = e.lngLat.toArray();
      setNewPoints(points);
    }

    const onUp = () => {
      canvas.style.cursor = "";
      map.off("mousemove", onMove);
      map.off("touchmove", onMove);
    }

    const getColorByScore = (score) => {
      return SCORE_COLORS.find(scoreColor => scoreColor.value === score).color
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
        type: "circle",
        paint: {
          "circle-radius": 7.5,
          "circle-color": [
            "match",
            ["get", "score"],
            0,
            getColorByScore(0),
            1,
            getColorByScore(1),
            2,
            getColorByScore(2),
            3,
            getColorByScore(3),
            4,
            getColorByScore(4),
            5,
            getColorByScore(5),
            "violet"
          ],
        }
      });
    });

    map.on("load", () => {
      map.getSource("random-points-data").setData(points);
    });

    map.on("click", "random-points-layer", e => {
      if (e.features.length) {
        isPopupOpen = true;
        const feature = e.features[0];
        const popupNode = document.createElement("div");
        ReactDOM.render(<Popup feature={feature} changePointScore={changePointScore} deletePoint={deletePoint} />, popupNode);
        popUpRef.current
          .setLngLat(feature.geometry.coordinates)
          .setDOMContent(popupNode)
          .addTo(map);
      }
    });

    map.on("click", (e) => {
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

  }, [isUploaded])

  const setFeaturePoint = (lngLat) => {
    const randomScore = Math.floor(Math.random() * 6);
    const randomId = Math.random().toFixed(3) * 1000;
    points.features.push(
      {
        type: "Feature",
        geometry: {
          type: "Point",
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

  const exportToJSON = () => {
    const pointsToSave = points.features.filter(point => point.properties.id)
    points.features = pointsToSave;
    const fileToSave = new Blob([JSON.stringify(points)], {
      type: "application/json"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(fileToSave);
    a.download = "markerData.json";
    a.click();
  }

  const importFromJSON = (e) => {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = onReaderLoad;
      reader.readAsText(e.target.files[0]);
    }
  }

  const onReaderLoad = (event) => {
    const uploadedPoints = JSON.parse(event.target.result);
    setPoints(uploadedPoints);
    setIsUploaded(!isUploaded);
  }

  return (
    <div>
      <div className="score-block">
        <div>{`Total: ${points.features.filter(point => point.properties.id).length}`}</div>
        {SCORE_COLORS.map((score) => {
          return <div key={score.color}>{`${score.label}: ${getSumByScore(score.value)}`}</div>
        })}
        <button onClick={exportToJSON}>Export JSON</button>
        <br />
        <label htmlFor="import">Import JSON</label>
        <br />
        <input name="import" type="file" accept="application/JSON" onChange={importFromJSON} />
      </div>
      <div ref={mapContainer} className="mapContainer" />
    </div>
  )
}

export default Map;
import React from "react";
import { SCORE_COLORS } from "../const";

const Popup = ({ feature, changePointScore, deletePoint }) => {
  const { id, score } = feature.properties;
  const changeValue = (e) => {
    return changePointScore(id, e.target.value)
  }

  return (
    <div id={`popup-${id}`}>
      <h3>{`Markers score: ${score}`}</h3>
      <label htmlFor="scores">Change score:</label>
      <br />
      <select name="scores" onChange={changeValue} defaultValue={score}>
        {SCORE_COLORS.map((score) => {
          return <option key={score.color} value={score.value}>{score.label}</option>
        })}
      </select>
      <br />
      <br />
      <button onClick={() => deletePoint(id)}>Delete marker</button>
    </div>
  );
};

export default Popup;

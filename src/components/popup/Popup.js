import React from "react";

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
        <option value="5">Five</option>
        <option value="4">Four</option>
        <option value="3">Three</option>
        <option value="2">Two</option>
        <option value="1">One</option>
        <option value="0">Zero</option>
      </select>
      <br />
      <br />
      <button onClick={() => deletePoint(id)}>Delete marker</button>
    </div>
  );
};

export default Popup;

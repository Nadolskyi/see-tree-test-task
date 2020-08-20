import React from 'react';
import './markerStyles.css';

const Marker = ({ id }) => {
  const color = 'red';
  console.log(id)
  return <div id={`marker-${id}`} className="marker" style={{ backgroundColor: `${color}` }} />
};

export default Marker;
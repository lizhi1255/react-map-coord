import React, { useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import CoordMap, { CoordChangeProps, CoordMapExpose } from "./packages";

const Example = () => {
  const MAP_KEY = "高德地图key"; //请更换为你的高德地图key

  const onCoordChange = (value: CoordChangeProps) => {
    console.log(value);
  };
  const [position, setPosition] = useState([120.405985, 36.120701]);
  const [show, setShow] = useState(true);
  const CoordMapRef = useRef<CoordMapExpose>();
  const switchShow = () => {
    setShow(!show);
    if (!show && CoordMapRef.current) {
      CoordMapRef.current.resetMap();
    }
  };

  return (
    <>
      <button onClick={switchShow}>切换</button>
      <div
        className='Example'
        style={{ height: "600px", display: show ? "block" : "none" }}
      >
        {/* {show && ( */}
        <CoordMap
          ref={CoordMapRef}
          mapKey={MAP_KEY}
          onCoordChange={onCoordChange}
          position={position}
        />
        {/* )} */}
      </div>
    </>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Example />
  </React.StrictMode>
);

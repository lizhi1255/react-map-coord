import "./index.css";
import React, { useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Button } from "antd";
import CoordMap from "./packages";
import {
  CoordChangeProps,
  CoordMapExpose,
} from "./packages/components/CoordMap";

const Example = () => {
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
      <Button onClick={switchShow}>切换</Button>
      <div
        className='Example'
        style={{ height: "600px", display: show ? "block" : "none" }}
      >
        {/* {show && ( */}
        <CoordMap
          ref={CoordMapRef}
          mapKey='高德地图key'
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

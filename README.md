# react-map-coord

基于 react 和高德地图的坐标拾取工具，具有坐标查询，地址查询，坐标拾取等功能、

## 效果展示

![image](./src/images/example.gif)

## 安装

- `NPM`

```shell
npm install react-map-coord --save
```

- `Yarn`

```shell
yan add element-plus
```

- `browser`

```html
<script src="https://unpkg.com/browse/react-map-coord/dist/coord-map.umd.js"></script>
```

## 组件配置

### 属性

- `mapKey`

  > 高德地图 key

  ```js
  // 类型
  type: string;
  // 是否必选
  required: true;
  ```

- `position`

  > 默认经纬度坐标

  ```js
  // 类型
  type:string|number[]; //[lng,lat]
  // 是否必选
  required:false;
  ```

- `mapConfig`

  > 地图组件配置项

  ```js
  // 类型
  type:{
      width?:string, //地图宽度
      height?:string, //地图高度
      center?:number[], //地图中心
      zoom?:number, //地图层级
      satellite?:boolean, //是否开启卫星图
  };
  // 默认值
  default:{
      width:'100%',
      height:'100%',
      satellite:false,
      zoom:10
  };
  // 是否必选
  required:false;
  ```

### 事件

- `onCoordChange`

  > 当点位地址变化时触发的事件

  ```js
  // 回调参数
  {
      lng:string|number, //经度
      lat:string|number, //纬度
      position:string|number[], //经纬度数组[经度，纬度]
      address:Address, //地址对象
      formattedAddress:string //地址
  };
  // address类型
  interface Address{
      addressComponent: {
          citycode:string,
          adcode:string,
          businessAreas:string[],
          neighborhoodType:string,
          neighborhood: string,
          province: string,
          street: string,
          streetNumber: string,
          township: string
      },
      crosses: string[],
      formattedAddress: string,
      pois: string[],
      roads: string[]
  };
  ```

### 方法

- `resetMap`

  > 重置地图状态

  ```js
  // 参数
  posClear?:boolean //default:false 是否强行清除所有状态，如果组件传入position属性，默认不重置点位及地址数据
  ```

- `destroyMap`

  > 重置并销毁地图

## 注意项

> 组件所在容器需设置高度，或者在配置项属性里设置组件的高度

## 使用

### 使用组件

```react
import React, { useRef, useState } from "react";
import CoordMap, { CoordChangeProps, CoordMapExpose } from "react-map-coord";

const Example = () => {
  const onCoordChange = (value: CoordChangeProps) => {
    console.log(value);
  };
  const [position, setPosition] = useState([120.405985, 36.120701]);
  const CoordMapRef = useRef<CoordMapExpose>();

  return (
      <div style={{ height: "600px" }}>
        <CoordMap
          ref={CoordMapRef}
          mapKey='高德地图key'
          onCoordChange={onCoordChange}
          position={position}
        />
      </div>
  );
};
```

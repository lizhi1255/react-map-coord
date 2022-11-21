import React from 'react';
import styleInject from '../../node_modules/style-inject/dist/style-inject.es.js';

var css_248z = ".spinWrap,.spinWrap .ant-spin-container{height:100%;width:100%}.ant-card-body{padding-top:0}.map-container{height:100%;position:relative;width:100%}.map-container .toolbar{align-content:flex-start;display:flex;flex-wrap:wrap;justify-content:space-between;left:0;padding:10px;pointer-events:none;position:absolute;right:0;top:0;z-index:1}.map-container .toolbar .result-panel{display:flex;flex-direction:column;margin-bottom:10px;pointer-events:all;width:320px}.map-container .toolbar .result-panel.ant-card{background-color:hsla(0,0%,100%,.6)}.map-container .toolbar .result-panel.ant-card .ant-select-selector{background-color:hsla(0,0%,100%,.7)}.map-container .toolbar .result-panel.ant-card .ant-card-head{padding:0 12px}.map-container .toolbar .result-panel.ant-card .ant-card-head-title{padding:12px 0}.map-container .toolbar .result-panel .search-bar{align-items:center;display:flex}.map-container .toolbar .result-panel .search-bar .text{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.map-container .toolbar .result-panel .result-list.ant-list-loading{align-items:center;display:flex;justify-content:center;min-height:100px}.map-container .toolbar .info{background-color:hsla(0,0%,100%,.6);border-radius:2px;padding:12px 12px 0;pointer-events:all}.map-container .toolbar .info .item{align-items:center;display:flex;margin-bottom:12px}.map-container .toolbar .info .ant-input{background-color:hsla(0,0%,100%,.7)}.map-container .toolbar .info .addressText{color:rgba(0,0,0,.85);margin-bottom:0;max-width:210px}.map-container .toolbar .info input[type=number]{-moz-appearance:textfield;appearance:textfield}.map-container .toolbar .info input[type=number]::-webkit-inner-spin-button,.map-container .toolbar .info input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;appearance:none;margin:0}";
styleInject(css_248z);

type SORN = string | number;
interface CoordChangeProps {
    lng: SORN;
    lat: SORN;
    position: SORN[];
    address: Address;
    formattedAddress: string;
}
interface Props {
    mapKey: string;
    mapConfig?: {
        width?: string;
        height?: string;
        center?: number[];
        zoom?: number;
        satellite?: boolean;
    };
    position?: SORN[];
    onCoordChange?: (props: CoordChangeProps) => void;
}
interface Address {
    addressComponent: {
        citycode: string;
        adcode: string;
        businessAreas: string[];
        neighborhoodType: string;
        neighborhood: string;
        province: string;
        street: string;
        streetNumber: string;
        township: string;
    };
    crosses: string[];
    formattedAddress: string;
    pois: string[];
    roads: string[];
}
declare const CoordMap: React.ForwardRefExoticComponent<Props & React.RefAttributes<unknown>>;

export { CoordMap as default };

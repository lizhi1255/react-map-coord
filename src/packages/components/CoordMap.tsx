import "./CoordMap.less";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import {
  Button,
  Card,
  Input,
  Spin,
  AutoComplete as AutoCompleteEl,
  List,
  Pagination,
  Switch,
} from "antd";

declare global {
  interface Window {
    _AMapSecurityConfig: { securityJsCode: string };
  }
}

type SORN = string | number;

export interface CoordChangeProps {
  lng: SORN;
  lat: SORN;
  position: SORN[];
  address: Address;
  formattedAddress: string;
}

interface Props {
  mapKey: string; //高德地图key
  securityJsCode?: string; //高德地图安全密钥
  mapConfig?: {
    //地图配置
    width?: string; //地图宽度
    height?: string; //地图高度
    center?: number[]; //地图中心
    zoom?: number; //地图层级
    satellite?: boolean; //是否开启卫星图
  };
  position?: SORN[]; //[lng,lat]
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

export interface CoordMapExpose {
  resetMap: (posClear?: boolean) => void;
  destroyMap: () => void;
}

// useDebounce 防抖
const useDebounce = <T,>(value: T, delay?: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debouncedValue;
};

class Debounce {
  delay: number;
  timeout: NodeJS.Timeout | null;
  constructor(delay?: number) {
    this.delay = delay ? delay : 200;
    this.timeout = null;
  }
  debounceEnd() {
    return new Promise((resolve, reject) => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        resolve("success");
      }, this.delay);
    });
  }
}

const propsDefault: Props = {
  mapKey: "",
  mapConfig: {
    width: "100%",
    height: "100%",
    satellite: false,
    zoom: 10,
  },
};

const CoordMap = forwardRef((props: Props = propsDefault, ref) => {
  useImperativeHandle<unknown, CoordMapExpose>(ref, () => ({
    resetMap,
    destroyMap,
  }));
  const [Map, setMap] = useState<any>();
  const [AMap, setAMap] = useState<any>();
  const [AutoComplete, setAutoComplete] = useState<any>();
  const [PlaceSearch, setPlaceSearch] = useState<any>();
  const [initLoading, setInitLoading] = useState<boolean>();
  const [initCenter, setInitCenter] = useState();

  useEffect(() => {
    initMap();
  }, []);

  const initMap = async () => {
    if (AMap && Map) return;
    setInitLoading(true);
    window._AMapSecurityConfig = {
      securityJsCode: props.securityJsCode || "",
    };
    const aMap = await AMapLoader.load({
      key: props.mapKey,
      version: "2.0",
      plugins: [
        "AMap.Geocoder", //查询地址
        "AMap.AutoComplete", //自动填充
        "AMap.PlaceSearch", //搜索
      ],
    });
    const map = new aMap.Map("map", {
      zoom: props.mapConfig?.zoom || 10,
      center: props.position || props.mapConfig?.center,
    });
    map.on("click", mapClick);

    SatelliteRef.current = new aMap.TileLayer.Satellite();
    setGeoCoder(new aMap.Geocoder());
    setAutoComplete(new aMap.AutoComplete());
    setPlaceSearch(new aMap.PlaceSearch());
    setInitCenter(map.getCenter());

    setAMap(aMap);
    setMap(map);
    setInitLoading(false);
  };

  // 卫星图 图层
  const [satellite, setSatellite] = useState(props.mapConfig?.satellite);
  const SatelliteRef = useRef();

  useEffect(() => {
    if (!Map) return;
    if (satellite) {
      Map.addLayer(SatelliteRef.current);
    } else {
      Map.removeLayer(SatelliteRef.current);
    }
  }, [Map, satellite]);

  // 点位标记
  const [position, setPosition] = useState<SORN[]>(["", ""]);
  const [marker, setMarker] = useState<any>();

  const mapClick = (e: { lnglat: { lng: number; lat: number } }) => {
    setPosition([e.lnglat.lng, e.lnglat.lat]);
    createMarker(e.lnglat.lng, e.lnglat.lat);
  };
  const createMarker = (lng: SORN, lat: SORN) => {
    if (!AMap) return;
    if (!marker) {
      const marker = new AMap.Marker({
        position: new AMap.LngLat(lng, lat),

        // 设置是否可以拖拽
        draggable: true,
      });
      marker.on("dragging", onMovingMaker);
      Map.add(marker);
      setMarker(marker);
    } else {
      marker.setPosition(new AMap.LngLat(lng, lat));
    }
  };
  const onMovingMaker = (e: any) => {
    setPosition(e.target._position);
  };

  useEffect(() => {
    if (!position[0] || !position[1]) return;
    setAddress("");
    createMarker(position[0], position[1]);
    getAddress(position[0], position[1]);
    Map.setCenter(position);
  }, [useDebounce(position, 200)]);

  useEffect(() => {
    if (!Map || !AMap) return;
    if (props.position instanceof Array) {
      setPosition(props.position);
    }
  }, [Map, AMap, props.position]);

  // 地址
  const [address, setAddress] = useState<any>();
  const [geoCoder, setGeoCoder] = useState<any>();
  const [addressLoading, setAddressLoading] = useState(false);

  const getAddress = (lng: SORN, lat: SORN) => {
    setAddressLoading(true);

    geoCoder?.getAddress(
      [lng, lat],
      (status: never, result: { info: string; regeocode: Address }) => {
        if (status === "complete" && result.info === "OK") {
          setAddress(result.regeocode.formattedAddress);
          setAddressLoading(false);

          if (
            (props.position?.[0] === position[0] &&
              props.position?.[1] === position[1]) ||
            !props.onCoordChange
          )
            return;
          props.onCoordChange({
            position: position,
            lng: position[0],
            lat: position[1],
            address: result.regeocode,
            formattedAddress: result.regeocode.formattedAddress,
          });
        }
      }
    );
  };

  // 搜索
  const [mode, setMode] = useState<"search" | "result">("search");
  const [query, setQuery] = useState("");
  const [tips, setTips] = useState<{ value: string; label: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const searchDe = useRef(new Debounce());
  const autoComplete = async (searchText: string) => {
    await searchDe.current.debounceEnd();
    if (!searchText) {
      setTips([]);
    } else {
      AutoComplete.search(
        searchText,
        (status: string, result: { tips: any }) => {
          if (status === "complete" && result.tips) {
            const list: { value: string; label: string }[] = [];
            result.tips.map((tip: { name: string }) => {
              if (list.find((v: any) => v.value === tip.name)) return;
              list.push({ value: tip.name, label: tip.name });
            });
            setTips(list);
          } else {
            setTips([]);
          }
        }
      );
    }
  };

  interface Results {
    address: string;
    distance: number;
    id: string;
    location: any;
    name: string;
  }
  const [results, setResults] = useState<Results[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const search = (clear: boolean = false, val?: any) => {
    setMode("result");
    setSearching(true);

    if (clear) {
      setResults([]);
      setTotal(0);
      PlaceSearch.setPageIndex(1);
    }

    PlaceSearch.search(
      val || query,
      (
        status: string,
        result: { poiList: { pois: Results[]; count: number } }
      ) => {
        setSearching(false);
        if (status === "complete" && result.poiList) {
          setResults(result.poiList.pois);
          setTotal(result.poiList.count);
        } else {
          setResults([]);
          setTotal(0);
        }
      }
    );
  };
  const pageChange = (pageIndex: number) => {
    if (!PlaceSearch || searching) return;
    PlaceSearch.setPageIndex(pageIndex);
    search(false);
  };

  const reset = () => {
    setTips([]);
    setMode("search");
    setResults([]);
    setTotal(0);
    PlaceSearch?.setPageIndex(1);
  };
  const focus = (poi: { location: { lng: number; lat: number } }) => {
    const pos = [poi.location.lng, poi.location.lat];
    setPosition([...pos]);
    Map.setCenter([...pos]);
  };

  // 是否是手机端
  const [isMobileIphone, setIsMobileIphone] = useState(
    document.body.clientWidth < 640
  );
  window.onresize = () => {
    setIsMobileIphone(document.body.clientWidth < 640);
  };

  // 重置地图
  const resetMap = (posClear = false) => {
    reset();
    setQuery("");
    setSearching(false);
    setAddressLoading(false);
    setInitLoading(false);
    setSatellite(props.mapConfig?.satellite);
    if (props.position && !posClear) return;
    Map?.setCenter(initCenter);
    setMarker(null);
    Map?.clearMap();
    setAddress("");
    setPosition(["", ""]);
  };

  // 卸载地图
  const destroyMap = () => {
    resetMap();
    Map?.destroy();
  };

  return (
    <Spin spinning={initLoading} size='large' wrapperClassName='spinWrap'>
      <main className='map-container'>
        <div
          id='map'
          style={{
            width: props.mapConfig?.width || "100%",
            height: props.mapConfig?.height || "100%",
          }}
        ></div>
        <div className='toolbar'>
          <div>
            <Card
              bodyStyle={{
                maxHeight: "450px",
                overflowY: "auto",
                padding: mode === "result" ? "24px" : 0,
              }}
              className='result-panel'
              title={
                mode === "search" ? (
                  <Input.Group compact style={{ display: "flex" }}>
                    <AutoCompleteEl
                      value={query}
                      options={tips}
                      placeholder='输入关键词'
                      style={{ flex: 1 }}
                      onSearch={autoComplete}
                      onSelect={(e: any) => search(true, e)}
                      onChange={setQuery}
                      allowClear
                    />
                    <Button
                      onClick={() => search(true)}
                      disabled={!query}
                      type='primary'
                    >
                      搜索
                    </Button>
                  </Input.Group>
                ) : (
                  <div className='search-bar'>
                    <Button onClick={reset} style={{ marginRight: "6px" }}>
                      返回
                    </Button>
                    <span className='text'>
                      搜索 {query} 共{searching ? "..." : total}条结果
                    </span>
                  </div>
                )
              }
            >
              {mode === "result" && (
                <List
                  dataSource={results}
                  loading={searching}
                  item-layout='vertical'
                  size='small'
                  className='result-list'
                  header={
                    total > 0 && (
                      <Pagination
                        defaultCurrent={1}
                        page-size={pageSize}
                        total={total}
                        size='small'
                        showSizeChanger={false}
                        onChange={pageChange}
                      />
                    )
                  }
                  footer={
                    total > 0 && (
                      <Pagination
                        defaultCurrent={1}
                        page-size={pageSize}
                        total={total}
                        size='small'
                        showSizeChanger={false}
                        onChange={pageChange}
                      />
                    )
                  }
                  renderItem={(item: Results) => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        description={item.address}
                        title={
                          <span
                            onClick={() => focus(item)}
                            style={{ cursor: "pointer" }}
                          >
                            {item.name}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                ></List>
              )}
            </Card>
          </div>
          <div>
            {((mode === "search" && isMobileIphone) || !isMobileIphone) && (
              <div className='info ant-card ant-card-bordered'>
                <div className='item'>
                  <div className='label'>坐标：</div>
                  <div>
                    <Input
                      value={position[0]}
                      style={{ width: "100px" }}
                      placeholder='lng'
                      type='number'
                      onChange={(e) =>
                        setPosition([e.target.value, position[1]])
                      }
                    />
                    ,
                    <Input
                      value={position[1]}
                      style={{ width: "100px" }}
                      placeholder='lat'
                      type='number'
                      onChange={(e) =>
                        setPosition([position[0], e.target.value])
                      }
                    />
                  </div>
                </div>
                <div className='item'>
                  <div className='label'>地址：</div>
                  <Spin spinning={addressLoading}>
                    <p className='addressText'>{address || "--"}</p>
                  </Spin>
                </div>
                <div className='item'>
                  <div className='label'>卫星图：</div>
                  <Switch defaultChecked={satellite} onChange={setSatellite} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </Spin>
  );
});

export default CoordMap;

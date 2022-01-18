import React, { useState, useEffect, useCallback, useRef } from "react";
import MapGL, { Marker, Layer, Source } from "react-map-gl";

import ProprieteData from "./interfaceMarker";
import Hover from "./interfaceHover";
import lieuDeTournage from "./lieux";
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
} from "./Layers";
export default function Map() {
  const [location, setLocation] = useState<ProprieteData[]>([]);
  const [dataRating, setDataRating] = useState<ProprieteData[]>([]);
  const [hoverInfo, setHoverInfo] = useState<Hover>();
  const mapRef: any = useRef(null);

  useEffect(() => {
    lieuDeTournage.features.map((data: any) => {
      return (
        setLocation((location: any) => [...location, data.properties]),
        setDataRating((location: any) => [...location, data.properties])
      );
    });
  }, []);

  const [viewport, setViewport] = useState({
    width: Number(window.innerWidth),
    height: Number(window.innerHeight),
    latitude: Number(48.8609041),
    longitude: Number(2.3437745),
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    zoom: Number(11),
    bearing: Number(0),
    pitch: Number(50), // degré
    transitionDuration: Number(500),
  });

  const onClick = (event: any) => {
    if (event.features[0].properties.cluster) {
      const feature = event.features[0];
      const clusterId = feature.properties.cluster_id;

      const mapboxSource = mapRef.current.getMap().getSource("earthquakes");

      mapboxSource.getClusterExpansionZoom(
        clusterId,
        (err: Error, zoom: number) => {
          if (err) {
            console.log(err);
          }
          if (
            feature.geometry.coordinates[0] &&
            feature.geometry.coordinates[1]
          ) {
            setViewport({
              ...viewport,
              width: Number(window.innerWidth),
              height: Number(window.innerHeight),
              longitude: feature.geometry.coordinates[0],
              latitude: feature.geometry.coordinates[1],
              zoom,
              transitionDuration: 500,
            });
          }
        }
      );
    }
  };

  return (
    <MapGL
      mapStyle={"mapbox://styles/mapbox/dark-v10"}
      mapboxApiAccessToken="pk.eyJ1IjoiYmVrcmk5MyIsImEiOiJja3lpaDZmcnMyZDZlMnhvOG1jeTY2cHJiIn0.v2MfvUiv8Yu4-VS-R5ns3Q"
      {...viewport}
      onViewportChange={setViewport}
      onClick={onClick}
      ref={mapRef}
    >
      <Source
        id="earthquakes"
        type="geojson"
        data="/data/lieux-de-tournage-a-paris.geojson"
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer
          id="clusters"
          type="circle"
          source="earthquakes"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              100,
              "#f1f075",
              750,
              "#f28cb1",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
          }}
        />
        <Layer
          id="cluster-count"
          type="symbol"
          source="earthquakes"
          filter={["has", "point_count"]}
          layout={{
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          }}
          paint={{}}
        />
        <Layer
          id="unclustered-point"
          type="circle"
          source="earthquakes"
          filter={["!", ["has", "point_count"]]}
          paint={{
            "circle-color": "#11b4da",
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
          }}
        />
      </Source>

      <Source
        id="polylineLayer"
        type="geojson"
        data="/data/arrondissements.geojson"
      >
        <Layer
          id="lineLayer"
          type="line"
          source="my-data"
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": "rgba(3, 170, 238, 0.5)",
            "line-width": 3,
          }}
        />
      </Source>
    </MapGL>
  );
}

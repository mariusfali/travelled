import "@/global.css";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Polygon } from "react-native-maps";
import countriesGeoJson from "../assets/data/countries.json";

type GeoJsonFeature = {
  type: string;
  properties?: Record<string, unknown>;
  geometry?: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
};

type GeoJsonData = {
  type: string;
  features?: GeoJsonFeature[];
};

type PolygonDefinition = {
  key: string;
  coordinates: { latitude: number; longitude: number }[];
  holes?: { latitude: number; longitude: number }[][];
};

const toLatLng = (ring: number[][]): { latitude: number; longitude: number }[] =>
  ring.map(([longitude, latitude]) => ({ latitude, longitude }));

const buildPolygonDefinitions = (): PolygonDefinition[] => {
  const geoJson = countriesGeoJson as GeoJsonData;
  if (!geoJson?.features) return [];

  return geoJson.features.flatMap((feature: GeoJsonFeature, featureIndex: number) => {
    const geometry = feature.geometry;
    if (!geometry) return [];

    if (geometry.type === "Polygon") {
      const rings = geometry.coordinates as number[][][];
      const outer = toLatLng(rings[0] ?? []);
      const holes = (rings.slice(1) ?? []).map((ring) => toLatLng(ring));

      return [{ key: `${featureIndex}-0`, coordinates: outer, holes }];
    }

    if (geometry.type === "MultiPolygon") {
      const multipolygons = geometry.coordinates as number[][][][];
      return multipolygons.flatMap((polygon, polygonIndex) => {
        const rings = polygon ?? [];
        if (!rings.length) return [];

        const outer = toLatLng(rings[0] ?? []);
        const holes = (rings.slice(1) ?? []).map((ring) => toLatLng(ring));

        return [{ key: `${featureIndex}-${polygonIndex}`, coordinates: outer, holes }];
      });
    }

    return [];
  });
};

export default function App() {
  const polygons = useMemo(() => buildPolygonDefinitions(), []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 20,
          longitude: 0,
          latitudeDelta: 90,
          longitudeDelta: 150,
        }}
      >
        {polygons.map((polygon) => (
          <Polygon
            key={polygon.key}
            coordinates={polygon.coordinates}
            holes={polygon.holes}
            strokeColor="#2563eb"
            strokeWidth={0.8}
            fillColor="rgba(37, 99, 235, 0.18)"
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  map: {
    flex: 1,
  },
});

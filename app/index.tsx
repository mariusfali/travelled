
import "@/global.css";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Polygon } from "react-native-maps";
import countriesData from "../assets/data/countries.json";

type GeoJsonPoint = [number, number];
type GeoJsonRing = GeoJsonPoint[];
type GeoJsonPolygon = GeoJsonRing[];
type GeoJsonMultiPolygon = GeoJsonPolygon[];

type LatLng = {
  latitude: number;
  longitude: number;
};
type PolygonRing = LatLng[];

type GeoJsonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: GeoJsonPolygon | GeoJsonMultiPolygon;
};

type GeoJsonFeature = {
  type: "Feature";
  properties?: {
    name?: string;
  };
  geometry?: GeoJsonGeometry;
};

type GeoJsonCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

const worldData = countriesData as GeoJsonCollection;

const toLatLng = ([longitude, latitude]: GeoJsonPoint): LatLng => ({
  latitude,
  longitude,
});

const getPolygonRings = (geometry?: GeoJsonGeometry): PolygonRing[] => {
  if (!geometry) return [];

  if (geometry.type === "Polygon") {
    return (geometry.coordinates as GeoJsonPolygon).map((ring) =>
      ring.map((point) => toLatLng(point))
    );
  }

  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as GeoJsonMultiPolygon).flatMap((polygon) =>
      polygon.map((ring) => ring.map((point) => toLatLng(point)))
    );
  }

  return [];
};

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState("World map");

  const polygons = useMemo(
    () =>
      worldData.features
        .map((feature) => {
          const name = feature.properties?.name ?? "Country";
          const rings = getPolygonRings(feature.geometry);
          return { name, rings };
        })
        .filter((country) => country.rings.length > 0),
    []
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 20,
          longitude: 0,
          latitudeDelta: 65,
          longitudeDelta: 120,
        }}
        showsCompass={false}
        showsScale={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled
        zoomEnabled
      >
        {polygons.map(({ name, rings }) =>
          rings.map((ring: PolygonRing, index: number) => (
            <Polygon
              key={`${name}-${index}`}
              coordinates={ring}
              strokeColor="rgba(29, 78, 216, 0.95)"
              fillColor="rgba(96, 165, 250, 0.08)"
              strokeWidth={0.9}
              tappable
              onPress={() => setSelectedCountry(name)}
            />
          ))
        )}
      </MapView>

      <View style={styles.infoBar} pointerEvents="none">
        <Text style={styles.infoText}>{selectedCountry}</Text>
      </View>
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
  infoBar: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  infoText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});


import "@/global.css";
import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Polygon } from "react-native-maps";
import countriesData from "../assets/data/countries-merged.json";

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
  type?: string;
  coordinates?: unknown;
};

type GeoJsonFeature = {
  type: "Feature";
  properties?: {
    name?: string;
    NAME?: string;
    ADMIN?: string;
    [key: string]: unknown;
  };
  geometry?: GeoJsonGeometry;
};

type GeoJsonCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

const worldData = countriesData as unknown as GeoJsonCollection;

const getCountryName = (feature: GeoJsonFeature) =>
  feature.properties?.name ?? feature.properties?.NAME ?? feature.properties?.ADMIN ?? "Country";

const isAntarctica = (feature: GeoJsonFeature) => {
  const name = getCountryName(feature).toLowerCase();
  return name === "antarctica" || name.includes("antarctic");
};

const toLatLng = ([longitude, latitude]: GeoJsonPoint): LatLng => ({
  latitude,
  longitude,
});

const getPolygonRings = (geometry?: GeoJsonGeometry): PolygonRing[] => {
  if (!geometry || !geometry.coordinates) return [];

  const coordinates = geometry.coordinates as any;

  if (geometry.type === "Polygon") {
    return coordinates.map((ring: GeoJsonRing) => ring.map((point: GeoJsonPoint) => toLatLng(point)));
  }

  if (geometry.type === "MultiPolygon") {
    return coordinates.flatMap((polygon: GeoJsonPolygon) =>
      polygon.map((ring: GeoJsonRing) => ring.map((point: GeoJsonPoint) => toLatLng(point)))
    );
  }

  return [];
};

export default function App() {
  // const [selectedCountry, setSelectedCountry] = useState("World map");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const polygonWasPressed = useRef(false);

  const polygons = useMemo(
    () =>
      worldData.features
        .filter((feature) => !isAntarctica(feature))
        .map((feature) => {
          const name = getCountryName(feature);
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
        // initialRegion={{
        //   latitude: 20,
        //   longitude: 0,
        //   latitudeDelta: 65,
        //   longitudeDelta: 120,
        // }}
        initialCamera={{
          center: {
            latitude: 20,
            longitude: 10,
          },
          pitch: 0, // camera tilt
          heading: 0, // map rotation
          zoom: 2,
        }}
        showsCompass={false}
        showsScale={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled
        zoomEnabled

        onPress={() => {
          if (!polygonWasPressed.current) {
            setSelectedCountry(null);
          }

          polygonWasPressed.current = false;
        }}
      >
        {polygons.map(({ name, rings }) =>
          rings.map((ring: PolygonRing, index: number) => (
            <Polygon
              key={`${name}-${index}`}
              coordinates={ring}
              strokeColor="rgba(0, 0, 0, 0.7)"
              // fillColor="rgba(96, 165, 250, 0.08)"
              fillColor={
                selectedCountry === name
                  ? "rgba(162, 2, 255, 0.55)"
                  : "rgba(80, 79, 79, 0.15)" // farge også opacity på slutten der
              }
              // strokeWidth={2}
              strokeWidth={selectedCountry === name ? 2 : 1}
              tappable
              // onPress={() => setSelectedCountry(name)}
              onPress={() => {
                polygonWasPressed.current = true;

                setSelectedCountry((current) =>
                  current === name ? null : name
                );
              }}
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

import "@/global.css";

import React, {
  useMemo,
  useState,
} from "react";

import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Svg, {
  Path,
  G,
} from "react-native-svg";

import countriesData from "../assets/data/ne_110m_admin_0_countries.json";

type GeoJsonPoint = [number, number];

type GeoJsonRing = GeoJsonPoint[];

type GeoJsonPolygon = GeoJsonRing[];

type GeoJsonMultiPolygon =
  GeoJsonPolygon[];

type GeoJsonGeometry =
  | {
      type: "Polygon";
      coordinates: GeoJsonPolygon;
    }
  | {
      type: "MultiPolygon";
      coordinates: GeoJsonMultiPolygon;
    };

type CountryProperties = {
  NAME?: string;
  name?: string;
  ADMIN?: string;

  ISO_A3?: string;
  ISO_A2?: string;

  "ISO3166-1-Alpha-2"?: string;
  "ISO3166-1-Alpha-3"?: string;

  [key: string]: unknown;
};

type GeoJsonFeature = {
  type: "Feature";
  properties?: CountryProperties;
  geometry?: GeoJsonGeometry;
};

type GeoJsonCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

type Country = {
  id: string;
  name: string;
  geometry: GeoJsonGeometry;
};

const worldData =
  countriesData as unknown as GeoJsonCollection;

console.log(
  "Country features:",
  worldData.features.length
);

const { width, height } =
  Dimensions.get("window");

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 500;

/**
 * Convert longitude/latitude into SVG coordinates.
 *
 * Longitude:
 *   -180 → 0
 *    180 → SVG_WIDTH
 *
 * Latitude:
 *    90 → 0
 *   -90 → SVG_HEIGHT
 */
const projectPoint = (
  [longitude, latitude]: GeoJsonPoint
): [number, number] => {
  const x =
    ((longitude + 180) / 360) *
    SVG_WIDTH;

  const y =
    ((90 - latitude) / 180) *
    SVG_HEIGHT;

  return [x, y];
};

/**
 * Convert one GeoJSON ring into an SVG path.
 */
const ringToPath = (
  ring: GeoJsonRing
): string => {
  if (ring.length === 0) {
    return "";
  }

  const points = ring.map(projectPoint);

  let path = `M ${points[0][0]} ${points[0][1]}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i][0]} ${points[i][1]}`;
  }

  path += " Z";

  return path;
};

/**
 * Convert Polygon / MultiPolygon
 * into one SVG path.
 */
const geometryToPath = (
  geometry: GeoJsonGeometry
): string => {
  if (geometry.type === "Polygon") {
    return geometry.coordinates
      .map(ringToPath)
      .join(" ");
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .flatMap((polygon) =>
        polygon.map(ringToPath)
      )
      .join(" ");
  }

  return "";
};

export default function App() {
  const [selectedCountry, setSelectedCountry] =
    useState("Tap a country");

  const [visited, setVisited] =
    useState<Set<string>>(new Set());

  const countries =
    useMemo<Country[]>(() => {
      return worldData.features
        .map((feature, index) => {
          const properties =
            feature.properties ?? {};

          const name =
            properties.ADMIN ??
            properties.NAME ??
            properties.name ??
            "Unknown";

          const isoCode =
            typeof properties.ISO_A3 === "string"
              ? properties.ISO_A3
              : typeof properties[
                  "ISO3166-1-Alpha-3"
                ] === "string"
              ? properties[
                  "ISO3166-1-Alpha-3"
                ]
              : undefined;

          const id =
            isoCode && isoCode !== "-99"
              ? isoCode
              : `${name}-${index}`;

          if (!feature.geometry) {
            return null;
          }

          return {
            id,
            name,
            geometry:
              feature.geometry,
          };
        })
        .filter(
          (
            country
          ): country is Country =>
            country !== null
        );
    }, []);

  console.log(
    "Renderable countries:",
    countries.length
  );

  const handleCountryPress = (
    country: Country
  ) => {
    setSelectedCountry(country.name);

    setVisited((current) => {
      const next = new Set(current);

      if (next.has(country.id)) {
        next.delete(country.id);
      } else {
        next.add(country.id);
      }

      return next;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Svg
          width={width}
          height={width / 2}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        >
          <G>
            {countries.map((country) => {
              const isVisited =
                visited.has(country.id);

              const path =
                geometryToPath(
                  country.geometry
                );

              return (
                <Path
                  key={country.id}
                  d={path}
                  fill={
                    isVisited
                      ? "#4F46E5"
                      : "#E2E8F0"
                  }
                  stroke="#475569"
                  strokeWidth={0.7}
                  strokeLinejoin="round"
                  onPress={() =>
                    handleCountryPress(
                      country
                    )
                  }
                />
              );
            })}
          </G>
        </Svg>
      </View>

      <View
        style={styles.infoBar}
        pointerEvents="none"
      >
        <Text style={styles.infoText}>
          {selectedCountry}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  mapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  infoBar: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,

    backgroundColor:
      "rgba(15, 23, 42, 0.85)",

    borderRadius: 999,

    paddingHorizontal: 16,
    paddingVertical: 10,

    alignItems: "center",
  },

  infoText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
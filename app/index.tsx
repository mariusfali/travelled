import "@/global.css";

import React, { useMemo, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Svg, {
  Path,
  G,
} from "react-native-svg";

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import Animated, {
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";

import countriesData from "../assets/data/ne_110m_admin_0_countries.json";


// ─────────────────────────────────────────────
// GeoJSON types
// ─────────────────────────────────────────────

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
  iso3: string | null;
  name: string;
  geometry: GeoJsonGeometry;
};


// ─────────────────────────────────────────────
// Map configuration
// ─────────────────────────────────────────────

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 500;

const MIN_SCALE = 1;
const MAX_SCALE = 10;


// ─────────────────────────────────────────────
// Dataset
// ─────────────────────────────────────────────

const worldData =
  countriesData as unknown as GeoJsonCollection;

console.log(
  "Country features:",
  worldData.features.length
);


// ─────────────────────────────────────────────
// GeoJSON → SVG projection
// ─────────────────────────────────────────────

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


const ringToPath = (
  ring: GeoJsonRing
): string => {
  if (ring.length === 0) {
    return "";
  }

  const points = ring.map(projectPoint);

  let path =
    `M ${points[0][0]} ${points[0][1]}`;

  for (let i = 1; i < points.length; i++) {
    path +=
      ` L ${points[i][0]} ${points[i][1]}`;
  }

  path += " Z";

  return path;
};


const geometryToPath = (
  geometry: GeoJsonGeometry
): string => {
  if (geometry.type === "Polygon") {
    return geometry.coordinates
      .map(ringToPath)
      .join(" ");
  }

  return geometry.coordinates
    .flatMap((polygon) =>
      polygon.map(ringToPath)
    )
    .join(" ");
};


// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────

export default function App() {

  const [
    selectedCountry,
    setSelectedCountry,
  ] = useState("Tap a country");

  const [
    visited,
    setVisited,
  ] = useState<Set<string>>(new Set());


  // ───────────────────────────────────────────
  // Prepare countries
  // ───────────────────────────────────────────

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


          const iso3 =
            typeof properties.ISO_A3 ===
              "string" &&
            properties.ISO_A3 !== "-99"

              ? properties.ISO_A3

              : typeof properties[
                  "ISO3166-1-Alpha-3"
                ] === "string" &&
                properties[
                  "ISO3166-1-Alpha-3"
                ] !== "-99"

              ? properties[
                  "ISO3166-1-Alpha-3"
                ] as string

              : null;


          if (!feature.geometry) {
            return null;
          }


          return {
            id:
              `${iso3 ?? name}-${index}`,

            iso3,

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


  // ───────────────────────────────────────────
  // Country tap
  // ───────────────────────────────────────────

  const handleCountryPress = (
    country: Country
  ) => {

    setSelectedCountry(
      country.name
    );


    setVisited((current) => {

      const next =
        new Set(current);

      if (
        next.has(country.id)
      ) {
        next.delete(country.id);
      } else {
        next.add(country.id);
      }

      return next;
    });
  };


  // ───────────────────────────────────────────
  // Gesture state
  // ───────────────────────────────────────────

  const scale =
    useSharedValue(1);

  const savedScale =
    useSharedValue(1);


  const translateX =
    useSharedValue(0);

  const translateY =
    useSharedValue(0);

  const savedTranslateX =
    useSharedValue(0);

  const savedTranslateY =
    useSharedValue(0);


  // ───────────────────────────────────────────
  // Pan gesture
  // ───────────────────────────────────────────

  const panGesture =
    Gesture.Pan()

      .onStart(() => {
        savedTranslateX.value =
          translateX.value;

        savedTranslateY.value =
          translateY.value;
      })

      .onUpdate((event) => {

        translateX.value =
          savedTranslateX.value +
          event.translationX;

        translateY.value =
          savedTranslateY.value +
          event.translationY;
      });


  // ───────────────────────────────────────────
  // Pinch gesture
  // ───────────────────────────────────────────

  const pinchGesture =
    Gesture.Pinch()

      .onStart(() => {
        savedScale.value =
          scale.value;
      })

      .onUpdate((event) => {

        const nextScale =
          savedScale.value *
          event.scale;

        scale.value =
          Math.min(
            MAX_SCALE,
            Math.max(
              MIN_SCALE,
              nextScale
            )
          );
      });


  // ───────────────────────────────────────────
  // Combine gestures
  // ───────────────────────────────────────────

  const composedGesture =
    Gesture.Simultaneous(
      panGesture,
      pinchGesture
    );


  // ───────────────────────────────────────────
  // Animated map style
  // ───────────────────────────────────────────

  const animatedMapStyle =
    useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX:
              translateX.value,
          },
          {
            translateY:
              translateY.value,
          },
          {
            scale:
              scale.value,
          },
        ],
      };
    });


  // ───────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────

  return (

    <GestureHandlerRootView
      style={styles.root}
    >

      <View
        style={styles.container}
      >

        <View
          style={styles.mapViewport}
        >

          <GestureDetector
            gesture={
              composedGesture
            }
          >

            <Animated.View
              style={[
                styles.map,
                animatedMapStyle,
              ]}
            >
              <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
              >

                <G>

                  {countries.map(
                    (country) => {

                      const isVisited =
                        visited.has(
                          country.id
                        );

                      const path =
                        geometryToPath(
                          country.geometry
                        );

                      return (

                        <Path
                          key={
                            country.id
                          }

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
                    }
                  )}

                </G>

              </Svg>

            </Animated.View>

          </GestureDetector>


        {/* Country name */}

        <View
          style={styles.infoBar}
          pointerEvents="none"
        >

          <Text
            style={styles.infoText}
          >
            {selectedCountry}
          </Text>

        </View>

      </View>

    </View>

    </GestureHandlerRootView>
  );
}


// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles =
  StyleSheet.create({

    root: {
      flex: 1,
    },

    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
      overflow: "hidden",
    },

    mapViewport: {
      flex: 1,
      overflow: "hidden",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    map: {
      width: "100%",
      height: "100%",
    },

    infoBar: {
      position:
        "absolute",

      top: 48,

      left: 16,

      right: 16,

      backgroundColor:
        "rgba(15, 23, 42, 0.85)",

      borderRadius: 999,

      paddingHorizontal: 16,

      paddingVertical: 10,

      alignItems:
        "center",
    },

    infoText: {
      color:
        "#F8FAFC",

      fontSize: 14,

      fontWeight:
        "600",

      letterSpacing:
        0.2,
    },

  });
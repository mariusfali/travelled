
import "@/global.css";
import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import MapView, { Polygon } from "react-native-maps";
import countriesData from "../../assets/data/countries-merged.json";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { CountryStatus, Memory, CountryUserData, TravelData } from "@/types/travel";
import { useSQLiteContext } from "expo-sqlite";
import { getTravelData, setCountryStatus } from "@/database/countries";

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
    ISO_A2?: string;
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

  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);

  const polygons = useMemo(
    () =>
      worldData.features
        .filter((feature) => !isAntarctica(feature))
        .map((feature) => {
          const name = getCountryName(feature);
          const code = feature.properties?.ISO_A2;
          const rings = getPolygonRings(feature.geometry);
          return { name, code, rings };
        })
        .filter(
          (country): country is {
            name: string;
            code: string;
            rings: PolygonRing[];
          } =>
            country.rings.length > 0 &&
            typeof country.code === "string"
        ),
    []
  );

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index); // Denne logger bare sheet stae, men kan være nyttig hvis jeg vil endre UI for om sheeten er dratt opp eller ei
    if (index === -1) {
      setSelectedCountryCode(null);
    }
  }, []);

  const snapPoints = ["30%", "80%"];

  useEffect(() => {
    if (selectedCountryCode) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [selectedCountryCode]);



  const db = useSQLiteContext();
  const [travelData, setTravelData] = useState<TravelData>({});

  useEffect(() => {
    async function loadTravelData() {
      const data = await getTravelData(db);
      setTravelData(data);
    }

    loadTravelData();
  }, [db]);

  const updateCountryStatus = async (
    status: CountryStatus | null
  ) => {
    if (!selectedCountryCode) return;

    await setCountryStatus(
      db,
      selectedCountryCode,
      status
    );

    setTravelData((current) => {
      const existing = current[selectedCountryCode];

      if (status === null) {
        return {
          ...current,
          [selectedCountryCode]: {
            ...existing,
            status: undefined,
            memories: existing?.memories ?? [],
          },
        };
      }

      return {
        ...current,
        [selectedCountryCode]: {
          ...existing,
          status,
          memories: existing?.memories ?? [],
        },
      };
    });
  };

  const currentStatus =
    selectedCountryCode
      ? travelData[selectedCountryCode]?.status
      : undefined;

  const selectedCountry = polygons.find(
    (country) => country.code === selectedCountryCode
  );


  return (
    <GestureHandlerRootView style={styles.container}>
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
            setSelectedCountryCode(null);
        }}
      >
        {polygons.map(({ name, code, rings }) =>
          rings.map((ring: PolygonRing, index: number) => (
            <Polygon
              key={`${name}-${index}`}
              coordinates={ring}
              strokeColor="rgba(0, 0, 0, 0.7)"
              // fillColor="rgba(96, 165, 250, 0.08)"
              fillColor={
                travelData[code]?.status === "visited"
                  ? "rgba(162, 2, 255, 0.55)"
                  : travelData[code]?.status === "want"
                    ? "rgba(25, 202, 193, 0.55)"
                    : travelData[code]?.status === "lived"
                      ? "rgba(247, 163, 37, 0.55)"
                      : "rgba(80, 79, 79, 0.15)" // opacity er den siste
              }
              // strokeWidth={2}
              strokeWidth={selectedCountryCode === code ? 3 : 1}
              tappable
              // onPress={() => setSelectedCountry(name)}
              // onPress={() => {
              //   setSelectedCountryCode((current) =>
              //     current === code ? null : code
              //   );
              // }}
              onPress={() => {
                setSelectedCountryCode((current) =>
                  current === code ? null : code
                );
              }}
            />
          ))
        )}
      </MapView>
        <BottomSheet
          ref={bottomSheetRef}
          onChange={handleSheetChanges}
          snapPoints={snapPoints}
          index={-1}
          enableDynamicSizing={false}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={styles.contentContainer}>
            <Text style={{paddingBottom: 30}}>{selectedCountry?.name}</Text>
            <View style={{flexDirection: "row", gap: 20}}>
              <Pressable
                onPress={() =>
                  updateCountryStatus(
                    currentStatus === "visited"
                      ? null
                      : "visited"
                  )
                }
                style={[
                  styles.button,
                  currentStatus === "visited" && styles.buttonVisitedPressed,
                ]}
              >
                <Text style={{ color: currentStatus === "visited" ? "white" : "black" }}>
                  Visited
                </Text>
                <Ionicons
                  name={currentStatus === "visited" ? "location" : "location-outline"}
                  color={currentStatus === "visited" ? "white" : "black"}
                  size={25}
                />
              </Pressable>
              <Pressable
                onPress={() =>
                  updateCountryStatus(
                    currentStatus === "want"
                      ? null
                      : "want"
                  )
                }
                style={[
                  styles.button,
                  currentStatus === "want" && styles.buttonWantPressed,
                ]}
              >
                <Text style={{ color: currentStatus === "want" ? "white" : "black" }}>
                  Want
                </Text>
                <Ionicons
                  name={currentStatus === "want" ? "heart" : "heart-outline"}
                  color={currentStatus === "want" ? "white" : "black"}
                  size={25}
                />
              </Pressable>
              <Pressable
                onPress={() =>
                  updateCountryStatus(
                    currentStatus === "lived"
                      ? null
                      : "lived"
                  )
                }
                style={[
                  styles.button,
                  currentStatus === "lived" && styles.buttonLivedPressed,
                ]}
              >
                <Text style={{ color: currentStatus === "lived" ? "white" : "black" }}>
                  Lived
                </Text>
                <Ionicons
                  name={currentStatus === "lived" ? "home" : "home-outline"}
                  color={currentStatus === "lived" ? "white" : "black"}
                  size={25}
                />
              </Pressable>
            </View>
          </BottomSheetView>
        </BottomSheet>
    </GestureHandlerRootView>
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
  // infoBar: {
  //   position: "absolute",
  //   bottom: 100,
  //   left: 0,
  //   right: 0,
  //   backgroundColor: "rgba(15, 23, 42, 0.68)",
  //   borderTopLeftRadius: 16,
  //   borderTopRightRadius: 16,
  //   // paddingHorizontal: 14,
  //   // paddingVertical: 12,
  //   height: 200,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // infoText: {
  //   color: "#f8fafc",
  //   fontSize: 12,
  //   fontWeight: "600",
  //   letterSpacing: 0.2,
  // },
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 50,
    padding: 10,
  },
  buttonVisitedPressed: {
    backgroundColor: "#a202ff8c",
  },
  buttonWantPressed: {
    backgroundColor: "#19cac18c",
  },
  buttonLivedPressed: {
    backgroundColor: "#f7a325f6",
  },
});

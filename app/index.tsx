
import worldData from "@/assets/data/ne_110m_admin_0_countries.json";
import { geoArea, geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import { useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

const typedWorldData = worldData as {
  type: string;
  features: Array<{
    type: string;
    properties?: { ADMIN?: string; NAME?: string };
    geometry: any;
  }>;
};

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 540;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

const projection = geoNaturalEarth1().fitSize([MAP_WIDTH, MAP_HEIGHT], typedWorldData as any);
const pathGenerator = geoPath(projection);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function App() {
  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const lastScale = useRef(1);
  const lastOffsetX = useRef(0);
  const lastOffsetY = useRef(0);

  const countryPaths = useMemo(
    () =>
      typedWorldData.features
        .map((feature) => {
          const d = pathGenerator(feature as any);
          if (!d) return null;

          const countryName = feature.properties?.NAME ?? feature.properties?.ADMIN ?? "Country";

          return (
            <Path
              key={countryName}
              d={d}
              fill="transparent"
              stroke="#44546A"
              strokeWidth={0.7}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })
        .filter(Boolean),
    []
  );

  const countryLabels = useMemo(
    () =>
      typedWorldData.features
        .map((feature) => {
          const name = feature.properties?.NAME ?? feature.properties?.ADMIN;
          if (!name) return null;

          const area = geoArea(feature as any);
          if (area < 4_500_000_000) return null;

          const centroid = geoCentroid(feature as any);
          const [x, y] = projection(centroid) ?? [0, 0];

          if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

          return (
            <SvgText
              key={name}
              x={x}
              y={y}
              fill="#364356"
              fontSize={8}
              fontWeight="500"
              textAnchor="middle"
              opacity={0.8}
            >
              {name}
            </SvgText>
          );
        })
        .filter(Boolean),
    []
  );

  const animatedMapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
    transformOrigin: "center center",
  }));

  const handlePinch = (event: any) => {
    const nextScale = clamp(lastScale.current * event.nativeEvent.scale, MIN_SCALE, MAX_SCALE);
    scale.value = nextScale;
  };

  const handlePinchState = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      lastScale.current = scale.value;
    }
  };

  const handlePan = (event: any) => {
    const nextX = clamp(lastOffsetX.current + event.nativeEvent.translationX / scale.value, -220, 220);
    const nextY = clamp(lastOffsetY.current + event.nativeEvent.translationY / scale.value, -160, 160);
    offsetX.value = nextX;
    offsetY.value = nextY;
  };

  const handlePanState = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      lastOffsetX.current = offsetX.value;
      lastOffsetY.current = offsetY.value;
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <PanGestureHandler onGestureEvent={handlePan} onHandlerStateChange={handlePanState}>
        <Animated.View style={styles.panArea}>
          <PinchGestureHandler onGestureEvent={handlePinch} onHandlerStateChange={handlePinchState}>
            <Animated.View style={[styles.mapWrapper, animatedMapStyle]}>
              <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <Path d={"M 0 0 H 1000 V 540 H 0 Z"} fill="#F8F7F3" stroke="transparent" />
                <G>{countryPaths}</G>
                <G>{countryLabels}</G>
              </Svg>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F7F3",
  },
  panArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

import "@/global.css";
import { Map } from "@maplibre/maplibre-react-native";
import { View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 bg-white">
      <Map
        style={{ flex: 1 }}
        mapStyle="https://demotiles.maplibre.org/style.json"
      />
    </View>
  );
}






// import { Text, View } from "react-native";

// export default function Index() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text>Edit app/index.tsx to edit this screen.</Text>
//     </View>
//   );
// }

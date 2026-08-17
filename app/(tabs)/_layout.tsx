import { Tabs } from "expo-router";
import { tabs } from "@/constants/data";

const TabLayout = () => (
    <Tabs screenOptions={{ headerShown: false }}>
        {/* <Tabs.Screen name="friends" options={{ title: 'Friends' }} />
        <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
        <Tabs.Screen name="index" options={{ title: 'Map' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} /> */}
        {tabs.map((tab) => (
            
        ))}
    </Tabs>
)

export default TabLayout
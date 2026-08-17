import { Tabs } from "expo-router";
import { tabs } from "@/constants/data";
import { View, Image } from "react-native";
import { colors, components } from "@/constants/theme";
import clsx from "clsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabBar = components.tabBar;

const TabLayout = () =>  {
    const insets = useSafeAreaInsets(); // hvor mye inset et hardware device tar (fra bunnen tror jeg)
    const TabIcon = ({ focused, icon }: TabIconProps) => {
        return (
            <View className="tabs-icon">
                <View className={clsx('tabs-pill', focused && 'tabs-active')}>
                    <Image source={icon} resizeMode="contain" className="tabs-glyph" style={{ width: tabBar.iconFrame, height: tabBar.iconFrame}}/>
                </View>
            </View>
        )
    }

    return <Tabs 
                screenOptions={{ 
                    headerShown: false, 
                    tabBarShowLabel: false, 
                    tabBarStyle: {
                        position: 'absolute', 
                        bottom: Math.max(insets.bottom, tabBar.horizontalInset), 
                        height: tabBar.height, 
                        backgroundColor: colors.primary, 
                        borderTopWidth: 0, 
                        elevation: 0,
                    },
                    tabBarItemStyle: {
                        paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6
                    },
                    tabBarIconStyle: {
                        width: tabBar.iconFrame,
                        height: tabBar.iconFrame,
                        alignItems: 'center',
                    }
                }}
            >
        {/* <Tabs.Screen name="friends" options={{ title: 'Friends' }} />
        <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
        <Tabs.Screen name="index" options={{ title: 'Map' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} /> */}
        {tabs.map((tab) => (
            <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({focused}) => (
                <TabIcon focused={focused} icon={tab.icon}/>
            )}} />
        ))}
    </Tabs>
}

export default TabLayout
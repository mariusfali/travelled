import { Tabs } from "expo-router";
import "@/global.css";
import React from 'react';
import { View, Text, Dimensions } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';

const { width, height } = Dimensions.get("window")

export default function TabLayout() {
  return <Tabs 
    initialRouteName="index"
    screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
            position: 'absolute',
            bottom: 0, // at den er på bunnen av skjermen
            left: 16,
            right: 16,
            height: 100, // hvor høy navbaren er
            elevation: 0,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
        }
    }}>
        <Tabs.Screen
            name="friends"
            options={{
                tabBarIcon: ({ focused }) => (
                    <View style={{
                        alignItems: "center",
                        paddingTop: 10,
                        width: width/5
                    }}>
                        <Ionicons 
                        name={focused ? "people" : "people-outline"} 
                        color={focused ? "purple" : "black"} 
                        size={24}
                        />
                        <Text style={{
                            color: focused ? "purple" : "black",
                            fontSize: 12,
                            marginTop: 4,
                        }}>
                            Friends
                        </Text>
                    </View>
                )
            }}
        />
        <Tabs.Screen
            name="trips"
            options={{
                tabBarIcon: ({ focused }) => (
                    <View style={{
                        alignItems: "center",
                        paddingTop: 10,
                        width: width/5
                    }}>
                        <Ionicons 
                        name={focused ? "earth" : "earth-outline"} 
                        color={focused ? "purple" : "black"} 
                        size={24}
                        />
                        <Text style={{
                            color: focused ? "purple" : "black",
                            fontSize: 12,
                            marginTop: 4,
                        }}>
                            Trips
                        </Text>
                    </View>
                )
            }}
        />
        <Tabs.Screen
            name="index"
            options={{
                tabBarIcon: ({ focused }) => (
                    <View style={{
                        alignItems: "center",
                        paddingTop: 10,
                        width: width/5
                    }}>
                        <Ionicons 
                        name={focused ? "map" : "map-outline"} 
                        color={focused ? "purple" : "black"} 
                        size={24}
                        />
                        <Text style={{
                            color: focused ? "purple" : "black",
                            fontSize: 12,
                            marginTop: 4,
                        }}>
                            Map
                        </Text>
                    </View>
                )
            }}
        />
        <Tabs.Screen
            name="profile"
            options={{
                tabBarIcon: ({ focused }) => (
                    <View style={{
                        alignItems: "center",
                        paddingTop: 10,
                        width: width/5
                    }}>
                        <Ionicons 
                        name={focused ? "person-circle" : "person-circle-outline"} 
                        color={focused ? "purple" : "black"} 
                        size={24}
                        />
                        <Text style={{
                            color: focused ? "purple" : "black",
                            fontSize: 12,
                            marginTop: 4,
                        }}>
                            Profile
                        </Text>
                    </View>
                )
            }}
        />
        <Tabs.Screen
            name="settings"
            options={{
                tabBarIcon: ({ focused }) => (
                    <View style={{
                        alignItems: "center",
                        paddingTop: 10,
                        width: width/5
                    }}>
                        <Ionicons 
                        name={focused ? "settings" : "settings-outline"} 
                        color={focused ? "purple" : "black"} 
                        size={24}
                        />
                        <Text style={{
                            color: focused ? "purple" : "black",
                            fontSize: 12,
                            marginTop: 4,
                        }}>
                            Settings
                        </Text>
                    </View>
                )
            }}
        />
    </Tabs>

}

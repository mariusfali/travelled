import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import "@/global.css";
import { initializeDatabase } from "@/database/database";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="travelled.db"
      onInit={initializeDatabase}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </SQLiteProvider>
  ); 
}

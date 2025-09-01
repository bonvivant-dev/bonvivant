import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider } from "../feature/auth/components/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Tabs>
        <Tabs.Screen 
          name="index" 
          options={{
            title: '홈',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }} 
        />
        <Tabs.Screen 
          name="library" 
          options={{
            title: '내서재',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'library' : 'library-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }} 
        />
      </Tabs>
    </AuthProvider>
  );
}

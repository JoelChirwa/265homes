import { FontAwesome } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@/src/context/AuthContext";

export default function AppLayout() {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const isLandlord = user.role === "landlord";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1D4ED8",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0,
          backgroundColor: "#FFFFFF",
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          href: isLandlord ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="search" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="post-listing"
        options={{
          title: "Post Listings",
          href: isLandlord ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="plus-square" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-listings"
        options={{
          title: "My Listings",
          href: null,
          tabBarIcon: ({ color, size }) => <FontAwesome name="list" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <FontAwesome name="user" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

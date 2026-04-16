import { FontAwesome } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/theme/ThemeProvider";

export default function AppLayout() {
  const { user, isBootstrapping } = useAuth();
  const { colors } = useTheme();

  if (isBootstrapping) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  const isLandlord = user.role === "landlord";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 80,
          paddingTop: 12,
          paddingBottom: 24,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <FontAwesome name="home" color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          href: isLandlord ? null : "/(app)/explore",
          tabBarIcon: ({ color }) => <FontAwesome name="search" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="post-listing"
        options={{
          title: "Post",
          href: !isLandlord ? null : "/(app)/post-listing",
          tabBarIcon: ({ color }) => <FontAwesome name="plus-circle" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="my-listings"
        options={{
          title: "Listings",
          href: !isLandlord ? null : "/(app)/my-listings",
          tabBarIcon: ({ color }) => <FontAwesome name="list-ul" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <FontAwesome name="user-circle" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <FontAwesome name="cog" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          href: null,
          title: "Subscription",
        }}
      />
    </Tabs>
  );
}

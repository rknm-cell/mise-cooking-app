import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { HapticTab } from '../../components';
import { Colors } from '../../constants/Colors';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: '#1d7b86',
          borderTopColor: '#2d8d8b',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}>
      
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => <TabBarIcon name="restaurant" color={color} />,
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: 'Generate',
          tabBarIcon: ({ color }) => <TabBarIcon name="sparkles" color={color} />,
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
     
      <Tabs.Screen
        name="recipe-session"
        options={{
          title: 'Cooking',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
    
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Shopping',
          tabBarIcon: ({ color }) => <TabBarIcon name="cart" color={color} />,
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color }) => <TabBarIcon name="bookmark" color={color} />,
          tabBarButton: (props) => <HapticTab {...props} />,
        }}
      />
    </Tabs>
  );
}

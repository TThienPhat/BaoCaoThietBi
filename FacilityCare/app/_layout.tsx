import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import StoreProvider from '../src/store/StoreProvider';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Tabs screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#0F172A',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0', height: 62, paddingTop: 6, paddingBottom: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
      }}>
        <Tabs.Screen name="index" options={{ title: 'FacilityCare', tabBarLabel: 'Trang chủ', tabBarIcon: ({color,size,focused}) => <Ionicons name={focused?'home':'home-outline'} size={size} color={color}/> }} />
        <Tabs.Screen name="search" options={{ title: 'Tìm kiếm', tabBarLabel: 'Tìm kiếm', tabBarIcon: ({color,size,focused}) => <Ionicons name={focused?'search':'search-outline'} size={size} color={color}/> }} />
        <Tabs.Screen name="notifications" options={{ title: 'Thông báo', tabBarLabel: 'Thông báo', tabBarIcon: ({color,size,focused}) => <Ionicons name={focused?'notifications':'notifications-outline'} size={size} color={color}/> }} />
        <Tabs.Screen name="profile" options={{ title: 'Cá nhân', tabBarLabel: 'Cá nhân', tabBarIcon: ({color,size,focused}) => <Ionicons name={focused?'person':'person-outline'} size={size} color={color}/> }} />
        <Tabs.Screen name="report/create" options={{ title: 'Tạo báo cáo', href: null }} />
        <Tabs.Screen name="report/camera" options={{ title: 'Chụp ảnh sự cố', href: null }} />
        <Tabs.Screen name="report/[id]" options={{ title: 'Chi tiết báo cáo', href: null }} />
      </Tabs>
    </StoreProvider>
  );
}

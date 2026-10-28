import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { useAppSelector } from '../src/store/hooks';

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const count = useAppSelector(s => s.reports.items.length);
  return <View style={[styles.screen, darkMode && styles.dark]}>
    <View style={[styles.avatar, darkMode && { backgroundColor: '#334155' }]}><Text style={styles.avatarText}>FC</Text></View>
    <Text style={[styles.name, darkMode && styles.darkText]}>Người dùng FacilityCare</Text>
    <Text style={styles.email}>Tài khoản demo</Text>
    <View style={styles.card}><Text style={styles.stat}>{count}</Text><Text style={styles.label}>Báo cáo đã tải</Text></View>
    <View style={styles.row}><Text style={[styles.label, darkMode && styles.darkText]}>Giao diện tối (demo)</Text><Switch value={darkMode} onValueChange={setDarkMode} /></View>
    <Text style={styles.note}>Chế độ tối hiện chỉ áp dụng cho màn hình Cá nhân.</Text>
    <Text style={styles.about} onPress={() => Alert.alert('FacilityCare', 'Ứng dụng báo cáo sự cố cơ sở vật chất.')}>Giới thiệu ứng dụng</Text>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F1F5F9', alignItems: 'center', padding: 24 },
  dark: { backgroundColor: '#0F172A' }, darkText: { color: '#F8FAFC' },
  avatar: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  avatarText: { color: '#1D4ED8', fontSize: 26, fontWeight: '900' }, name: { color: '#0F172A', fontSize: 20, fontWeight: '900', marginTop: 16 },
  email: { color: '#64748B', marginTop: 6 }, card: { backgroundColor: '#FFFFFF', width: '100%', padding: 20, borderRadius: 14, alignItems: 'center', marginTop: 28 },
  stat: { color: '#2563EB', fontSize: 28, fontWeight: '900' }, label: { color: '#475569', fontWeight: '700' },
  row: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 },
  note: { color: '#64748B', fontSize: 12, marginTop: 10 }, about: { color: '#2563EB', fontWeight: '800', marginTop: 28 }
});

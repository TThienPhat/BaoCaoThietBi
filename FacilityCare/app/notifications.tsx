import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getReports } from '../src/api/reports';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { setReports, setReportsError, setReportsLoading } from '../src/store/reportsSlice';
import ReportCard from '../src/components/ReportCard';

export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(s => s.reports);
  useFocusEffect(useCallback(() => {
    dispatch(setReportsLoading(true));
    getReports().then(data => dispatch(setReports(data))).catch(e => dispatch(setReportsError(e instanceof Error ? e.message : 'Không tải được dữ liệu.')));
  }, [dispatch]));
  const recent = [...items].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
  return <View style={styles.screen}>
    <Text style={styles.heading}>Hoạt động gần đây</Text>
    <Text style={styles.note}>Danh sách báo cáo mới nhất trong ứng dụng; chưa phải thông báo đẩy của hệ điều hành.</Text>
    <FlatList data={recent} keyExtractor={(r,i) => r.id ?? `${r.title}-${i}`} renderItem={({item}) => <ReportCard report={item} onPress={() => router.push({ pathname: '/report/[id]', params: { id: item.id ?? '' } })} />} ListEmptyComponent={<Text style={styles.empty}>Chưa có hoạt động.</Text>} />
  </View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#F1F5F9', padding: 16 }, heading: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 8 }, note: { color: '#64748B', lineHeight: 19, marginBottom: 14, fontSize: 12 }, empty: { textAlign: 'center', marginTop: 30, color: '#64748B' } });

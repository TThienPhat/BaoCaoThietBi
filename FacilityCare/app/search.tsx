import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { getReports } from '../src/api/reports';
import type { ReportStatus } from '../src/api/reports';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { setReports, setReportsError, setReportsLoading } from '../src/store/reportsSlice';
import ReportCard from '../src/components/ReportCard';

const filters: { label: string; value: ReportStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' }, { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đang xử lý', value: 'in_progress' }, { label: 'Hoàn thành', value: 'resolved' }
];

export default function SearchScreen() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(s => s.reports);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ReportStatus | 'all'>('all');
  useFocusEffect(useCallback(() => {
    dispatch(setReportsLoading(true));
    getReports().then(data => dispatch(setReports(data))).catch(e => dispatch(setReportsError(e instanceof Error ? e.message : 'Không tải được dữ liệu.')));
  }, [dispatch]));
  const results = useMemo(() => items.filter(r => {
    const q = query.trim().toLowerCase();
    const matches = !q || [r.title, r.category, r.location, r.description].some(v => v.toLowerCase().includes(q));
    return matches && (filter === 'all' || r.status === filter);
  }), [items, query, filter]);

  return <View style={styles.screen}>
    <Text style={styles.heading}>Tìm kiếm báo cáo</Text>
    <TextInput style={styles.input} value={query} onChangeText={setQuery} placeholder="Nhập tiêu đề, loại hoặc vị trí..." />
    <View style={styles.filters}>{filters.map(f => <Text key={f.value} onPress={() => setFilter(f.value)} style={[styles.filter, filter === f.value && styles.selected]}>{f.label}</Text>)}</View>
    <FlatList data={results} keyExtractor={(r,i) => r.id ?? `${r.title}-${i}`} contentContainerStyle={{ paddingBottom: 24 }} renderItem={({ item }) => <ReportCard report={item} onPress={() => router.push({ pathname: '/report/[id]', params: { id: item.id ?? '' } })} />} ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy báo cáo phù hợp.</Text>} />
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F1F5F9', padding: 16 }, heading: { fontSize: 22, color: '#0F172A', fontWeight: '900', marginBottom: 14 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderWidth: 1, borderRadius: 10, padding: 13, marginBottom: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  filter: { overflow: 'hidden', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#E2E8F0', color: '#475569', fontSize: 12 },
  selected: { backgroundColor: '#DBEAFE', color: '#1D4ED8', fontWeight: '800' }, empty: { textAlign: 'center', color: '#64748B', marginTop: 28 }
});

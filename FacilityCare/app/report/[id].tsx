import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getReportById, updateReportStatus } from '../../src/api/reports';
import type { Report, ReportStatus } from '../../src/api/reports';
import { useAppDispatch } from '../../src/store/hooks';
import { updateReport } from '../../src/store/reportsSlice';

const statuses: { value: ReportStatus; label: string }[] = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'in_progress', label: 'Đang xử lý' },
  { value: 'resolved', label: 'Đã hoàn thành' },
];

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getReportById(id).then(setReport).catch(e => Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không tải được báo cáo.')).finally(() => setLoading(false));
  }, [id]);

  async function changeStatus(status: ReportStatus) {
    if (!report?.id || saving) return;
    setSaving(true);
    try {
      const updated = await updateReportStatus(report.id, status);
      setReport(updated);
      dispatch(updateReport(updated));
    } catch (e) { Alert.alert('Lỗi cập nhật', e instanceof Error ? e.message : 'Không thể cập nhật.'); }
    finally { setSaving(false); }
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Stack.Screen options={{ title: 'Chi tiết báo cáo' }} />
    {loading ? <ActivityIndicator size="large" style={{ marginTop: 40 }} /> : !report ? <Text>Không tìm thấy báo cáo.</Text> : <>
      <Text style={styles.category}>{report.category}</Text>
      <Text style={styles.title}>{report.title}</Text>
      <Text style={styles.meta}>Mã báo cáo: {report.id ?? '—'}</Text>
      <Text style={styles.label}>Mô tả</Text><Text style={styles.body}>{report.description}</Text>
      <Text style={styles.label}>Vị trí</Text><Text style={styles.body}>{report.location}</Text>
      {report.latitude !== null && report.longitude !== null && <Text style={styles.meta}>GPS: {report.latitude}, {report.longitude}</Text>}
      {!!report.image && <Image source={{ uri: report.image }} style={styles.image} />}
      <Text style={styles.label}>Mức độ: {report.severity}</Text>
      <Text style={styles.label}>Ngày tạo</Text><Text style={styles.body}>{new Date(report.createdAt).toLocaleString('vi-VN')}</Text>
      <Text style={styles.label}>Cập nhật trạng thái</Text>
      {statuses.map(s => <TouchableOpacity key={s.value} style={[styles.statusButton, report.status === s.value && styles.selected]} onPress={() => changeStatus(s.value)} disabled={saving}><Text style={styles.statusText}>{report.status === s.value ? '✓ ' : ''}{s.label}</Text></TouchableOpacity>)}
      {saving && <ActivityIndicator style={{ marginTop: 12 }} />}
    </>}
  </ScrollView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F1F5F9' }, content: { padding: 18 },
  category: { color: '#2563EB', fontWeight: '800' }, title: { color: '#0F172A', fontWeight: '900', fontSize: 25, marginTop: 8 },
  meta: { color: '#64748B', fontSize: 12, marginTop: 8 }, label: { color: '#334155', fontWeight: '800', marginTop: 20, marginBottom: 6 },
  body: { color: '#475569', lineHeight: 22 }, image: { width: '100%', height: 220, borderRadius: 12, marginTop: 16 },
  statusButton: { padding: 14, borderRadius: 10, backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderWidth: 1, marginTop: 8 },
  selected: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' }, statusText: { color: '#1E293B', fontWeight: '700' }
});

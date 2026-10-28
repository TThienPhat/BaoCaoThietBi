import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Report } from '../api/reports';

const statusText = { pending: 'Chờ xử lý', in_progress: 'Đang xử lý', resolved: 'Đã hoàn thành' };
const severityText = { low: 'Thấp', medium: 'Trung bình', high: 'Cao' };

export default function ReportCard({ report, onPress }: { report: Report; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <Text style={styles.category}>{report.category}</Text>
        <Text style={styles.status}>{statusText[report.status]}</Text>
      </View>
      <Text style={styles.title}>{report.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{report.description}</Text>
      <Text style={styles.meta}>📍 {report.location}</Text>
      <View style={styles.row}>
        <Text style={styles.meta}>Mức độ: {severityText[report.severity]}</Text>
        <Text style={styles.meta}>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  category: { color: '#2563EB', fontWeight: '800', fontSize: 12 },
  status: { color: '#047857', fontSize: 12, fontWeight: '700' },
  title: { fontSize: 16, color: '#0F172A', fontWeight: '800' },
  description: { fontSize: 13, color: '#475569', lineHeight: 19 },
  meta: { fontSize: 12, color: '#64748B' }
});

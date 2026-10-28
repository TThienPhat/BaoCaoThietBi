
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import {
  getReports,
  Report,
} from '../src/api/reports';

import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { setReports } from '../src/store/reportsSlice';

const COLORS = {
  primary: '#2563EB',
  background: '#F3F6FB',
  white: '#FFFFFF',
  text: '#172033',
  secondary: '#64748B',
  border: '#E2E8F0',
  green: '#15803D',
  orange: '#C2410C',
  red: '#DC2626',
};

function getStatusLabel(status: Report['status']) {
  switch (status) {
    case 'pending':
      return 'Chờ xử lý';
    case 'in_progress':
      return 'Đang xử lý';
    case 'resolved':
      return 'Đã hoàn thành';
    default:
      return status;
  }
}

function getStatusColor(status: Report['status']) {
  switch (status) {
    case 'pending':
      return '#FEF3C7';
    case 'in_progress':
      return '#DBEAFE';
    case 'resolved':
      return '#DCFCE7';
    default:
      return '#F1F5F9';
  }
}

function getSeverityLabel(severity: Report['severity']) {
  switch (severity) {
    case 'low':
      return 'Thấp';
    case 'medium':
      return 'Trung bình';
    case 'high':
      return 'Cao';
    default:
      return severity;
  }
}

function getSeverityColor(severity: Report['severity']) {
  switch (severity) {
    case 'low':
      return COLORS.green;
    case 'medium':
      return COLORS.orange;
    case 'high':
      return COLORS.red;
    default:
      return COLORS.secondary;
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HomeScreen() {
  const dispatch = useAppDispatch();

  const reports = useAppSelector(
    (state) => state.reports.items,
  ) as Report[];

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Tải dữ liệu mỗi khi người dùng quay lại trang chủ
  const loadReports = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    setErrorMessage('');

    try {
      const data = await getReports();

      // Dữ liệu lấy trực tiếp từ MockAPI
      dispatch(setReports(data));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không thể tải danh sách báo cáo.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports(false);
  };

  const pendingCount = reports.filter(
    (item) => item.status === 'pending',
  ).length;

  const inProgressCount = reports.filter(
    (item) => item.status === 'in_progress',
  ).length;

  const resolvedCount = reports.filter(
    (item) => item.status === 'resolved',
  ).length;

  const renderReport = ({ item }: { item: Report }) => (
    <Pressable
      style={styles.reportCard}
      onPress={() => {
        if (item.id) {
          router.push({
            pathname: '/report/[id]',
            params: { id: item.id },
          });
        }
      }}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleContainer}>
          <Text style={styles.reportTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.reportCategory}>
            {item.category}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.reportDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.reportInfoRow}>
        <Text style={styles.infoText} numberOfLines={2}>
          📍 {item.location}
        </Text>
      </View>

      <View style={styles.reportFooter}>
        <Text
          style={[
            styles.severityText,
            { color: getSeverityColor(item.severity) },
          ]}
        >
          ● Mức độ: {getSeverityLabel(item.severity)}
        </Text>

        <Text style={styles.dateText}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Phần đầu trang */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>FacilityCare</Text>
            <Text style={styles.welcomeText}>
              Xin chào! Quản lý sự cố cơ sở vật chất.
            </Text>
          </View>

          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>FC</Text>
          </View>
        </View>

        {/* Nút tạo báo cáo */}
        <Pressable
          style={styles.createButton}
          onPress={() => router.push('/report/create')}
        >
          <View style={styles.createIcon}>
            <Text style={styles.plusText}>+</Text>
          </View>

          <View style={styles.createTextContainer}>
            <Text style={styles.createTitle}>
              Tạo báo cáo sự cố
            </Text>
            <Text style={styles.createSubtitle}>
              Gửi sự cố mới để được hỗ trợ
            </Text>
          </View>

          <Text style={styles.arrowText}>›</Text>
        </Pressable>

        {/* Thống kê */}
        <Text style={styles.sectionTitle}>
          Tổng quan báo cáo
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {reports.length}
            </Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.orange }]}>
              {pendingCount}
            </Text>
            <Text style={styles.statLabel}>Chờ xử lý</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>
              {inProgressCount}
            </Text>
            <Text style={styles.statLabel}>Đang xử lý</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.green }]}>
              {resolvedCount}
            </Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>

        {/* Danh sách báo cáo */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Báo cáo gần đây
          </Text>

          <Pressable onPress={() => loadReports()}>
            <Text style={styles.refreshText}>Làm mới</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
            <Text style={styles.helperText}>
              Đang tải báo cáo...
            </Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              Không thể tải báo cáo
            </Text>

            <Text style={styles.errorMessage}>
              {errorMessage}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => loadReports()}
            >
              <Text style={styles.retryText}>
                Thử lại
              </Text>
            </Pressable>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>
              Chưa có báo cáo nào
            </Text>
            <Text style={styles.emptyDescription}>
              Hãy tạo báo cáo đầu tiên để theo dõi sự cố.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push('/report/create')}
            >
              <Text style={styles.emptyButtonText}>
                + Tạo báo cáo
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={[...reports].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )}
            renderItem={renderReport}
            keyExtractor={(item, index) =>
              item.id ?? `${item.createdAt}-${index}`
            }
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View style={styles.separator} />
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  welcomeText: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 6,
    maxWidth: 270,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 18,
    marginBottom: 26,
  },
  createIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: COLORS.white,
    fontSize: 30,
    lineHeight: 34,
  },
  createTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  createTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  createSubtitle: {
    color: '#DBEAFE',
    fontSize: 12,
    marginTop: 5,
  },
  arrowText: {
    color: COLORS.white,
    fontSize: 30,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
  },
  centerBox: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  helperText: {
    color: COLORS.secondary,
    marginTop: 12,
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 18,
    borderRadius: 14,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.red,
  },
  errorMessage: {
    color: '#991B1B',
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.red,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
    marginTop: 14,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 38,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyDescription: {
    textAlign: 'center',
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  reportTitleContainer: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
  },
  reportCategory: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 5,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
  },
  reportDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginTop: 12,
  },
  reportInfoRow: {
    marginTop: 12,
  },
  infoText: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginTop: 14,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.secondary,
  },
  separator: {
    height: 12,
  },
});


import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';

import {
  createReport,
  type Severity,
} from '../../src/api/reports';
import { useAppDispatch } from '../../src/store/hooks';
import { addReport } from '../../src/store/reportsSlice';
import { getCurrentLocation } from '../../src/services/location';

const CATEGORIES = [
  'Điện',
  'Nước',
  'Điều hòa',
  'Nội thất',
  'Vệ sinh',
  'Khác',
];

const SEVERITIES: {
  label: string;
  value: Severity;
  description: string;
  color: string;
}[] = [
  {
    label: 'Thấp',
    value: 'low',
    description: 'Sự cố chưa ảnh hưởng nhiều',
    color: '#16A34A',
  },
  {
    label: 'Trung bình',
    value: 'medium',
    description: 'Cần được xử lý sớm',
    color: '#EA580C',
  },
  {
    label: 'Cao',
    value: 'high',
    description: 'Cần được xử lý khẩn cấp',
    color: '#DC2626',
  },
];

export default function CreateReportScreen() {
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Điện');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');

  const [photoUri, setPhotoUri] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [takingPhoto, setTakingPhoto] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  // Chọn ảnh từ thư viện
  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Cần cấp quyền',
          'Vui lòng cho phép ứng dụng truy cập thư viện ảnh.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error
          ? error.message
          : 'Không thể mở thư viện ảnh.',
      );
    }
  };

  // Xin quyền và mở camera
  const handleTakePhoto = async () => {
    try {
      if (!cameraPermission?.granted) {
        const permission = await requestCameraPermission();

        if (!permission.granted) {
          Alert.alert(
            'Cần cấp quyền camera',
            'Vui lòng cho phép ứng dụng sử dụng camera.',
          );
          return;
        }
      }

      setCameraVisible(true);
    } catch {
      Alert.alert('Lỗi', 'Không thể truy cập camera.');
    }
  };

  // Chụp ảnh trực tiếp
  const capturePhoto = async () => {
    if (!cameraRef.current || takingPhoto) {
      return;
    }

    try {
      setTakingPhoto(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setCameraVisible(false);
      }
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error
          ? error.message
          : 'Không thể chụp ảnh. Vui lòng thử lại.',
      );
    } finally {
      setTakingPhoto(false);
    }
  };

  // Lấy vị trí GPS
  const handleGetLocation = async () => {
    try {
      setLoadingLocation(true);

      const result = await getCurrentLocation();

      if (!result) {
        Alert.alert(
          'Không lấy được vị trí',
          'Vui lòng kiểm tra quyền vị trí và GPS trên thiết bị.',
        );
        return;
      }

      setLatitude(result.latitude);
      setLongitude(result.longitude);

      if (result.address) {
        setLocation(result.address);
      } else {
        setLocation(
          `${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`,
        );
      }
    } catch (error) {
      Alert.alert(
        'Lỗi vị trí',
        error instanceof Error
          ? error.message
          : 'Không thể lấy vị trí hiện tại.',
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  // Gửi báo cáo lên MockAPI
  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề sự cố.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng mô tả chi tiết sự cố.');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập vị trí sự cố.');
      return;
    }

    if (cameraVisible) {
      Alert.alert(
        'Camera đang mở',
        'Vui lòng chụp ảnh hoặc đóng camera trước khi gửi.',
      );
      return;
    }

    try {
      setSubmitting(true);

      const savedReport = await createReport({
        title: title.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        severity,
        status: 'pending',
        createdAt: new Date().toISOString(),
        reporter: 'Người dùng',
        image: photoUri,
        latitude,
        longitude,
      });

      // Chỉ cập nhật Redux sau khi máy chủ trả về thành công
      dispatch(addReport(savedReport));

      // Quay về trang chủ để tải và hiển thị danh sách mới
      router.replace('/');
    } catch (error) {
      Alert.alert(
        'Không thể gửi báo cáo',
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi. Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tiêu đề */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹ Quay lại</Text>
          </Pressable>

          <Text style={styles.heading}>Tạo báo cáo sự cố</Text>
          <Text style={styles.subtitle}>
            Cung cấp thông tin để bộ phận kỹ thuật xử lý.
          </Text>
        </View>

        <View style={styles.card}>
          {/* Tiêu đề sự cố */}
          <Text style={styles.label}>Tiêu đề sự cố *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Đèn hành lang không sáng"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            accessibilityLabel="Tiêu đề sự cố"
          />

          {/* Loại sự cố */}
          <Text style={styles.label}>Loại sự cố *</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.chip,
                  category === item && styles.chipSelected,
                ]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === item && styles.chipTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Mô tả */}
          <Text style={styles.label}>Mô tả chi tiết *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả tình trạng sự cố..."
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />

          {/* Mức độ nghiêm trọng */}
          <Text style={styles.label}>Mức độ nghiêm trọng *</Text>
          {SEVERITIES.map((item) => (
            <Pressable
              key={item.value}
              style={[
                styles.severityOption,
                severity === item.value && styles.severitySelected,
              ]}
              onPress={() => setSeverity(item.value)}
            >
              <View style={styles.severityContent}>
                <Text
                  style={[
                    styles.severityTitle,
                    { color: item.color },
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={styles.severityDescription}>
                  {item.description}
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  severity === item.value && styles.radioSelected,
                ]}
              >
                {severity === item.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </Pressable>
          ))}

          {/* Vị trí */}
          <Text style={styles.label}>Vị trí sự cố *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Tầng 2, phòng 203"
            value={location}
            onChangeText={(value) => {
              setLocation(value);
              setLatitude(null);
              setLongitude(null);
            }}
          />

          <Pressable
            style={styles.secondaryButton}
            onPress={handleGetLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator color="#2563EB" />
            ) : (
              <Text style={styles.secondaryButtonText}>
                ◎ Lấy vị trí GPS hiện tại
              </Text>
            )}
          </Pressable>

          {latitude !== null && longitude !== null && (
            <Text style={styles.coordinateText}>
              Tọa độ: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          )}

          {/* Ảnh minh họa */}
          <Text style={styles.label}>Ảnh minh họa</Text>

          <View style={styles.photoActions}>
            <Pressable
              style={styles.photoButton}
              onPress={handlePickImage}
              disabled={submitting}
            >
              <Text style={styles.photoButtonIcon}>▧</Text>
              <Text style={styles.photoButtonText}>
                Chọn từ thư viện
              </Text>
            </Pressable>

            <Pressable
              style={styles.photoButton}
              onPress={handleTakePhoto}
              disabled={submitting}
            >
              <Text style={styles.photoButtonIcon}>◎</Text>
              <Text style={styles.photoButtonText}>Chụp ảnh</Text>
            </Pressable>
          </View>

          {/* Khung camera */}
          {cameraVisible && (
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.cameraPreview}
                facing="back"
              />

              <View style={styles.cameraActions}>
                <Pressable
                  style={styles.cameraCancelButton}
                  onPress={() => setCameraVisible(false)}
                  disabled={takingPhoto}
                >
                  <Text style={styles.cameraCancelText}>Hủy</Text>
                </Pressable>

                <Pressable
                  style={styles.captureButton}
                  onPress={capturePhoto}
                  disabled={takingPhoto}
                >
                  {takingPhoto ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.captureText}>Chụp ảnh</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Xem trước ảnh */}
          {photoUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: photoUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />

              <Pressable
                onPress={() => setPhotoUri('')}
                style={styles.removeImageButton}
              >
                <Text style={styles.removeImageText}>Xóa ảnh</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.hint}>
              Bạn có thể chọn ảnh có sẵn hoặc chụp ảnh sự cố.
            </Text>
          )}

          {/* Nút gửi */}
          <Pressable
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <View style={styles.submitContent}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.submitText}>
                  Đang gửi báo cáo...
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Gửi báo cáo</Text>
            )}
          </Pressable>

          <Text style={styles.requiredHint}>
            * Các trường bắt buộc
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 12,
  },
  backText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#172033',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 21,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EAF2',
  },
  label: {
    color: '#263449',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 9,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D9E1EC',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: '#172033',
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 120,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#D9E1EC',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#E8F0FF',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 14,
    color: '#475569',
  },
  chipTextSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  severityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D9E1EC',
    borderRadius: 12,
    padding: 13,
    marginBottom: 9,
  },
  severitySelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F5FF',
  },
  severityContent: {
    flex: 1,
    paddingRight: 12,
  },
  severityTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  severityDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
  coordinateText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    flex: 1,
    minHeight: 82,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonIcon: {
    fontSize: 25,
    color: '#2563EB',
    marginBottom: 5,
  },
  photoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
    textAlign: 'center',
  },
  cameraContainer: {
    marginTop: 16,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#0F172A',
  },
  cameraPreview: {
    width: '100%',
    height: 350,
  },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
  },
  cameraCancelButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  cameraCancelText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  captureButton: {
    minWidth: 110,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  captureText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  imageContainer: {
    marginTop: 12,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  removeImageButton: {
    alignSelf: 'flex-end',
    paddingVertical: 9,
  },
  removeImageText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  hint: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },
  submitButton: {
    minHeight: 52,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    paddingHorizontal: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  requiredHint: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 14,
  },
});

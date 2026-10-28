import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function takePhoto() {
    if (!ready || !cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) setPhotoUri(photo.uri);
    } catch { Alert.alert('Lỗi', 'Không thể chụp ảnh.'); }
  }
  function usePhoto() {
    if (photoUri) router.dismissTo({ pathname: '/report/create', params: { photoUri } });
  }

  if (!permission) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!permission.granted) return <View style={styles.center}><Text style={styles.text}>Cần quyền camera để chụp ảnh sự cố.</Text><TouchableOpacity style={styles.button} onPress={requestPermission}><Text style={styles.buttonText}>Cấp quyền camera</Text></TouchableOpacity><TouchableOpacity onPress={() => router.back()}><Text style={styles.text}>Quay lại</Text></TouchableOpacity></View>;

  return <View style={styles.container}>
    {photoUri ? <Image source={{ uri: photoUri }} style={styles.camera} resizeMode="contain" /> : <CameraView ref={cameraRef} style={styles.camera} facing="back" onCameraReady={() => setReady(true)} />}
    <View style={styles.controls}>
      {photoUri ? <>
        <TouchableOpacity style={styles.button} onPress={() => setPhotoUri(null)}><Text style={styles.buttonText}>Chụp lại</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={usePhoto}><Text style={styles.buttonText}>Dùng ảnh này</Text></TouchableOpacity>
      </> : <TouchableOpacity style={styles.capture} onPress={takePhoto}><Text style={styles.captureText}>CHỤP ẢNH</Text></TouchableOpacity>}
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.text}>Hủy và quay lại</Text></TouchableOpacity>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' }, camera: { flex: 1, width: '100%' },
  controls: { alignItems: 'center', padding: 20, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 18 },
  button: { backgroundColor: '#2563EB', padding: 14, borderRadius: 10, minWidth: 160, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '800' }, capture: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 32 },
  captureText: { color: '#0F172A', fontWeight: '900' }, text: { color: '#FFFFFF', textAlign: 'center' }
});

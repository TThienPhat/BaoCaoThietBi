
import * as Location from 'expo-location';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export async function getCurrentLocation(): Promise<GPSLocation> {
  // Xin quyền truy cập vị trí
  const permission =
    await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    throw new Error(
      'Bạn cần cấp quyền vị trí cho ứng dụng FacilityCare.',
    );
  }

  // Lấy tọa độ GPS hiện tại
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  // Mặc định hiển thị tọa độ
  let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  // Thử chuyển tọa độ thành địa chỉ
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results.length > 0) {
      const place = results[0];

      const addressParts = [
        place.name,
        place.street,
        place.district,
        place.city,
      ].filter(Boolean);

      if (addressParts.length > 0) {
        address = addressParts.join(', ');
      }
    }
  } catch {
    // Nếu không chuyển được địa chỉ,
    // ứng dụng vẫn sử dụng tọa độ GPS.
  }

  return {
    latitude,
    longitude,
    address,
  };
}

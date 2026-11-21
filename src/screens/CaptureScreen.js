import { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ScreenHeader from '../components/ScreenHeader';
import Brackets from '../components/Brackets';
import Button from '../components/Button';
import colors from '../theme/colors';

export default function CaptureScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [previewUri, setPreviewUri] = useState(null);
  const [previewExif, setPreviewExif] = useState(null);
  const [previewAssetId, setPreviewAssetId] = useState(null);

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        'Coral Vision needs access to your photo gallery to select a coral image.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
      exif: true,
    });
    if (!result.canceled && result.assets?.length) {
      setPreviewUri(result.assets[0].uri);
      setPreviewExif(result.assets[0].exif || null);
      // Lets us look up the photo's real location from the Photos library
      // itself later: iOS strips GPS out of the raw file the picker returns.
      setPreviewAssetId(result.assets[0].assetId || null);
    }
  };

  const captureWithCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Coral Vision needs camera access to capture a coral image.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.9,
      allowsEditing: false,
      exif: true,
    });
    if (!result.canceled && result.assets?.length) {
      setPreviewUri(result.assets[0].uri);
      setPreviewExif(result.assets[0].exif || null);
      setPreviewAssetId(result.assets[0].assetId || null);
    }
  };

  const proceedToIdentify = () => {
    if (!previewUri) return;
    navigation.navigate('Result', {
      imageUri: previewUri,
      exif: previewExif,
      assetId: previewAssetId,
    });
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Capture"
        subtitle="Take or choose a coral photo"
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.body, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.viewfinder}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No image selected</Text>
              <Text style={styles.emptyText}>Take a photo or choose one from your gallery.</Text>
            </View>
          )}
          <Brackets color={previewUri ? colors.white : 'rgba(255,255,255,0.35)'} />
        </View>

        <View style={styles.row}>
          <Button style={styles.flex} variant="navy" label="Take Photo" onPress={captureWithCamera} />
          <Button style={styles.flex} variant="outline" label="Gallery" onPress={pickFromGallery} />
        </View>
        <Button label="Identify Coral" disabled={!previewUri} onPress={proceedToIdentify} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  body: { flex: 1, padding: 16, gap: 12 },
  viewfinder: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.navy800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { color: colors.white, fontSize: 17, fontWeight: '600' },
  emptyText: { color: colors.skyMuted, fontSize: 14, marginTop: 6, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});

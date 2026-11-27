import { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import Brackets from '../components/Brackets';
import Button from '../components/Button';
import IconButton from '../components/IconButton';
import Icon from '../components/Icon';
import { color, radius } from '../theme/tokens';
import { type, font } from '../theme/type';

export default function CaptureScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [previewUri, setPreviewUri] = useState(null);
  const [previewExif, setPreviewExif] = useState(null);
  const [previewAssetId, setPreviewAssetId] = useState(null);

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Coral Vision needs access to your photos to select a coral image.');
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
      // Lets us look up the photo's real location in the Photos library later:
      // iOS strips GPS out of the raw file the picker returns.
      setPreviewAssetId(result.assets[0].assetId || null);
    }
  };

  const captureWithCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Coral Vision needs camera access to capture a coral image.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9, allowsEditing: false, exif: true });
    if (!result.canceled && result.assets?.length) {
      setPreviewUri(result.assets[0].uri);
      setPreviewExif(result.assets[0].exif || null);
      setPreviewAssetId(result.assets[0].assetId || null);
    }
  };

  const proceedToIdentify = () => {
    if (!previewUri) return;
    navigation.navigate('Result', { imageUri: previewUri, exif: previewExif, assetId: previewAssetId });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <IconButton name="back" variant="glass" label="Go back" onPress={() => navigation.goBack()} />
        <Text style={styles.title}>New identification</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.viewfinder}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={styles.empty}>
            <Icon name="scan" size={34} color={color.onAbyss3} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Frame a single colony</Text>
            <Text style={styles.emptyBody}>Fill the frame and keep it in focus. Underwater or surface photos both work.</Text>
          </View>
        )}
        <Brackets color={previewUri ? 'rgba(255,255,255,0.9)' : color.onAbyss3} size={26} inset={18} />
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.row}>
          <Button style={styles.flex} variant="glass" icon="image" label="Library" onPress={pickFromGallery} />
          <Button style={styles.flex} variant="glass" icon="camera" label="Camera" onPress={captureWithCamera} />
        </View>
        <Button
          variant={previewUri ? 'accent' : 'glass'}
          icon="arrow"
          label="Identify coral"
          disabled={!previewUri}
          onPress={proceedToIdentify}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.abyss },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontFamily: font.sansSemi, fontSize: 16, color: color.onAbyss, letterSpacing: -0.2 },
  viewfinder: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: color.abyss2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingHorizontal: 48 },
  emptyTitle: { fontFamily: font.serif, fontSize: 26, color: color.onAbyss, marginTop: 16, letterSpacing: -0.2 },
  emptyBody: { ...type.small, color: color.onAbyss2, textAlign: 'center', marginTop: 6 },
  controls: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
});

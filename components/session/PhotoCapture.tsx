import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera as CameraIcon, RotateCcw, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, Text, View } from 'react-native';

import { APP_CONFIG } from '@/constants/config';
import { createLogger } from '@/lib/logger';

const log = createLogger('PhotoCapture');

interface PhotoCaptureProps {
  uri: string | null;
  onChange: (uri: string | null) => void;
}

export function PhotoCapture({ uri, onChange }: PhotoCaptureProps) {
  const [open, setOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function ensurePermission(): Promise<boolean> {
    if (permission?.granted) return true;
    const result = await requestPermission();
    return result.granted;
  }

  async function openCamera() {
    const ok = await ensurePermission();
    if (!ok) return;
    setOpen(true);
  }

  async function shoot() {
    const camera = cameraRef.current;
    if (!camera || busy) return;
    setBusy(true);
    try {
      const photo = await camera.takePictureAsync({
        quality: APP_CONFIG.photoQuality,
        skipProcessing: false,
      });
      if (!photo?.uri) {
        log.warn('takePictureAsync returned no uri');
        return;
      }
      const compressed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: APP_CONFIG.photoMaxWidth } }],
        {
          compress: APP_CONFIG.photoQuality,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );
      onChange(compressed.uri);
      setOpen(false);
    } catch (err) {
      log.error('Photo capture failed', err);
    } finally {
      setBusy(false);
    }
  }

  if (uri) {
    return (
      <View>
        <Image source={{ uri }} className="w-full h-56 rounded-2xl" resizeMode="cover" />
        <View className="flex-row gap-2 mt-2">
          <Pressable
            onPress={openCamera}
            className="flex-1 bg-brand-50 dark:bg-brand-800 active:opacity-80 rounded-xl py-2 items-center">
            <Text className="text-brand-700 dark:text-brand-100 font-medium">Retake</Text>
          </Pressable>
          <Pressable
            onPress={() => onChange(null)}
            className="flex-1 bg-danger/10 active:opacity-80 rounded-xl py-2 items-center">
            <Text className="text-danger font-medium">Remove</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <>
      <Pressable
        onPress={openCamera}
        className="border-2 border-dashed border-brand-200 dark:border-brand-700 rounded-2xl py-10 items-center justify-center bg-brand-50/50 dark:bg-brand-900">
        <CameraIcon color="#0E7C66" size={32} />
        <Text className="text-base text-brand-600 dark:text-brand-200 mt-2 font-medium">Add a photo</Text>
        <Text className="text-xs text-ink-muted mt-1">Optional — capture pillar number, row, etc.</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 bg-black">
          <View className="flex-row justify-between items-center p-4 pt-12 absolute top-0 left-0 right-0 z-10">
            <Pressable onPress={() => setOpen(false)} className="bg-black/40 rounded-full p-2">
              <X color="#FFFFFF" size={24} />
            </Pressable>
            <Pressable
              onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
              className="bg-black/40 rounded-full p-2">
              <RotateCcw color="#FFFFFF" size={24} />
            </Pressable>
          </View>
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />
          <View className="absolute bottom-0 left-0 right-0 pb-12 items-center">
            <Pressable
              onPress={shoot}
              disabled={busy}
              className="w-20 h-20 rounded-full bg-white items-center justify-center">
              {busy ? (
                <ActivityIndicator color="#0E7C66" />
              ) : (
                <View className="w-16 h-16 rounded-full bg-white border-4 border-brand-500" />
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

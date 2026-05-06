import { Image } from 'expo-image';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const COLS = 2;
const GAP = 12;
const PAD = 18;
const windowWidth = Dimensions.get('window').width;

const PHOTOS = [
  { id: '1', uri: 'https://picsum.photos/seed/g1/500/620' },
  { id: '2', uri: 'https://picsum.photos/seed/g2/500/500' },
  { id: '3', uri: 'https://picsum.photos/seed/g3/500/580' },
  { id: '4', uri: 'https://picsum.photos/seed/g4/500/500' },
  { id: '5', uri: 'https://picsum.photos/seed/g5/500/640' },
  { id: '6', uri: 'https://picsum.photos/seed/g6/500/520' },
];

function cellWidth(): number {
  return (windowWidth - PAD * 2 - GAP) / COLS;
}

/**
 * Галерея — сетка с разной высотой ячеек и мягкими тенями.
 */
export default function ExploreScreen() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const insets = useSafeAreaInsets();
  const w = cellWidth();
  const heights = [w * 1.12, w * 0.95, w * 1.05, w * 0.92, w * 1.15, w];

  const pageBg = scheme === 'dark' ? '#0c0f12' : '#eef2f6';
  const thumbBg = scheme === 'dark' ? '#1a1f23' : '#dde3ea';
  const cardBg = scheme === 'dark' ? '#1a1f23' : '#ffffff';
  const accentLine = scheme === 'dark' ? '#3b82a6' : palette.tint;

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      <FlatList
        data={PHOTOS}
        keyExtractor={(item) => item.id}
        numColumns={COLS}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
            <View style={[styles.headerAccent, { backgroundColor: accentLine }]} />
            <Text style={[styles.title, { color: palette.text }]}>Галерея</Text>
            <Text style={[styles.subtitle, { color: palette.icon }]}>
              Подборка снимков — потяни экран и открой в полный рост через список
            </Text>
          </View>
        }
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.thumbWrap,
              {
                width: w,
                backgroundColor: cardBg,
                borderColor: scheme === 'dark' ? '#2a3238' : '#e8edf2',
              },
            ]}>
            <Image
              source={{ uri: item.uri }}
              style={[styles.thumb, { height: heights[index % heights.length], backgroundColor: thumbBg }]}
              contentFit="cover"
              transition={220}
              cachePolicy="memory-disk"
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  list: {
    paddingHorizontal: PAD,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 18,
    paddingBottom: 4,
  },
  headerAccent: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
    opacity: 0.9,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  thumbWrap: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  thumb: {
    width: '100%',
  },
});

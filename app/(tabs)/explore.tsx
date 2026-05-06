import { Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';

/**
 * ДЗ: галерея — список картинок из интернета (FlatList, 2 колонки).
 */
const COLS = 2;
const GAP = 8;
const PAD = 16;
const windowWidth = Dimensions.get('window').width;
const cellSize = (windowWidth - PAD * 2 - GAP) / COLS;

const PHOTOS = [
  { id: '1', uri: 'https://picsum.photos/seed/g1/400/400' },
  { id: '2', uri: 'https://picsum.photos/seed/g2/400/400' },
  { id: '3', uri: 'https://picsum.photos/seed/g3/400/400' },
  { id: '4', uri: 'https://picsum.photos/seed/g4/400/400' },
  { id: '5', uri: 'https://picsum.photos/seed/g5/400/400' },
  { id: '6', uri: 'https://picsum.photos/seed/g6/400/400' },
];

export default function ExploreScreen() {
  return (
    <View style={styles.page}>
      <FlatList
        data={PHOTOS}
        keyExtractor={(item) => item.id}
        numColumns={COLS}
        ListHeaderComponent={
          <Text style={styles.title}>Галерея</Text>
        }
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.thumb} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  list: {
    paddingHorizontal: PAD,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  thumb: {
    width: cellSize,
    height: cellSize,
    backgroundColor: '#eeeeee',
  },
});

import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Задание: профиль пользователя (простой экран на ScrollView + View + Text + Image).
 */
export default function HomeScreen() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Профиль</Text>

      <View style={styles.block}>
        <Image
          source={{ uri: 'https://picsum.photos/seed/nik-frost/200/200' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Nik Frost</Text>
        <Text style={styles.subtitle}>Начинающий разработчик</Text>
        <Text style={styles.about}>
          Здесь коротко о себе: чем занимаюсь и что изучаю в React Native.
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>nik@example.com</Text>
        <Text style={[styles.label, styles.gapTop]}>Телефон</Text>
        <Text style={styles.value}>+7 777 000-00-00</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  inner: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  block: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#eeeeee',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  about: {
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    color: '#666666',
  },
  value: {
    fontSize: 15,
    marginTop: 2,
  },
  gapTop: {
    marginTop: 10,
  },
});

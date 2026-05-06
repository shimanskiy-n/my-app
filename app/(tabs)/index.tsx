import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const insets = useSafeAreaInsets();
  const c = themed(scheme);
  const heroBg = scheme === 'dark' ? '#1e4d6e' : palette.tint;

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: c.pageBg }]}
      contentContainerStyle={[styles.inner, { paddingBottom: 32 }]}>
      <View
        style={[
          styles.hero,
          {
            paddingTop: Math.max(insets.top, 14) + 8,
            backgroundColor: heroBg,
          },
        ]}>
        <Text style={styles.heroTitle}>Профиль</Text>
      </View>

      <View style={[styles.profileCard, styles.profileCardOverlap, c.card]}>
        <View style={[styles.avatarRing, { borderColor: palette.tint }]}>
          <Image
            source={{ uri: 'https://picsum.photos/seed/nik-frost/200/200' }}
            style={styles.avatar}
          />
        </View>
        <Text style={[styles.name, { color: palette.text }]}>Nik Frost</Text>
        <View style={[styles.badge, { backgroundColor: scheme === 'dark' ? '#1e3a4a' : '#e0f2f8' }]}>
          <Text style={[styles.badgeText, { color: palette.tint }]}>Разработчик</Text>
        </View>
        <Text style={[styles.about, { color: scheme === 'dark' ? '#b8c0c6' : '#4b5563' }]}>
          Здесь коротко о себе: чем занимаюсь и что изучаю в React Native.
        </Text>
      </View>

      <Text style={[styles.sectionLabel, { color: palette.icon }]}>Контакты</Text>
      <View style={[styles.contactCard, c.card]}>
        <View style={[styles.contactRow, c.rowBorder]}>
          <View style={[styles.contactIconBg, { backgroundColor: scheme === 'dark' ? '#1e2930' : '#eef6f9' }]}>
            <MaterialCommunityIcons name="email-outline" size={22} color={palette.tint} />
          </View>
          <View style={styles.contactTexts}>
            <Text style={[styles.contactLabel, { color: palette.icon }]}>Email</Text>
            <Text style={[styles.contactValue, { color: palette.text }]}>nik@example.com</Text>
          </View>
        </View>
        <View style={[styles.contactRow, styles.contactRowLast, c.rowBorder]}>
          <View style={[styles.contactIconBg, { backgroundColor: scheme === 'dark' ? '#1e2930' : '#eef6f9' }]}>
            <MaterialCommunityIcons name="phone-outline" size={22} color={palette.tint} />
          </View>
          <View style={styles.contactTexts}>
            <Text style={[styles.contactLabel, { color: palette.icon }]}>Телефон</Text>
            <Text style={[styles.contactValue, { color: palette.text }]}>+7 777 000-00-00</Text>
          </View>
        </View>
      </View>

      {/* <Text style={[styles.sectionLabel, { color: palette.icon }]}>Разделы</Text>
      <Link href="./todo" asChild>
        <Pressable style={({ pressed }) => [styles.linkCard, c.card, pressed && { opacity: 0.92 }]}>
          <View style={[styles.contactIconBg, { backgroundColor: scheme === 'dark' ? '#1e2930' : '#eef6f9' }]}>
            <MaterialCommunityIcons name="format-list-checks" size={22} color={palette.tint} />
          </View>
          <View style={styles.contactTexts}>
            <Text style={[styles.contactLabel, { color: palette.icon }]}>Задачи</Text>
            <Text style={[styles.contactValue, { color: palette.text }]}>
              Todo — список дел и отметка выполнения
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={palette.icon} />
        </Pressable>
      </Link> */}
    </ScrollView>
  );
}

function themed(scheme: 'light' | 'dark') {
  if (scheme === 'dark') {
    return {
      pageBg: '#0c0f12',
      card: {
        backgroundColor: '#1a1f23',
        borderColor: '#2a3238',
      } as const,
      rowBorder: { borderBottomColor: '#2a3238' } as const,
    };
  }
  return {
    pageBg: '#eef2f6',
    card: {
      backgroundColor: '#ffffff',
      borderColor: '#e8edf2',
    } as const,
    rowBorder: { borderBottomColor: '#eef1f4' } as const,
  };
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 0,
    position: 'relative',
    overflow: 'visible',
  },
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: '#ffffff',
  },
  profileCard: {
    marginHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
  },
  profileCardOverlap: {
    marginTop: -22,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 64,
    borderWidth: 3,
    marginBottom: 14,
  },
  avatar: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: '#bcc4cc',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  about: {
    fontSize: 15,
    marginTop: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 20,
    marginTop: 4,
  },
  contactCard: {
    marginHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactRowLast: {
    borderBottomWidth: 0,
  },
  contactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTexts: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkCard: {
    marginHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
});

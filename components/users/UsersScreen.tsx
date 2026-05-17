import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useUsersStore } from '@/app/store/usersStore';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function UsersScreen() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const users = useUsersStore((s) => s.users);
  const loading = useUsersStore((s) => s.loading);
  const error = useUsersStore((s) => s.error);
  const fetchUsers = useUsersStore((s) => s.fetchUsers);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const pageBg = scheme === 'dark' ? '#0c0f12' : '#eef2f6';
  const heroBg = scheme === 'dark' ? '#1e4d6e' : palette.tint;
  const muted = scheme === 'dark' ? '#b8c0c6' : '#64748b';
  const cardBg = scheme === 'dark' ? '#1a1f23' : '#ffffff';
  const cardBorder = scheme === 'dark' ? '#2a3238' : '#e8edf2';

  return (
    <View style={[styles.screen, { backgroundColor: pageBg, paddingTop: Math.max(insets.top, 12) }]}>
      <View style={[styles.hero, { backgroundColor: heroBg }]}>
        <Text style={styles.heroTitle}>Пользователи</Text>
        <Text style={styles.heroSubtitle}>{users.length} записей</Text>
      </View>

      {error ? (
        <View style={[styles.banner, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.bannerText, { color: palette.text }]}>{error}</Text>
          <Pressable onPress={() => void fetchUsers()} style={[styles.retry, { backgroundColor: palette.tint }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {loading && users.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={palette.tint} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.listCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {users.map((u, index) => (
              <Pressable
                key={u.id}
                onPress={() => router.push(`/user/${u.id}`)}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: cardBorder },
                  { opacity: pressed ? 0.85 : 1 },
                ]}>
                <View style={styles.rowText}>
                  <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>
                    {u.name}
                  </Text>
                  <Text style={[styles.meta, { color: muted }]} numberOfLines={1}>
                    @{u.username} · {u.email}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={muted} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  banner: {
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retry: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 160,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 18,
  },
  listCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
  },
});

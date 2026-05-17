import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUsersStore } from '@/app/store/usersStore';
import { Colors } from '@/constants/theme';
import { fetchUserById, type UserRecord } from '@/services/usersApi';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function UserDetailScreen() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const userId = Number(idParam);

  const mergeUser = useUsersStore((s) => s.mergeUser);
  const patchUserName = useUsersStore((s) => s.patchUserName);
  const userFromStore = useUsersStore((s) => s.users.find((u) => u.id === userId));

  const [user, setUser] = useState<UserRecord | null>(userFromStore ?? null);
  const [loading, setLoading] = useState(!userFromStore);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState(userFromStore?.name ?? '');
  const [patchBusy, setPatchBusy] = useState(false);
  const [patchMsg, setPatchMsg] = useState<string | null>(null);
  const [patchErr, setPatchErr] = useState<string | null>(null);

  useEffect(() => {
    if (userFromStore) {
      setUser(userFromStore);
      setNameDraft(userFromStore.name);
    }
  }, [userFromStore]);

  useEffect(() => {
    if (!Number.isFinite(userId) || userId < 1) {
      setLoadErr('Некорректный id');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoadErr(null);
    setLoading(true);
    void fetchUserById(userId)
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setNameDraft(u.name);
        mergeUser(u);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setLoadErr(e instanceof Error ? e.message : 'Ошибка загрузки');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, mergeUser]);

  const displayUser = userFromStore ?? user;

  const onSaveName = useCallback(async () => {
    setPatchErr(null);
    setPatchMsg(null);
    setPatchBusy(true);
    try {
      await patchUserName(userId, nameDraft);
      setPatchMsg('PATCH отправлен (данные на сервере не меняются)');
      Keyboard.dismiss();
    } catch (e: unknown) {
      const reverted = useUsersStore.getState().users.find((u) => u.id === userId)?.name ?? '';
      setNameDraft(reverted);
      setPatchErr(e instanceof Error ? e.message : 'Ошибка PATCH');
    } finally {
      setPatchBusy(false);
    }
  }, [patchUserName, userId, nameDraft]);

  const pageBg = scheme === 'dark' ? '#0c0f12' : '#eef2f6';
  const cardBg = scheme === 'dark' ? '#1a1f23' : '#ffffff';
  const cardBorder = scheme === 'dark' ? '#2a3238' : '#e8edf2';
  const muted = scheme === 'dark' ? '#b8c0c6' : '#64748b';
  const rowBorder = scheme === 'dark' ? '#2a3238' : '#eef1f4';

  const iconBg =
    scheme === 'dark'
      ? { bg: '#1e2930' as const, soft: '#243038' as const }
      : { bg: '#eef6f9' as const, soft: '#dff0f8' as const };

  const editCardStyle = useMemo(
    () =>
      ({
        backgroundColor: cardBg,
        borderColor: cardBorder,
      }) as const,
    [cardBg, cardBorder],
  );

  const stackTitle = useMemo(() => displayUser?.name ?? 'Пользователь', [displayUser?.name]);

  if (!Number.isFinite(userId) || userId < 1) {
    return (
      <>
        <Stack.Screen options={{ title: 'Ошибка' }} />
        <View style={[styles.centered, { backgroundColor: pageBg }]}>
          <Text style={{ color: palette.text }}>Некорректный id</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: stackTitle }} />
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: pageBg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {loading && !displayUser ? (
          <View style={[styles.centered, { flex: 1 }]}>
            <ActivityIndicator size="large" color={palette.tint} />
          </View>
        ) : loadErr && !displayUser ? (
          <View style={[styles.centered, { flex: 1, paddingHorizontal: 24 }]}>
            <Text style={[styles.errText, { color: palette.text }]}>{loadErr}</Text>
          </View>
        ) : displayUser ? (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 24),
              gap: 14,
            }}
            keyboardShouldPersistTaps="handled">
            <View style={[styles.editWrap, styles.editLift, editCardStyle]}>
              <Text style={[styles.editHeading, { color: palette.text }]}>Имя</Text>
              <TextInput
                value={nameDraft}
                onChangeText={setNameDraft}
                placeholder="Как отображать пользователя"
                placeholderTextColor={muted}
                style={[
                  styles.editInput,
                  {
                    color: palette.text,
                    borderColor: rowBorder,
                    backgroundColor: scheme === 'dark' ? '#12161a' : '#f8fafc',
                  },
                ]}
                returnKeyType="done"
                onSubmitEditing={() => void onSaveName()}
              />
              <Pressable
                disabled={patchBusy || nameDraft.trim() === displayUser.name}
                onPress={() => void onSaveName()}
                style={({ pressed }) => [
                  styles.saveRow,
                  {
                    borderColor: palette.tint,
                    backgroundColor: iconBg.soft,
                    opacity:
                      patchBusy || nameDraft.trim() === displayUser.name ? 0.55 : pressed ? 0.92 : 1,
                  },
                ]}>
                <View style={[styles.saveIconBadge, { backgroundColor: iconBg.bg }]}>
                  {patchBusy ? (
                    <ActivityIndicator size="small" color={palette.tint} />
                  ) : (
                    <MaterialCommunityIcons name="cloud-upload-outline" size={22} color={palette.tint} />
                  )}
                </View>
                <Text style={[styles.saveLabel, { color: palette.tint }]}>Сохранить</Text>
              </Pressable>
              {patchMsg ? <Text style={[styles.okHint, { color: muted }]}>{patchMsg}</Text> : null}
              {patchErr ? <Text style={[styles.errHint, { color: '#c62828' }]}>{patchErr}</Text> : null}
            </View>

            <Section title="Контакты" muted={muted}>
              <Row label="Email" value={displayUser.email} palette={palette} muted={muted} />
              <Row label="Телефон" value={displayUser.phone} palette={palette} muted={muted} />
              <Row label="Сайт" value={displayUser.website} palette={palette} muted={muted} />
            </Section>

            <Section title="Адрес" muted={muted}>
              <Row
                label="Улица"
                value={`${displayUser.address.street}, ${displayUser.address.suite}`}
                palette={palette}
                muted={muted}
              />
              <Row label="Город" value={displayUser.address.city} palette={palette} muted={muted} />
              <Row label="Индекс" value={displayUser.address.zipcode} palette={palette} muted={muted} />
              <Row
                label="Координаты"
                value={`${displayUser.address.geo.lat}, ${displayUser.address.geo.lng}`}
                palette={palette}
                muted={muted}
              />
            </Section>

            <Section title="Компания" muted={muted}>
              <Row label="Название" value={displayUser.company.name} palette={palette} muted={muted} />
              <Row label="Слоган" value={displayUser.company.catchPhrase} palette={palette} muted={muted} />
              <Row label="BS" value={displayUser.company.bs} palette={palette} muted={muted} />
            </Section>
          </ScrollView>
        ) : null}
      </KeyboardAvoidingView>
    </>
  );
}

function Section({
  title,
  children,
  muted,
}: {
  title: string;
  children: React.ReactNode;
  muted: string;
}) {
  return (
    <View>
      <Text style={[styles.sectionTitle, { color: muted }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  label,
  value,
  palette,
  muted,
}: {
  label: string;
  value: string;
  palette: (typeof Colors)['light'] | (typeof Colors)['dark'];
  muted: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: muted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errText: {
    fontSize: 15,
    textAlign: 'center',
  },
  editWrap: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  editLift: {
    marginBottom: 14,
  },
  editHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    marginBottom: 14,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  saveIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  okHint: {
    fontSize: 13,
    marginTop: 4,
  },
  errHint: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionBody: {
    gap: 12,
  },
  row: {
    gap: 4,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 16,
    lineHeight: 22,
  },
});

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
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

import { Colors } from '@/constants/theme';
import { deleteTodo, getTodoById, isRemoteTodoId, updateTodo } from '@/api/todosApi';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loadFavoritesTodo, toggleTodoFavorite } from '@/storage/todoFavorites';

import type { TodoTask } from './types';

function taskFromSearchParams(params: {
  id?: string;
  title?: string;
  done?: string;
}): TodoTask | null {
  const id = typeof params.id === 'string' ? params.id.trim() : '';
  if (!id) return null;
  const rawTitle = typeof params.title === 'string' ? params.title.trim() : '';
  const title = rawTitle
    ? (() => {
        try {
          return decodeURIComponent(rawTitle);
        } catch {
          return rawTitle;
        }
      })()
    : '';
  const done = params.done === '1';
  if (!title && !isRemoteTodoId(id)) return null;
  return { id, title: title || '…', done };
}

export function TodoDetailScreen() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; title?: string; done?: string }>();

  const idParam = typeof params.id === 'string' ? params.id.trim() : '';
  const titleParam = typeof params.title === 'string' ? params.title : '';
  const doneParam = typeof params.done === 'string' ? params.done : '';

  const hinted = useMemo(
    () => taskFromSearchParams({ id: idParam, title: titleParam, done: doneParam }),
    [idParam, titleParam, doneParam],
  );

  const taskId = idParam;

  const [task, setTask] = useState<TodoTask | null>(() => hinted);
  const [loading, setLoading] = useState(() => !!(idParam && isRemoteTodoId(idParam)));
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState(() => hinted?.title ?? '');
  const [favorite, setFavorite] = useState(false);
  const [favHydrated, setFavHydrated] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    void loadFavoritesTodo().then((ids) => {
      setFavorite(taskId ? ids.includes(taskId) : false);
      setFavHydrated(true);
    });
  }, [taskId]);

  useEffect(() => {
    if (!taskId || !isRemoteTodoId(taskId)) {
      if (!hinted) {
        setLoadErr(!taskId ? 'Некорректный id' : 'Нужны параметры задачи или id из API');
        setLoading(false);
        setTask(null);
      } else {
        setTask(hinted);
        setTitleDraft(hinted.title);
        setLoadErr(null);
        setLoading(false);
      }
      return;
    }
    let cancelled = false;
    setLoadErr(null);
    setLoading(true);
    void getTodoById(taskId)
      .then((t) => {
        if (cancelled) return;
        setTask(t);
        setTitleDraft(t.title);
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
  }, [taskId, hinted]);

  const displayTask = task ?? hinted;

  const onSaveTitle = useCallback(async () => {
    if (!displayTask || !isRemoteTodoId(displayTask.id)) return;
    setSaveErr(null);
    setSaveMsg(null);
    const nextTitle = titleDraft.trim();
    if (!nextTitle || nextTitle === displayTask.title) return;
    setSaveBusy(true);
    try {
      await updateTodo(displayTask.id, { title: nextTitle });
      setTask({ ...displayTask, title: nextTitle });
      setSaveMsg('Сохранено (JSONPlaceholder может не вернуть обновление)');
      Keyboard.dismiss();
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaveBusy(false);
    }
  }, [displayTask, titleDraft]);

  const onToggleDone = useCallback(async () => {
    if (!displayTask || !isRemoteTodoId(displayTask.id)) return;
    const next = !displayTask.done;
    setActionBusy(true);
    setLoadErr(null);
    try {
      await updateTodo(displayTask.id, { done: next });
      setTask({ ...displayTask, done: next });
    } catch (e: unknown) {
      setLoadErr(e instanceof Error ? e.message : 'Не удалось обновить статус');
    } finally {
      setActionBusy(false);
    }
  }, [displayTask]);

  const onDelete = useCallback(async () => {
    if (!displayTask || !isRemoteTodoId(displayTask.id)) return;
    setActionBusy(true);
    setLoadErr(null);
    try {
      await deleteTodo(displayTask.id);
      router.back();
    } catch (e: unknown) {
      setLoadErr(e instanceof Error ? e.message : 'Не удалось удалить');
    } finally {
      setActionBusy(false);
    }
  }, [displayTask]);

  const onToggleFavorite = useCallback(async () => {
    if (!taskId || !favHydrated) return;
    try {
      const next = await toggleTodoFavorite(taskId);
      setFavorite(next.includes(taskId));
    } catch {
      /* ignore */
    }
  }, [taskId, favHydrated]);

  const pageBg = scheme === 'dark' ? '#0c0f12' : '#eef2f6';
  const cardBg = scheme === 'dark' ? '#1a1f23' : '#ffffff';
  const cardBorder = scheme === 'dark' ? '#2a3238' : '#e8edf2';
  const muted = scheme === 'dark' ? '#b8c0c6' : '#64748b';
  const rowBorder = scheme === 'dark' ? '#2a3238' : '#eef1f4';
  const iconBg =
    scheme === 'dark'
      ? { bg: '#1e2930' as const, soft: '#243038' as const }
      : { bg: '#eef6f9' as const, soft: '#dff0f8' as const };

  const stackTitle = useMemo(() => {
    const t = displayTask?.title ?? 'Задача';
    return t.length > 28 ? `${t.slice(0, 28)}…` : t;
  }, [displayTask?.title]);

  if (!taskId) {
    return (
      <>
        <Stack.Screen options={{ title: 'Ошибка' }} />
        <View style={[styles.centered, { backgroundColor: pageBg }]}>
          <Text style={{ color: palette.text }}>Некорректный id</Text>
        </View>
      </>
    );
  }

  const remoteUnavailable = displayTask ? !isRemoteTodoId(displayTask.id) : false;

  return (
    <>
      <Stack.Screen options={{ title: stackTitle, headerBackTitle: 'Назад' }} />
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: pageBg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {loading && !displayTask ? (
          <View style={[styles.centered, { flex: 1 }]}>
            <ActivityIndicator size="large" color={palette.tint} />
          </View>
        ) : loadErr && !displayTask ? (
          <View style={[styles.centered, { flex: 1, paddingHorizontal: 24 }]}>
            <Text style={[styles.errText, { color: palette.text }]}>{loadErr}</Text>
          </View>
        ) : displayTask ? (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 24),
              gap: 14,
            }}
            keyboardShouldPersistTaps="handled">
            <View
              style={[
                styles.editWrap,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                },
              ]}>
              <Text style={[styles.editHeading, { color: palette.text }]}>Заголовок</Text>
              <TextInput
                value={titleDraft}
                onChangeText={setTitleDraft}
                placeholder="Текст задачи"
                placeholderTextColor={muted}
                editable={!remoteUnavailable}
                style={[
                  styles.editInput,
                  {
                    color: palette.text,
                    borderColor: rowBorder,
                    backgroundColor: scheme === 'dark' ? '#12161a' : '#f8fafc',
                    opacity: remoteUnavailable ? 0.6 : 1,
                  },
                ]}
                returnKeyType="done"
                onSubmitEditing={() => void onSaveTitle()}
              />
              {saveMsg ? <Text style={[styles.okHint, { color: muted }]}>{saveMsg}</Text> : null}
              {saveErr ? <Text style={[styles.errHint, { color: '#c62828' }]}>{saveErr}</Text> : null}
              {remoteUnavailable ? (
                <Text style={[styles.okHint, { color: muted }]}>
                  Локальные задачи редактируются только в общем списке.
                </Text>
              ) : null}
            </View>

            <Text style={[styles.sectionTitle, { color: muted }]}>Статус</Text>
            <View style={[styles.statusCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <MaterialCommunityIcons
                name={displayTask.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                size={28}
                color={displayTask.done ? palette.tint : palette.icon}
              />
              <Text style={[styles.statusText, { color: palette.text }]}>
                {displayTask.done ? 'Выполнено' : 'Не выполнено'}
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: muted }]}>Избранное</Text>
            <View style={[styles.statusCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <MaterialCommunityIcons
                name={favorite ? 'star' : 'star-outline'}
                size={28}
                color={favorite ? '#f59e0b' : palette.icon}
              />
              <Text style={[styles.statusText, { color: palette.text }]}>
                {!favHydrated ? 'Загрузка…' : favorite ? 'В избранном' : 'Не в избранном'}
              </Text>
            </View>

            {loadErr && displayTask ? (
              <Text style={[styles.errHint, { color: '#c62828' }]}>{loadErr}</Text>
            ) : null}

            <View style={styles.actionsBlock}>
              {!remoteUnavailable ? (
                <Pressable
                  disabled={saveBusy || titleDraft.trim() === displayTask.title}
                  onPress={() => void onSaveTitle()}
                  style={({ pressed }) => [
                    styles.saveRow,
                    {
                      borderColor: palette.tint,
                      backgroundColor: iconBg.soft,
                      opacity:
                        saveBusy || titleDraft.trim() === displayTask.title ? 0.55 : pressed ? 0.92 : 1,
                    },
                  ]}>
                  <View style={[styles.saveIconBadge, { backgroundColor: iconBg.bg }]}>
                    {saveBusy ? (
                      <ActivityIndicator size="small" color={palette.tint} />
                    ) : (
                      <MaterialCommunityIcons name="cloud-upload-outline" size={22} color={palette.tint} />
                    )}
                  </View>
                  <Text style={[styles.saveLabel, { color: palette.tint }]}>Сохранить заголовок</Text>
                </Pressable>
              ) : null}

              {!remoteUnavailable ? (
                <Pressable
                  disabled={actionBusy}
                  onPress={() => void onToggleDone()}
                  style={({ pressed }) => [
                    styles.actionRow,
                    {
                      borderColor: palette.tint,
                      opacity: actionBusy ? 0.55 : pressed ? 0.9 : 1,
                    },
                  ]}>
                  {actionBusy ? (
                    <ActivityIndicator size="small" color={palette.tint} />
                  ) : (
                    <MaterialCommunityIcons name="playlist-check" size={22} color={palette.tint} />
                  )}
                  <Text style={[styles.actionLabel, { color: palette.tint }]}>
                    {displayTask.done ? 'Вернуть в работу' : 'Отметить выполненной'}
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                disabled={!favHydrated}
                onPress={() => void onToggleFavorite()}
                style={({ pressed }) => [
                  styles.actionRow,
                  {
                    borderColor: palette.tint,
                    opacity: !favHydrated ? 0.55 : pressed ? 0.9 : 1,
                  },
                ]}>
                <MaterialCommunityIcons
                  name={favorite ? 'star' : 'star-outline'}
                  size={22}
                  color={favorite ? '#f59e0b' : palette.tint}
                />
                <Text style={[styles.actionLabel, { color: palette.tint }]}>
                  {favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                </Text>
              </Pressable>

              {!remoteUnavailable ? (
                <>
                  <Pressable
                    disabled={actionBusy}
                    onPress={() => void onDelete()}
                    style={({ pressed }) => [
                      styles.actionRow,
                      {
                        borderColor: '#c62828',
                        opacity: actionBusy ? 0.55 : pressed ? 0.9 : 1,
                      },
                    ]}>
                    <MaterialCommunityIcons name="delete-outline" size={22} color="#c62828" />
                    <Text style={[styles.actionLabel, { color: '#c62828' }]}>Удалить</Text>
                  </Pressable>

                  <Text style={[styles.hint, { color: muted }]}>
                    Запросы к JSONPlaceholder выполняются, но список на сервере не меняется навсегда.
                  </Text>
                </>
              ) : null}
            </View>
          </ScrollView>
        ) : null}
      </KeyboardAvoidingView>
    </>
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
  editHeading: {
    fontSize: 16,
    fontWeight: '700',
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
    marginBottom: 4,
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
    marginBottom: -6,
    marginLeft: 4,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
  },
  actionsBlock: {
    gap: 14,
    marginTop: 4,
  },
});

import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loadFavoritesTodo, saveFavoriteTodoIds } from '@/storage/todoFavorites';
import {
  deleteTodo,
  getTodos,
  isRemoteTodoId,
  postTodoDemo,
  updateTodo,
} from '@/api/todosApi';

import { TodoInput } from './TodoInput';
import { TodoList } from './TodoList';
import type { TodoTask } from './types';

export type { TodoTask } from './types';

export function Todo() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [favoriteIds, setFavorites] = useState<string[]>([]);
  const [favoritesHydrated, setFavoritesHydrated] = useState(false);
  const editInputRef = useRef<TextInput | null>(null);
  const tasksRef = useRef<TodoTask[]>([]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    void loadFavoritesTodo().then((ids) => {
      setFavorites(ids);
      setFavoritesHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!favoritesHydrated) return;
    void saveFavoriteTodoIds(favoriteIds);
  }, [favoriteIds, favoritesHydrated]);

  useEffect(() => {
    if (editingId) {
      const t = setTimeout(() => editInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [editingId]);

  const reloadTodos = useCallback(async () => {
    const silent = tasksRef.current.length > 0;
    setLoadError(null);
    if (!silent) setLoading(true);
    try {
      const list = await getTodos();
      setTasks(list);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reloadTodos();
    }, [reloadTodos]),
  );

  const openTodoDetail = useCallback(
    (t: TodoTask) => {
      if (!isRemoteTodoId(t.id)) return;
      router.push({
        pathname: '/todo/[id]',
        params: {
          id: t.id,
          title: encodeURIComponent(t.title),
          done: t.done ? '1' : '0',
        },
      });
    },
    [router],
  );

  const pageBg = scheme === 'dark' ? '#0c0f12' : '#eef2f6';
  const heroBg = scheme === 'dark' ? '#1e4d6e' : palette.tint;
  const muted = scheme === 'dark' ? '#b8c0c6' : '#64748b';

  const cardStyle = useMemo(
    () =>
      scheme === 'dark'
        ? { backgroundColor: '#1a1f23' as const, borderColor: '#2a3238' as const }
        : { backgroundColor: '#ffffff' as const, borderColor: '#e8edf2' as const },
    [scheme],
  );

  const rowBorder = scheme === 'dark' ? '#2a3238' : '#eef1f4';

  const handleAddTodo = useCallback((text: string) => {
    const title = text.trim();
    if (!title) return;
    const id = String(Date.now());
    setTasks((prev) => [...prev, { id, title, done: false }]);
    postTodoDemo(title);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      const t = prev.find((x) => x.id === id);
      if (t && isRemoteTodoId(id)) {
        const done = !t.done;
        updateTodo(id, { done }).catch(() => {
          void reloadTodos();
        });
      }
      return next;
    });
  }, [reloadTodos]);

  const removeTask = useCallback(
    (id: string, activeEditId: string | null) => {
      setFavorites((prev) => prev.filter((f) => f !== id));
      let shouldDeleteRemote = false;
      setTasks((prev) => {
        shouldDeleteRemote = prev.some((t) => t.id === id && isRemoteTodoId(id));
        return prev.filter((t) => t.id !== id);
      });
      if (activeEditId === id) {
        setEditingId(null);
        setEditDraft('');
      }
      if (shouldDeleteRemote) {
        deleteTodo(id).catch(() => {
          void reloadTodos();
        });
      }
    },
    [reloadTodos],
  );

  const commitEdit = useCallback(
    (id: string | null, text: string) => {
      if (!id) return;
      const trimmed = text.trim();
      const nextTitle = trimmed || undefined;
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: trimmed || t.title } : t)),
      );
      if (nextTitle && isRemoteTodoId(id)) {
        updateTodo(id, { title: nextTitle }).catch(() => {
          void reloadTodos();
        });
      }
    },
    [reloadTodos],
  );

  const finishEditing = useCallback(() => {
    if (!editingId) return;
    commitEdit(editingId, editDraft);
    setEditingId(null);
    setEditDraft('');
  }, [editingId, editDraft, commitEdit]);

  const beginEdit = useCallback(
    (task: TodoTask) => {
      if (editingId && editingId !== task.id) {
        commitEdit(editingId, editDraft);
      }
      setEditingId(task.id);
      setEditDraft(task.title);
    },
    [editingId, editDraft, commitEdit],
  );

  const pending = tasks.filter((t) => !t.done).length;

  const handleRemoveTask = useCallback(
    (taskId: string) => removeTask(taskId, editingId),
    [removeTask, editingId],
  );

  return (
    <KeyboardAvoidingView
      style={[styles.wrapper, { backgroundColor: pageBg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.column}>
        <View
          style={[
            styles.hero,
            {
              paddingTop: Math.max(insets.top, 14) + 8,
              backgroundColor: heroBg,
            },
          ]}>
          <View style={[styles.heroAccent, { backgroundColor: 'rgba(255,255,255,0.35)' }]} />
          <Text style={styles.heroTitle}>Todo</Text>
          <Text style={styles.heroSubtitle}>
            {pending} без завершения
            {favoritesHydrated ? ` · ★ ${favoriteIds.length}` : ''}
          </Text>
        </View>

        {loadError ? (
          <View style={[styles.banner, styles.centerBlock, cardStyle]}>
            <Text style={[styles.bannerText, { color: palette.text }]}>{loadError}</Text>
            <Pressable
              onPress={() => void reloadTodos()}
              style={[styles.retryBtn, { backgroundColor: palette.tint }]}>
              <Text style={styles.retryLabel}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {loading && tasks.length === 0 && !loadError ? (
          <View style={[styles.centerBlock]}>
            <ActivityIndicator size="large" color={palette.tint} accessibilityLabel="Loading todos" />
          </View>
        ) : (
          <>
            <TodoInput
              onAdd={handleAddTodo}
              scheme={scheme}
              palette={palette}
              muted={muted}
              rowBorder={rowBorder}
              cardStyle={cardStyle}
            />

            <Text style={[styles.sectionLabel, { color: palette.icon }]}>
              Список ({tasks.length})
            </Text>

            <TodoList
              tasks={tasks}
              favoriteIds={favoriteIds}
              muted={muted}
              editingId={editingId}
              editDraft={editDraft}
              cardStyle={cardStyle}
              rowBorder={rowBorder}
              scheme={scheme}
              palette={palette}
              editInputRef={editInputRef}
              onToggle={toggleTask}
              onToggleFavorite={toggleFavorite}
              onBeginEdit={beginEdit}
              onEditDraftChange={setEditDraft}
              onFinishEdit={finishEditing}
              onRemove={handleRemoveTask}
              onOpenDetail={openTodoDetail}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  column: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  heroAccent: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 20,
  },
  centerBlock: {
    flex: 1,
    marginHorizontal: 18,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  bannerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  retryLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

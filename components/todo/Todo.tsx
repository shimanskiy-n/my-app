import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { TodoInput } from './TodoInput';
import { TodoList } from './TodoList';
import type { TodoTask } from './types';

export type { TodoTask } from './types';

export function Todo() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const insets = useSafeAreaInsets();

  const [tasks, setTasks] = useState<TodoTask[]>([
    { id: '1', title: 'Выпить кофе', done: false },
    { id: '2', title: 'Пойти спать', done: false },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const editInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (editingId) {
      const t = setTimeout(() => editInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [editingId]);

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
    setTasks((prev) => [...prev, { id: String(Date.now()), title, done: false }]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const removeTask = useCallback((id: string, activeEditId: string | null) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeEditId === id) {
      setEditingId(null);
      setEditDraft('');
    }
  }, []);

  const commitEdit = useCallback((id: string | null, text: string) => {
    if (!id) return;
    const trimmed = text.trim();
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title: trimmed || t.title } : t)));
  }, []);

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
          <Text style={styles.heroSubtitle}>{pending} без завершения</Text>
        </View>

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
          muted={muted}
          editingId={editingId}
          editDraft={editDraft}
          cardStyle={cardStyle}
          rowBorder={rowBorder}
          scheme={scheme}
          palette={palette}
          editInputRef={editInputRef}
          onToggle={toggleTask}
          onBeginEdit={beginEdit}
          onEditDraftChange={setEditDraft}
          onFinishEdit={finishEditing}
          onRemove={handleRemoveTask}
        />
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
});

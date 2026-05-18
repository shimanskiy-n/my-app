import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { isRemoteTodoId } from '@/api/todosApi';

import { TodoItem } from './TodoItem';
import type { TodoTask } from './types';

type Props = {
  tasks: TodoTask[];
  favoriteIds: string[];
  muted: string;
  editingId: string | null;
  editDraft: string;
  cardStyle: { backgroundColor: string; borderColor: string };
  rowBorder: string;
  scheme: 'light' | 'dark';
  palette: (typeof Colors)['light'] | (typeof Colors)['dark'];
  editInputRef: React.RefObject<TextInput | null>;
  onToggle: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onBeginEdit: (task: TodoTask) => void;
  onEditDraftChange: (v: string) => void;
  onFinishEdit: () => void;
  onRemove: (taskId: string) => void;
  onOpenDetail?: (task: TodoTask) => void;
};

export function TodoList({
  tasks,
  favoriteIds,
  muted,
  editingId,
  editDraft,
  cardStyle,
  rowBorder,
  scheme,
  palette,
  editInputRef,
  onToggle,
  onToggleFavorite,
  onBeginEdit,
  onEditDraftChange,
  onFinishEdit,
  onRemove,
  onOpenDetail,
}: Props) {
  return (
    <View style={styles.outer}>
      <View style={[styles.listCard, cardStyle, styles.listCardGrow]}>
        {tasks.length === 0 ? (
          <Text style={[styles.empty, { color: muted }]}>Задач пока нет — добавь первую.</Text>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {tasks.map((task, index) => (
              <TodoItem
                key={task.id}
                task={task}
                isFavorite={favoriteIds.includes(task.id)}
                isLast={index === tasks.length - 1}
                isEditing={editingId === task.id}
                editDraft={editDraft}
                rowBorder={rowBorder}
                scheme={scheme}
                palette={palette}
                editInputRef={editInputRef}
                onToggle={() => onToggle(task.id)}
                onToggleFavorite={() => onToggleFavorite(task.id)}
                onBeginEdit={() => onBeginEdit(task)}
                onEditDraftChange={onEditDraftChange}
                onFinishEdit={onFinishEdit}
                onRemove={() => onRemove(task.id)}
                onOpenDetail={
                  onOpenDetail && isRemoteTodoId(task.id) ? () => onOpenDetail(task) : undefined
                }
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    minHeight: 0,
    paddingBottom: 32,
  },
  listCard: {
    marginHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  listCardGrow: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  empty: {
    padding: 20,
    textAlign: 'center',
    fontSize: 15,
  },
});

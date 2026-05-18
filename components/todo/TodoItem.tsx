import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors } from '@/constants/theme';

import type { TodoTask } from './types';

type Props = {
  task: TodoTask;
  isFavorite: boolean;
  isLast: boolean;
  isEditing: boolean;
  editDraft: string;
  rowBorder: string;
  scheme: 'light' | 'dark';
  palette: (typeof Colors)['light'] | (typeof Colors)['dark'];
  editInputRef: React.RefObject<TextInput | null>;
  onToggle: () => void;
  onToggleFavorite: () => void;
  onBeginEdit: () => void;
  onEditDraftChange: (v: string) => void;
  onFinishEdit: () => void;
  onRemove: () => void;
  onOpenDetail?: () => void;
};

export function TodoItem({
  task,
  isFavorite,
  isLast,
  isEditing,
  editDraft,
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
    <View
      style={[
        styles.taskRow,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: rowBorder,
        },
      ]}>
      <Pressable onPress={onToggle} hitSlop={8} style={styles.taskCheckboxWrap}>
        <MaterialCommunityIcons
          name={task.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={26}
          color={task.done ? palette.tint : palette.icon}
        />
      </Pressable>
      <View style={styles.taskTitleWrap}>
        {isEditing ? (
          <TextInput
            ref={editInputRef}
            value={editDraft}
            onChangeText={onEditDraftChange}
            onBlur={onFinishEdit}
            onSubmitEditing={onFinishEdit}
            returnKeyType="done"
            blurOnSubmit
            style={[
              styles.taskEditInput,
              {
                color: palette.text,
                borderColor: palette.tint,
                backgroundColor: scheme === 'dark' ? '#12161a' : '#f8fafc',
              },
            ]}
          />
        ) : (
          <Pressable onPress={onBeginEdit}>
            <Text
              style={[
                styles.taskTitle,
                {
                  color: palette.text,
                  opacity: task.done ? 0.55 : 1,
                  textDecorationLine: task.done ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={3}>
              {task.title}
            </Text>
          </Pressable>
        )}
      </View>
      {onOpenDetail ? (
        <Pressable onPress={onOpenDetail} hitSlop={10} style={styles.detailWrap}>
          <MaterialCommunityIcons name="chevron-right" size={22} color={palette.icon} />
        </Pressable>
      ) : null}
      <Pressable onPress={onToggleFavorite} hitSlop={10} style={styles.starWrap}>
        <MaterialCommunityIcons
          name={isFavorite ? 'star' : 'star-outline'}
          size={24}
          color={isFavorite ? '#f59e0b' : palette.icon}
        />
      </Pressable>
      <Pressable onPress={onRemove} hitSlop={12}>
        <MaterialCommunityIcons name="delete-outline" size={24} color={palette.icon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  taskCheckboxWrap: {
    justifyContent: 'center',
  },
  taskTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  detailWrap: {
    justifyContent: 'center',
  },
  starWrap: {
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  taskEditInput: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    minHeight: 40,
  },
});

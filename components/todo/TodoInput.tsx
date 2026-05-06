import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors } from '@/constants/theme';

type Props = {
  onAdd: (text: string) => void;
  scheme: 'light' | 'dark';
  palette: (typeof Colors)['light'] | (typeof Colors)['dark'];
  muted: string;
  rowBorder: string;
  cardStyle: { backgroundColor: string; borderColor: string };
};

export function TodoInput({ onAdd, scheme, palette, muted, rowBorder, cardStyle }: Props) {
  const [text, setText] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
    Keyboard.dismiss();
  }, [text, onAdd]);

  const iconBg =
    scheme === 'dark'
      ? { bg: '#1e2930' as const, soft: '#243038' as const }
      : { bg: '#eef6f9' as const, soft: '#dff0f8' as const };

  return (
    <View style={[styles.wrap, styles.cardLift, cardStyle]}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>Новая задача</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Что нужно сделать?"
        placeholderTextColor={muted}
        style={[
          styles.input,
          {
            color: palette.text,
            borderColor: rowBorder,
            backgroundColor: scheme === 'dark' ? '#12161a' : '#f8fafc',
          },
        ]}
        returnKeyType="done"
        onSubmitEditing={handleAdd}
      />
      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.addRow,
          {
            borderColor: palette.tint,
            backgroundColor: iconBg.soft,
            opacity: pressed ? 0.92 : 1,
          },
        ]}>
        <View style={[styles.addIconBadge, { backgroundColor: iconBg.bg }]}>
          <MaterialCommunityIcons name="playlist-plus" size={22} color={palette.tint} />
        </View>
        <Text style={[styles.addLabel, { color: palette.tint }]}>Добавить в список</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 18,
    marginTop: -18,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardLift: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    marginBottom: 14,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  addIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});

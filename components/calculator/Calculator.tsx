import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Op = '+' | '-' | '*' | '/';

function applyOp(a: number, b: number, op: Op): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) return Number.NaN;
      return a / b;
    default:
      return b;
  }
}

function formatDisplay(n: number): string {
  if (Number.isNaN(n)) return 'Ошибка';
  if (!Number.isFinite(n)) return 'Ошибка';
  const s = String(n);
  if (s.length > 12) {
    const x = n.toPrecision(8);
    return String(Number(x));
  }
  return s;
}

function CalcKey({
  label,
  onPress,
  bg,
  color,
  wide,
}: {
  label: string;
  onPress: () => void;
  bg: string;
  color: string;
  wide?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        wide && styles.keyWide,
        { backgroundColor: bg, opacity: pressed ? 0.85 : 1 },
      ]}>
      <Text style={[styles.keyLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Calculator() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const insets = useSafeAreaInsets();

  const [display, setDisplay] = useState('0');
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(false);

  const inputDigit = useCallback(
    (d: string) => {
      if (fresh) {
        setDisplay(d);
        setFresh(false);
        return;
      }
      setDisplay((prev) => {
        if (prev === 'Ошибка') return d;
        if (prev === '0') return d;
        return prev + d;
      });
    },
    [fresh],
  );

  const inputDot = useCallback(() => {
    if (fresh) {
      setDisplay('0.');
      setFresh(false);
      return;
    }
    setDisplay((prev) => {
      if (prev.includes('.')) return prev;
      return `${prev}.`;
    });
  }, [fresh]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setAccumulator(null);
    setPendingOp(null);
    setFresh(false);
  }, []);

  const backspace = useCallback(() => {
    if (fresh) return;
    setDisplay((prev) => {
      if (prev === 'Ошибка') return '0';
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  }, [fresh]);

  const pickOp = useCallback(
    (op: Op) => {
      const current = parseFloat(display);
      if (Number.isNaN(current) || display === 'Ошибка') {
        clearAll();
        return;
      }

      if (pendingOp !== null && accumulator !== null && !fresh) {
        const res = applyOp(accumulator, current, pendingOp);
        if (Number.isNaN(res)) {
          setDisplay('Ошибка');
          setAccumulator(null);
          setPendingOp(null);
          setFresh(true);
          return;
        }
        setAccumulator(res);
        setDisplay(formatDisplay(res));
        setPendingOp(op);
        setFresh(true);
        return;
      }

      setAccumulator(current);
      setPendingOp(op);
      setFresh(true);
    },
    [display, accumulator, pendingOp, fresh, clearAll],
  );

  const equals = useCallback(() => {
    if (pendingOp === null || accumulator === null) return;
    const current = parseFloat(display);
    if (Number.isNaN(current) || display === 'Ошибка') {
      clearAll();
      return;
    }
    const res = applyOp(accumulator, current, pendingOp);
    if (Number.isNaN(res)) {
      setDisplay('Ошибка');
    } else {
      setDisplay(formatDisplay(res));
    }
    setAccumulator(null);
    setPendingOp(null);
    setFresh(true);
  }, [display, accumulator, pendingOp, clearAll]);

  const pageBg = scheme === 'dark' ? '#0c0f12' : '#eef2f6';
  const padBg = scheme === 'dark' ? '#1a1f23' : '#ffffff';
  const keyNum = scheme === 'dark' ? '#2a3238' : '#e8edf2';
  const keyOp = scheme === 'dark' ? '#1e4d6e' : palette.tint;
  const keyFn = scheme === 'dark' ? '#243038' : '#d0dae3';
  const opText = '#fff';
  const numText = palette.text;

  return (
    <View style={[styles.screen, { backgroundColor: pageBg, paddingTop: Math.max(insets.top, 12) }]}>
      <Text style={[styles.title, { color: palette.text }]}>Калькулятор</Text>
      <View style={[styles.displayWrap, { backgroundColor: padBg, borderColor: scheme === 'dark' ? '#2a3238' : '#e8edf2' }]}>
        <Text
          style={[styles.display, { color: palette.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit={Platform.OS === 'ios'}
          minimumFontScale={0.35}>
          {display}
        </Text>
      </View>

      <View style={[styles.pad, { backgroundColor: padBg }]}>
        <View style={styles.row}>
          <CalcKey label="AC" onPress={clearAll} bg={keyFn} color={numText} />
          <CalcKey label="⌫" onPress={backspace} bg={keyFn} color={numText} />
          <CalcKey label="÷" onPress={() => pickOp('/')} bg={keyOp} color={opText} />
          <CalcKey label="×" onPress={() => pickOp('*')} bg={keyOp} color={opText} />
        </View>
        <View style={styles.row}>
          <CalcKey label="7" onPress={() => inputDigit('7')} bg={keyNum} color={numText} />
          <CalcKey label="8" onPress={() => inputDigit('8')} bg={keyNum} color={numText} />
          <CalcKey label="9" onPress={() => inputDigit('9')} bg={keyNum} color={numText} />
          <CalcKey label="−" onPress={() => pickOp('-')} bg={keyOp} color={opText} />
        </View>
        <View style={styles.row}>
          <CalcKey label="4" onPress={() => inputDigit('4')} bg={keyNum} color={numText} />
          <CalcKey label="5" onPress={() => inputDigit('5')} bg={keyNum} color={numText} />
          <CalcKey label="6" onPress={() => inputDigit('6')} bg={keyNum} color={numText} />
          <CalcKey label="+" onPress={() => pickOp('+')} bg={keyOp} color={opText} />
        </View>
        <View style={styles.row}>
          <CalcKey label="1" onPress={() => inputDigit('1')} bg={keyNum} color={numText} />
          <CalcKey label="2" onPress={() => inputDigit('2')} bg={keyNum} color={numText} />
          <CalcKey label="3" onPress={() => inputDigit('3')} bg={keyNum} color={numText} />
          <CalcKey label="=" onPress={equals} bg={keyOp} color={opText} />
        </View>
        <View style={styles.row}>
          <CalcKey label="0" wide onPress={() => inputDigit('0')} bg={keyNum} color={numText} />
          <CalcKey label="." onPress={inputDot} bg={keyNum} color={numText} />
          <View style={styles.keySpacer} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  displayWrap: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 16,
    minHeight: 72,
    justifyContent: 'center',
  },
  display: {
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'right',
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums'] },
      default: {},
    }),
  },
  pad: {
    borderRadius: 18,
    padding: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  key: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWide: {
    flex: 2,
    aspectRatio: undefined,
    maxHeight: 72,
  },
  keySpacer: {
    flex: 1,
    maxHeight: 72,
  },
  keyLabel: {
    fontSize: 22,
    fontWeight: '700',
  },
});

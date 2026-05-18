import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@myapp/todo-favurites';

export async function loadFavoritesTodo(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export async function saveFavoriteTodoIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export async function toggleTodoFavorite(id: string): Promise<string[]> {
  const current = await loadFavoritesTodo();
  const updated = current.includes(id)
    ? current.filter((favId) => favId !== id)
    : [...current, id];
  await saveFavoriteTodoIds(updated);
  return updated;
}

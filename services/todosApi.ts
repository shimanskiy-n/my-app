import type { TodoTask } from '@/components/todo/types';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

type RemoteTodoRow = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

function rowToTask(row: RemoteTodoRow): TodoTask {
  return {
    id: String(row.id),
    title: row.title,
    done: row.completed,
  };
}

/** Задачи с числовым id пришли с API; PATCH/DELETE имеют смысл только для них. */
export function isRemoteTodoId(id: string): boolean {
  return /^\d+$/.test(id);
}

export async function fetchTodos(): Promise<TodoTask[]> {
  const res = await fetch(`${BASE_URL}/todos`);
  if (!res.ok) {
    throw new Error(`Load failed (${res.status})`);
  }
  const data: RemoteTodoRow[] = await res.json();
  return data.map(rowToTask);
}

/** Демо-запрос: сервер не хранит данные, id в ответе не используем (всегда 201). */
export function postTodoDemo(title: string): void {
  fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      completed: false,
      userId: 1,
    }),
  }).catch(() => undefined);
}

export async function updateTodo(
  id: string,
  partial: Partial<Pick<TodoTask, 'title' | 'done'>>,
): Promise<void> {
  const body: { title?: string; completed?: boolean } = {};
  if (partial.title !== undefined) body.title = partial.title;
  if (partial.done !== undefined) body.completed = partial.done;
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Update failed (${res.status})`);
  }
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/todos/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Delete failed (${res.status})`);
  }
}

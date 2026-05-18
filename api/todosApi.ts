import type { TodoTask } from '@/components/todo/types';

import { placeholderClient } from './client';

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

export function isRemoteTodoId(id: string): boolean {
  return /^\d+$/.test(id);
}

export async function getTodos(): Promise<TodoTask[]> {
  const { data } = await placeholderClient.get<RemoteTodoRow[]>('/todos');
  return data.map(rowToTask);
}

export async function getTodoById(id: string): Promise<TodoTask> {
  const { data } = await placeholderClient.get<RemoteTodoRow>(`/todos/${id}`);
  return rowToTask(data);
}

export function postTodoDemo(title: string): void {
  placeholderClient
    .post('/todos', {
      title,
      completed: false,
      userId: 1,
    })
    .catch(() => undefined);
}

export async function updateTodo(
  id: string,
  partial: Partial<Pick<TodoTask, 'title' | 'done'>>,
): Promise<void> {
  const body: { title?: string; completed?: boolean } = {};
  if (partial.title !== undefined) body.title = partial.title;
  if (partial.done !== undefined) body.completed = partial.done;
  await placeholderClient.patch(`/todos/${id}`, body);
}

export async function deleteTodo(id: string): Promise<void> {
  await placeholderClient.delete(`/todos/${id}`);
}

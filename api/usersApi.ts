import { placeholderClient } from './client';

export type Geo = { lat: string; lng: string };

export type Address = {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
};

export type Company = {
  name: string;
  catchPhrase: string;
  bs: string;
};

export type UserRecord = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
};

export async function fetchUsers(): Promise<UserRecord[]> {
  const { data } = await placeholderClient.get<UserRecord[]>('/users');
  return data;
}

export async function fetchUserById(id: number): Promise<UserRecord> {
  const { data } = await placeholderClient.get<UserRecord>(`/users/${id}`);
  return data;
}

export async function patchUserName(id: number, name: string): Promise<void> {
  await placeholderClient.patch(`/users/${id}`, { name });
}

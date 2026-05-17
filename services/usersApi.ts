const BASE_URL = 'https://jsonplaceholder.typicode.com';

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
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error(`Users load failed (${res.status})`);
  return res.json() as Promise<UserRecord[]>;
}

export async function fetchUserById(id: number): Promise<UserRecord> {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  if (!res.ok) throw new Error(`User load failed (${res.status})`);
  return res.json() as Promise<UserRecord>;
}

export async function patchUserName(id: number, name: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`PATCH failed (${res.status})`);
}

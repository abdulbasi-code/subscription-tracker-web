// lib/api.ts

export async function fetchSubscriptions(token: string) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/subscriptions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch subscriptions");
  return res.json();
}

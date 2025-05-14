/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { fetchSubscriptions } from "../lib/api";

import YearlyGrid from "@/lib/YearlyGrid";

export default function Subscriptions() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => fetchSubscriptions(token),
  });

  const [formState, setFormState] = useState({
    id: null,
    name: "",
    price: "",
    billingCycle: "MONTHLY",
    nextPayment: "",
    color: "#000000",
  });

  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (input: any) => {
      const method = input.id ? "PATCH" : "POST";
      const url = input.id
        ? `${import.meta.env.VITE_BACKEND_URL}/subscriptions/${input.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/subscriptions`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/subscriptions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });

  function resetForm() {
    setFormState({
      id: null,
      name: "",
      price: "",
      billingCycle: "MONTHLY",
      nextPayment: "",
      color: "#000000",
    });
  }

  function handleEdit(sub: any) {
    setFormState({
      id: sub.id,
      name: sub.name,
      price: String(sub.price),
      billingCycle: sub.billingCycle,
      nextPayment: sub.nextPayment.slice(0, 10),
      color: sub.color || "#000000",
    });
    setOpen(true);
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    mutation.mutate(formState);
  }

  if (isLoading) return <p className="p-6">Loading subscriptions...</p>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Subscriptions</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>+ Add Subscription</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                placeholder="Name"
                value={formState.name}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
              />
              <Input
                placeholder="Price"
                type="number"
                value={formState.price}
                onChange={(e) =>
                  setFormState({ ...formState, price: e.target.value })
                }
              />
              <select
                className="w-full border rounded p-2"
                value={formState.billingCycle}
                onChange={(e) =>
                  setFormState({ ...formState, billingCycle: e.target.value })
                }
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
              <Input
                type="date"
                value={formState.nextPayment}
                onChange={(e) =>
                  setFormState({ ...formState, nextPayment: e.target.value })
                }
              />
              <Input
                type="color"
                value={formState.color}
                onChange={(e) =>
                  setFormState({ ...formState, color: e.target.value })
                }
              />
              <Button type="submit" className="w-full">
                {formState.id ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <YearlyGrid
        subscriptions={data.subscriptions}
        onEdit={handleEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}

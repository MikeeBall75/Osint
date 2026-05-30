import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })
  : null;

export const CREDIT_PACKS = [
  { id: "pack_10", name: "10 Credits", credits: 10, price: 499 },
  { id: "pack_50", name: "50 Credits", credits: 50, price: 1999 },
  { id: "pack_200", name: "200 Credits", credits: 200, price: 5999 },
] as const;

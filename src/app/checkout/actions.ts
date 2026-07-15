"use server";

import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function submitOrder(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  items: any[];
  totalPaise: number;
}) {
  const { name, email, phone, address, city, state, pin, items, totalPaise } = data;

  const shippingAddress = JSON.stringify({
    name,
    line1: address,
    city,
    state,
    pincode: pin,
  });

  const orderItems = JSON.stringify(items);

  const orderNumber = `AUR${Math.floor(100000 + Math.random() * 900000)}`;

  const order = await prisma.order.create({
    data: {
      number: orderNumber,
      email,
      phone,
      shippingAddress,
      items: orderItems,
      totalPaise,
      status: "Processing",
      paymentStatus: "COD",
    },
  });

  revalidatePath("/admin/orders");

  return { success: true, orderId: order.number };
}

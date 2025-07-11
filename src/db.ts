// lib/db.ts
import { Order } from './types';

// Giả lập cơ sở dữ liệu trong bộ nhớ
let orders: Order[] = [];

export const getOrders = (): Order[] => orders;

export const getOrderById = (id: string): Order | undefined => orders.find(order => order.id === id);

export const createOrder = (newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
  const createdAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const order: Order = { ...newOrder, createdAt, updatedAt, status: 'pending' };
  orders.push(order);
  return order;
};

export const updateOrder = (id: string | undefined, updatedFields: Partial<Order>): Order | undefined => {
  const index = orders.findIndex(order => order.id === id);
  if (index === -1) return undefined;

  orders[index] = { ...orders[index], ...updatedFields, updatedAt: new Date().toISOString() };
  return orders[index];
};

export const deleteOrder = (id: string): boolean => {
  const initialLength = orders.length;
  orders = orders.filter(order => order.id !== id);
  return orders.length < initialLength;
};
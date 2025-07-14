// services/orderService.js
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Order } from './types';

const ordersCollectionRef = collection(db, 'orders');

// Thêm đơn hàng mới
export const addOrder = async (orderData: Order): Promise<Order> => {
    console.log('Adding order:', orderData);
    try {
        const docRef = await addDoc(ordersCollectionRef, {
            ...orderData,
            orderDate: new Date(), // Thêm thời gian tạo đơn hàng
            status: 'pending', // Trạng thái mặc định
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        console.log("Document written with ID: ", docRef.id);
        return { id: docRef.id, ...orderData } as Order;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

// Lấy tất cả đơn hàng
export const getOrders = async (): Promise<Order[]> => {
    console.log('Fetching all orders');
    try {
        const q = query(ordersCollectionRef, orderBy('orderDate', 'desc')); // Sắp xếp theo ngày tạo mới nhất
        const data = await getDocs(q);
        const orders: Order[] = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Order));
        console.log('Orders fetched:', orders.length);
        return orders;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw e;
    }
};

// Cập nhật đơn hàng
export const updateOrder = async (id: string, updatedData: Partial<Order>): Promise<Order> => {
    console.log('Updating order ID:', id);
    try {
        const orderDoc = doc(db, 'orders', id);
        const docSnap = await getDoc(orderDoc);

        if (!docSnap.exists()) {
            throw new Error('Order not found');
        }

        const data = docSnap.data();
        if (!data) {
            throw new Error('Document exists but data is undefined');
        }

        const updatedOrder = { ...data, ...updatedData, updatedAt: new Date().toISOString(), id: id };
        await updateDoc(orderDoc, updatedOrder);
        console.log("Document updated successfully!");
        return updatedOrder as Order;
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
};

// Xóa đơn hàng
// Lấy đơn hàng theo id
export const readOrder = async (id: string): Promise<Order> => {
    console.log('Reading order ID:', id);
    try {
        const orderDoc = doc(db, 'orders', id);
        console.log("reading order document with ID:", id, 1);
        const docSnap = await getDoc(orderDoc);
        console.log("reading order document with ID:", id, 2);
        if (!docSnap.exists()) {
            throw new Error('Order not found');
        }
        console.log("reading order document with ID:", id, 3);
        const data = docSnap.data();
        console.log("reading order document with ID:", id, 4);
        if (!data) {
            throw new Error('Document exists but data is undefined');
        }

        console.log("Document found:", docSnap.id);
        return { id: docSnap.id, ...data } as Order;

    } catch (e) {
        console.error('Error reading document: ', e);
        throw e;
    }
};

export const deleteOrder = async (id: string): Promise<Order> => {
    try {
        const orderDoc = doc(db, 'orders', id);
        const docSnap = await getDoc(orderDoc);

        if (!docSnap.exists()) {
            throw new Error('Order not found');
        }

        const data = docSnap.data();
        if (!data) {
            throw new Error('Document exists but data is undefined');
        }
        const deletedOrder = { id: docSnap.id, ...data } as Order;
        await deleteDoc(orderDoc);
        console.log("Document deleted successfully!");
        return deletedOrder;
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
};


// services/orderService.js
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Order } from './types';
import { create } from 'domain';

const ordersCollectionRef = collection(db, 'orders');

// Thêm đơn hàng mới
export const addOrder = async (orderData: Order): Promise<Order> => {
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
    try {
        const q = query(ordersCollectionRef, orderBy('orderDate', 'desc')); // Sắp xếp theo ngày tạo mới nhất
        const data = await getDocs(q);
        const orders: Order[] = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Order));
        return orders;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw e;
    }
};

// Cập nhật đơn hàng
export const updateOrder = async (id: string, updatedData: Partial<Order>): Promise<Order> => {
    try {
        const orderDoc = doc(db, 'orders', id);
        const docSnap = await getDocs(query(collection(db, 'orders')));
        const found = docSnap.docs.find((d) => d.id === id);

        if (!found) {
            throw new Error('Order not found');
        }

        const updatedOrder = { ...found.data(), ...updatedData, updatedAt: new Date().toISOString(), id: id };
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
    try {
        const orderDoc = doc(db, 'orders', id);
        const docSnap = await getDocs(query(collection(db, 'orders')));
        const found = docSnap.docs.find((d) => d.id === id);
        if (found) {
            return { id: found.id, ...found.data() } as Order;
        } else {
            throw new Error('Order not found');
        }
    } catch (e) {
        console.error('Error reading document: ', e);
        throw e;
    }
};

export const deleteOrder = async (id: string): Promise<Order> => {
    try {
        const orderDoc = doc(db, 'orders', id);
        // Lấy dữ liệu đơn hàng trước khi xóa
        const docSnap = await getDocs(query(collection(db, 'orders')));
        const found = docSnap.docs.find((d) => d.id === id);
        if (!found) {
            throw new Error('Order not found');
        }
        const deletedOrder = { id: found.id, ...found.data() } as Order;
        await deleteDoc(orderDoc);
        console.log("Document deleted successfully!");
        return deletedOrder;
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
};


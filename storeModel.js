export class StoreModel {
    constructor() {
        this.products = [
            { id: 1, name: "T-Shirt", category: "Clothing", price: 500, img: "https://files.cdn.printful.com/o/upload/file-upload/53/53f4388dc79736ff7be0f1c3a9cbb597?v=edc3b25890c252b9ede2bcf1bfae83c4" },
            { id: 2, name: "Jeans", category: "Clothing", price: 1200, img: "https://www.shutterstock.com/image-photo/jeans-pant-isolated-on-transparent-260nw-2590021165.jpg" },
            { id: 3, name: "Headphones", category: "Electronics", price: 2500, img: "" },
            { id: 4, name: "Smart Watch", category: "Electronics", price: 3500, img: "" },
            { id: 5, name: "Shoes", category: "Footwear", price: 1800, img: "" }
        ];

        this.cart = [];
        this.orders = [];
        this.notifications = [];
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) this.cart.push(product);
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
    }

    checkout() {
        if (this.cart.length === 0) return null;

        const order = {
            id: this.orders.length + 1,
            items: [...this.cart],
            status: "Pending",
            createdAt: new Date().toLocaleString()
        };

        this.orders.push(order);
        this.cart = [];
        return order;
    }

    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) order.status = status;
    }

    addNotification(message) {
        this.notifications.push({
            message,
            timestamp: new Date().toLocaleString()
        });
    }
}

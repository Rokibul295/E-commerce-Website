export class StoreController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.init();
    }

    init() {
        this.updateView();

        document.getElementById("checkout")
            .addEventListener("click", () => this.checkout());
    }

    updateView() {
        this.view.renderProducts(
            this.model.products,
            id => this.addToCart(id)
        );

        this.view.renderCart(
            this.model.cart,
            index => this.removeFromCart(index)
        );

        this.view.renderOrders(this.model.orders);
        this.view.renderNotifications(this.model.notifications);
    }

    addToCart(id) {
        this.model.addToCart(id);
        this.updateView();
    }

    removeFromCart(index) {
        this.model.removeFromCart(index);
        this.updateView();
    }

    checkout() {
        const order = this.model.checkout();
        if (!order) return;

        this.model.addNotification(`Order #${order.id} placed`);
        this.updateView();

        setTimeout(() => {
            this.model.updateOrderStatus(order.id, "Shipped");
            this.model.addNotification(`Order #${order.id} shipped`);
            this.updateView();
        }, 5000);

        setTimeout(() => {
            this.model.updateOrderStatus(order.id, "Delivered");
            this.model.addNotification(`Order #${order.id} delivered`);
            this.updateView();
        }, 10000);
    }
}

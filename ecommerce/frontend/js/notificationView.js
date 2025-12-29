import { getNotifications } from "./api.js";

export class NotificationView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  async loadNotifications() {
    const notifications = await getNotifications();
    this.render(notifications);
  }

  render(notifications) {
    if (notifications.length === 0) {
      this.container.innerHTML = "<p>No notifications</p>";
      return;
    }

    this.container.innerHTML = notifications.map(n => `
      <div class="notification-item">
        [${new Date(n.createdAt).toLocaleTimeString()}] ${n.message}
      </div>
    `).join("");
  }
}

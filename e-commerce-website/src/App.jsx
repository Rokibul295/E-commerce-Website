import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STATUS_FLOW = ['Pending', 'Shipped', 'Delivered']

const initialOrders = [
  {
    id: 'ORD-1042',
    customer: 'Ava Martins',
    status: 'Pending',
    items: 3,
    total: 182.4,
    eta: 'Today, 4:00 - 6:00pm',
    updatedAt: '2024-05-21T12:15:00Z',
    channel: 'Email + Dashboard',
  },
  {
    id: 'ORD-2031',
    customer: 'Kenji Patel',
    status: 'Shipped',
    items: 1,
    total: 58.0,
    eta: 'Tomorrow, 11:00am',
    updatedAt: '2024-05-21T11:05:00Z',
    channel: 'Dashboard',
  },
  {
    id: 'ORD-8894',
    customer: 'Sasha Lee',
    status: 'Delivered',
    items: 2,
    total: 96.75,
    eta: 'Delivered',
    updatedAt: '2024-05-20T18:22:00Z',
    channel: 'Email + Dashboard',
  },
]

const statusTheme = {
  Pending: { bg: '#fff6e5', text: '#b76b00', border: '#ffd48f' },
  Shipped: { bg: '#e8f2ff', text: '#1d4ed8', border: '#b8d0ff' },
  Delivered: { bg: '#e8fff2', text: '#0f9d58', border: '#b7f2d0' },
}

function formatTimeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getNextStatus(status) {
  const idx = STATUS_FLOW.indexOf(status)
  return idx === -1 || idx === STATUS_FLOW.length - 1
    ? status
    : STATUS_FLOW[idx + 1]
}

function App() {
  const [orders, setOrders] = useState(initialOrders)
  const [notifications, setNotifications] = useState(() =>
    initialOrders.map((order) => ({
      id: `${order.id}-init`,
      orderId: order.id,
      status: order.status,
      channel: order.channel,
      message: `${order.id} marked as ${order.status}`,
      time: order.updatedAt,
    })),
  )
  const [emailEnabled, setEmailEnabled] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setOrders((prev) => {
        const statusUpdates = []
        const nextOrders = prev.map((order) => {
          if (order.status === 'Delivered') return order
          const shouldAdvance = Math.random() > 0.5
          if (!shouldAdvance) return order

          const nextStatus = getNextStatus(order.status)
          if (nextStatus === order.status) return order

          statusUpdates.push({ orderId: order.id, status: nextStatus })
          return {
            ...order,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          }
        })

        if (statusUpdates.length) {
          setNotifications((prevNotes) => {
            const newNotes = statusUpdates.map((update) => ({
              id: `${update.orderId}-${update.status}-${Date.now()}`,
              orderId: update.orderId,
              status: update.status,
              channel: emailEnabled ? 'Email + Dashboard' : 'Dashboard',
              message: `${update.orderId} is now ${update.status}`,
              time: new Date().toISOString(),
            }))

            return [...newNotes, ...prevNotes].slice(0, 40)
          })
        }

        return nextOrders
      })
    }, 4200)

    return () => clearInterval(id)
  }, [emailEnabled])

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== 'Delivered').length,
    [orders],
  )

  const deliveredToday = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === 'Delivered' &&
          new Date(order.updatedAt).getDate() === new Date().getDate(),
      ).length,
    [orders],
  )

  const progressPercent = (status) => {
    const idx = STATUS_FLOW.indexOf(status)
    if (idx === -1) return 0
    return Math.round(((idx + 1) / STATUS_FLOW.length) * 100)
  }

  const sendManualUpdate = (order) => {
    const nextStatus = getNextStatus(order.status)
    if (nextStatus === order.status) return

    const manualNote = {
      id: `${order.id}-manual-${Date.now()}`,
      orderId: order.id,
      status: nextStatus,
      channel: emailEnabled ? 'Email + Dashboard' : 'Dashboard',
      message: `${order.id} manually moved to ${nextStatus}`,
      time: new Date().toISOString(),
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, status: nextStatus, updatedAt: manualNote.time }
          : o,
      ),
    )
    setNotifications((prev) => [manualNote, ...prev].slice(0, 40))
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <div className="pill live">Live order tracking</div>
          <h1>ShopSwift Commerce</h1>
          <p>
            Real-time order status (Pending, Shipped, Delivered) with instant
            alerts by email or in-dashboard notifications. Keep customers in the
            loop, automatically.
          </p>
          <div className="hero-actions">
            <button className="primary">Create manual order</button>
            <button className="ghost">View customer portal</button>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card__title">Live fulfillment</div>
          <div className="hero-card__body">
            <div className="stat-row">
              <span>Orders updating now</span>
              <strong>{activeOrders}</strong>
            </div>
            <div className="stat-row">
              <span>Delivered today</span>
              <strong>{deliveredToday}</strong>
            </div>
            <div className="meter">
              <div className="meter__fill" style={{ width: '74%' }} />
            </div>
            <div className="pill success">Email + Dashboard on</div>
          </div>
        </div>
      </header>

      <main className="grid">
        <section className="card wide">
          <div className="section-head">
            <div>
              <p className="eyebrow">Order board</p>
              <h2>Real-time status</h2>
            </div>
            <div className="section-actions">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                />
                <span className="toggle__slider" />
                <span>Email updates</span>
              </label>
              <div className="pill neutral">Statuses: Pending → Shipped → Delivered</div>
            </div>
          </div>
          <div className="orders">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card__row">
                  <div>
                    <p className="order-id">{order.id}</p>
                    <p className="order-customer">{order.customer}</p>
                  </div>
                  <div className="status-chip" style={statusTheme[order.status]}>
                    {order.status}
                  </div>
                </div>
                <div className="order-meta">
                  <span>{order.items} item(s)</span>
                  <span>${order.total.toFixed(2)}</span>
                  <span>ETA: {order.eta}</span>
                  <span>Updated {formatTimeAgo(order.updatedAt)}</span>
                </div>
                <div className="progress">
                  {STATUS_FLOW.map((step) => (
                    <div
                      key={step}
                      className={`progress__step ${
                        STATUS_FLOW.indexOf(step) <= STATUS_FLOW.indexOf(order.status)
                          ? 'done'
                          : ''
                      }`}
                    >
                      <span>{step}</span>
                    </div>
                  ))}
                  <div
                    className="progress__bar"
                    style={{ width: `${progressPercent(order.status)}%` }}
                  />
                </div>
                <div className="order-footer">
                  <span className="channel">{order.channel}</span>
                  <div className="actions">
                    <button
                      className="ghost small"
                      disabled={order.status === 'Delivered'}
                      onClick={() => sendManualUpdate(order)}
                    >
                      Advance status
                    </button>
                    <button className="ghost small">Send email now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Customer notifications</p>
              <h2>Dashboard & email feed</h2>
            </div>
            <div className="pill live">Real-time</div>
          </div>
          <ul className="notifications">
            {notifications.slice(0, 12).map((note) => (
              <li key={note.id} className="notification">
                <div>
                  <p className="notification__title">{note.message}</p>
                  <p className="notification__meta">
                    {note.orderId} · {note.status} · {note.channel}
                  </p>
                </div>
                <span className="notification__time">{formatTimeAgo(note.time)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card slim">
          <div className="section-head">
            <div>
              <p className="eyebrow">Customer promise</p>
              <h2>Delight every update</h2>
            </div>
          </div>
          <ul className="list">
            <li>Customers always see the latest status: Pending, Shipped, Delivered.</li>
            <li>Email alerts mirror the dashboard so buyers never miss an update.</li>
            <li>Support team can push a manual status or email with one click.</li>
            <li>Real-time feed keeps operations aware of every order change.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App

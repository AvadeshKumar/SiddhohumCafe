import { Server } from 'socket.io'

let ioInstance = null

export const initSocketServer = (httpServer, allowedOrigin = '*') => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: allowedOrigin || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  ioInstance.on('connection', (socket) => {
    // Client can join an order-specific room to listen for live updates
    socket.on('join:order', (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`)
      }
    })

    // Staff/Admin joins admin room
    socket.on('join:admin', () => {
      socket.join('admin')
    })

    socket.on('leave:order', (orderId) => {
      if (orderId) {
        socket.leave(`order:${orderId}`)
      }
    })
  })

  return ioInstance
}

export const getIO = () => {
  return ioInstance
}

export const emitNewOrder = (order) => {
  if (ioInstance) {
    ioInstance.to('admin').emit('order:new', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      queueToken: order.queueToken,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      finalTotal: order.finalTotal,
      status: order.status,
      placedAt: order.placedAt
    })
  }
}

export const emitOrderStatusUpdate = (order) => {
  if (ioInstance) {
    const payload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      queueToken: order.queueToken,
      status: order.status,
      paymentStatus: order.paymentStatus,
      estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
      rejectionReason: order.rejectionReason,
      cancellationReason: order.cancellationReason,
      deliveredAt: order.deliveredAt,
      deliveryVerification: order.deliveryVerification
    }

    // Emit to specific order room for customer tracking
    ioInstance.to(`order:${order._id}`).emit('order:updated', payload)
    // Also emit to admin panel
    ioInstance.to('admin').emit('order:status_changed', payload)
  }
}

export const emitCafeSettingsUpdate = (settings) => {
  if (ioInstance) {
    ioInstance.emit('cafe:updated', settings)
  }
}

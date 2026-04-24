import { create } from 'zustand'

export interface RiderLocation {
  latitude: number
  longitude: number
  updatedAt: string
}

export interface ActiveOrder {
  id: string
  status: string
  pickupAddress: string
  dropoffAddress: string
  pickupLatitude: number
  pickupLongitude: number
  dropoffLatitude: number
  dropoffLongitude: number
  finalPrice: number
  distanceKm: number
  deliveryType: string
  paymentMethod: string
  rider?: {
    id: string
    user: { name: string; phone: string }
  } | null
  createdAt: string
}

interface OrderState {
  activeOrder: ActiveOrder | null
  riderLocation: RiderLocation | null
  eta: number | null
  orderStatus: string | null
  setActiveOrder: (order: ActiveOrder) => void
  updateRiderLocation: (location: RiderLocation) => void
  setEta: (eta: number) => void
  setOrderStatus: (status: string) => void
  clearOrder: () => void
}

export const useOrderStore = create<OrderState>()((set) => ({
  activeOrder: null,
  riderLocation: null,
  eta: null,
  orderStatus: null,

  setActiveOrder: (order) =>
    set({ activeOrder: order, orderStatus: order.status }),

  updateRiderLocation: (location) => set({ riderLocation: location }),

  setEta: (eta) => set({ eta }),

  setOrderStatus: (status) =>
    set((state) => ({
      orderStatus: status,
      activeOrder: state.activeOrder
        ? { ...state.activeOrder, status }
        : null,
    })),

  clearOrder: () =>
    set({ activeOrder: null, riderLocation: null, eta: null, orderStatus: null }),
}))

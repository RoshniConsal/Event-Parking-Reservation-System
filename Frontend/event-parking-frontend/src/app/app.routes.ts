import { Routes } from '@angular/router';

import {
  PublicLayout
} from './layouts/public-layout/public-layout';

import {
  CustomerLayout
} from './layouts/customer-layout/customer-layout';

import {
  AdminLayout
} from './layouts/admin-layout/admin-layout';

import {
  authGuard
} from './core/guards/auth-guard';

import {
  roleGuard
} from './core/guards/role-guard';

export const routes: Routes = [

  // =====================================================
  // PUBLIC
  // =====================================================
  {
    path: '',
    component: PublicLayout,

    children: [

      {
        path: '',
        title: 'EventPark | Home',

        loadComponent: () =>
          import('./features/home/home')
            .then(m => m.Home)
      },

      {
        path: 'events',
        title: 'Events | EventPark',

        loadComponent: () =>
          import(
            './features/events/event-list/event-list'
          ).then(
            m => m.EventList
          )
      },

      {
        path: 'events/:id',
        title: 'Event Details | EventPark',

        loadComponent: () =>
          import(
            './features/events/event-details/event-details'
          ).then(
            m => m.EventDetails
          )
      },

      {
        path: 'login',
        title: 'Login | EventPark',

        loadComponent: () =>
          import(
            './features/auth/login/login'
          ).then(
            m => m.Login
          )
      },

      {
        path: 'register',
        title: 'Register | EventPark',

        loadComponent: () =>
          import(
            './features/auth/register/register'
          ).then(
            m => m.Register
          )
      },

      {
        path: 'verify-email',
        title: 'Verify Email | EventPark',

        loadComponent: () =>
          import(
            './features/auth/verify-email/verify-email'
          ).then(
            m => m.VerifyEmail
          )
      },

      {
        path: 'forgot-password',
        title: 'Forgot Password | EventPark',

        loadComponent: () =>
          import(
            './features/auth/forgot-password/forgot-password'
          ).then(
            m => m.ForgotPassword
          )
      },

      {
        path: 'reset-password',
        title: 'Reset Password | EventPark',

        loadComponent: () =>
          import(
            './features/auth/reset-password/reset-password'
          ).then(
            m => m.ResetPassword
          )
      }
    ]
  },


  // =====================================================
  // CUSTOMER
  // =====================================================
  {
    path: 'customer',
    component: CustomerLayout,

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      roles: [
        'Customer'
      ]
    },

    children: [

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },

      {
        path: 'dashboard',
        title: 'Customer Dashboard | EventPark',

        loadComponent: () =>
          import(
            './features/dashboard/customer-dashboard/customer-dashboard'
          ).then(
            m => m.CustomerDashboard
          )
      },

      {
        path: 'bookings',
        title: 'My Bookings | EventPark',

        loadComponent: () =>
          import(
            './features/bookings/my-bookings/my-bookings'
          ).then(
            m => m.MyBookings
          )
      },

      {
        path: 'bookings/:id',
        title: 'Booking Details | EventPark',

        loadComponent: () =>
          import(
            './features/bookings/booking-details/booking-details'
          ).then(
            m => m.BookingDetails
          )
      },

      {
        path: 'events/:eventId/seats',
        title: 'Select Seats | EventPark',

        loadComponent: () =>
          import(
            './features/seats/seat-selection/seat-selection'
          ).then(
            m => m.SeatSelection
          )
      },

      {
        path: 'events/:eventId/parking',
        title: 'Select Parking | EventPark',

        loadComponent: () =>
          import(
            './features/parking/parking-selection/parking-selection'
          ).then(
            m => m.ParkingSelection
          )
      },

      {
        path: 'checkout',
        title: 'Checkout | EventPark',

        loadComponent: () =>
          import(
            './features/bookings/booking-checkout/booking-checkout'
          ).then(
            m => m.BookingCheckout
          )
      },

      {
        path: 'bookings/:bookingId/payment',
        title: 'Payment | EventPark',

        loadComponent: () =>
          import(
            './features/payments/payment/payment'
          ).then(
            m => m.Payment
          )
      },

      {
        path: 'payments',
        title: 'My Payments | EventPark',

        loadComponent: () =>
          import(
            './features/payments/my-payments/my-payments'
          ).then(
            m => m.MyPayments
          )
      },

      {
        path: 'notifications',
        title: 'Notifications | EventPark',

        loadComponent: () =>
          import(
            './features/notifications/my-notifications/my-notifications'
          ).then(
            m => m.MyNotifications
          )
      }
    ]
  },


  // =====================================================
  // ADMIN
  // =====================================================
  {
    path: 'admin',
    component: AdminLayout,

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      roles: [
        'Administrator'
      ]
    },

    children: [

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },

      {
        path: 'dashboard',
        title: 'Admin Dashboard | EventPark',

        loadComponent: () =>
          import(
            './features/dashboard/admin-dashboard/admin-dashboard'
          ).then(
            m => m.AdminDashboard
          )
      },

      {
        path: 'venues',
        title: 'Manage Venues | EventPark',

        loadComponent: () =>
          import(
            './features/venues/admin-venues/admin-venues'
          ).then(
            m => m.AdminVenues
          )
      },

      {
        path: 'categories',
        title: 'Manage Categories | EventPark',

        loadComponent: () =>
          import(
            './features/categories/admin-categories/admin-categories'
          ).then(
            m => m.AdminCategories
          )
      },

      {
        path: 'events',
        title: 'Manage Events | EventPark',

        loadComponent: () =>
          import(
            './features/events/admin-events/admin-events'
          ).then(
            m => m.AdminEvents
          )
      },

      {
        path: 'events/:eventId/seats',
        title: 'Manage Seats | EventPark',

        loadComponent: () =>
          import(
            './features/seats/admin-seats/admin-seats'
          ).then(
            m => m.AdminSeats
          )
      },

      {
        path: 'events/:eventId/parking',
        title: 'Manage Parking | EventPark',

        loadComponent: () =>
          import(
            './features/parking/admin-parking/admin-parking'
          ).then(
            m => m.AdminParking
          )
      },

      {
        path: 'customers',
        title: 'Manage Customers | EventPark',

        loadComponent: () =>
          import(
            './features/customers/admin-customers/admin-customers'
          ).then(
            m => m.AdminCustomers
          )
      },

      {
        path: 'bookings',
        title: 'Manage Bookings | EventPark',

        loadComponent: () =>
          import(
            './features/bookings/admin-bookings/admin-bookings'
          ).then(
            m => m.AdminBookings
          )
      },

      {
        path: 'payments',
        title: 'Manage Payments | EventPark',

        loadComponent: () =>
          import(
            './features/payments/admin-payments/admin-payments'
          ).then(
            m => m.AdminPayments
          )
      },

      {
        path: 'notifications',
        title: 'Admin Notifications | EventPark',

        loadComponent: () =>
          import(
            './features/notifications/admin-notifications/admin-notifications'
          ).then(
            m => m.AdminNotifications
          )
      }
    ]
  },


  // =====================================================
  // 404
  // =====================================================
  {
    path: '**',
    title: 'Page Not Found | EventPark',

    loadComponent: () =>
      import(
        './features/not-found/not-found'
      ).then(
        m => m.NotFound
      )
  }
];
import toast from 'react-hot-toast'

export const showToast = {
  success: (msg) => toast.success(msg),
  error:   (msg) => toast.error(msg),
  info:    (msg) => toast(msg, { icon: 'ℹ️' }),
  loading: (msg) => toast.loading(msg),
  dismiss: (id)  => toast.dismiss(id),
}

// Component export kept for any direct JSX usage / future custom styling
export default function Toast() {
  return null // react-hot-toast's <Toaster /> is mounted globally in main.jsx
}

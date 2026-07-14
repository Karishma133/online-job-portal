import { Link } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-display font-bold text-gradient mb-3">404</p>
      <h1 className="text-xl font-display font-semibold text-surface-900 dark:text-white">Page not found</h1>
      <p className="text-surface-400 text-sm mt-2 max-w-sm">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="btn btn-primary mt-6">
        <HiOutlineArrowLeft /> Back to home
      </Link>
    </div>
  )
}

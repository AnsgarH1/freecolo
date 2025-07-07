import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 mobile-landscape-compact">
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  ),
})

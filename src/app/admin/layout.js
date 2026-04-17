import AdminNav from './AdminNav'
import './admin.css'

export const metadata = {
  title: 'Admin — HK Games Slime Store',
}

export default function AdminLayout({ children }) {
  return (
    <div className="adminShell">
      <AdminNav />
      <main className="adminMain">{children}</main>
    </div>
  )
}

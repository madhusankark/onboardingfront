import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} Fixora Pro. All rights reserved.
      </footer>
    </div>
  );
}
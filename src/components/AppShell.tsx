import { NavLink, Outlet } from 'react-router-dom'
import { BookIcon, BookmarkIcon, HomeIcon } from './Icons'

const NAV = [
  { to: '/', label: 'Been', Icon: HomeIcon, end: true },
  { to: '/want', label: 'Want to try', Icon: BookmarkIcon, end: false },
  { to: '/household', label: 'Us', Icon: BookIcon, end: false },
]

/**
 * Bottom navigation on phones; becomes a left rail from 768px up (see shell.css).
 * Content lives in a single readable column.
 */
export function AppShell() {
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <nav className="nav" aria-label="Main">
        <span className="nav__brand">Restaurant Journal</span>
        <ul className="nav__list">
          {NAV.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className="nav__link">
                <Icon />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main id="main" className="shell__main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}

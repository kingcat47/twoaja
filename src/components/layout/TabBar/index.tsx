import { NavLink } from 'react-router-dom'
import { CheckSquare, Trophy } from 'lucide-react'
import s from './styles.module.scss'

export default function TabBar() {
  return (
    <nav className={s.tabBar}>
      <NavLink to="/dashboard" className={({ isActive }) => `${s.tab} ${isActive ? s.active : ''}`}>
        <CheckSquare size={22} />
        <span>할 일</span>
      </NavLink>
      <NavLink to="/points" className={({ isActive }) => `${s.tab} ${isActive ? s.active : ''}`}>
        <Trophy size={22} />
        <span>포인트</span>
      </NavLink>
    </nav>
  )
}

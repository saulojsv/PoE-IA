import { Bell, ChevronDown, Download, Menu, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function TopHeader({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(true) } }
    addEventListener('keydown', handleKey)
    return () => removeEventListener('keydown', handleKey)
  }, [])
  const command = (label: string) => { if (label === 'Open Build Lab') navigate('/build-lab'); if (label === 'Explore Mirage builds') navigate('/explore'); setOpen(false) }
  return <header><button className="mobile-menu icon-btn" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={onMenu}><Menu /></button><button className="searchbar" onClick={() => setOpen(true)}><Search /><span>Search builds, skills, items...</span><kbd>⌘ K</kbd></button><div className="header-actions"><button className="select-btn">Mirage League <ChevronDown /></button><button className="select-btn game">PoE 3.28 <ChevronDown /></button><button className="import" onClick={() => navigate('/build-lab')}><Download /> <span>Import Build</span></button><button className="icon-btn"><Bell /></button><div className="avatar">C</div><div className="profile"><b>Cameron</b><small>Pro</small></div></div>{open && <div className="command-backdrop" onMouseDown={() => setOpen(false)}><div className="command" onMouseDown={event => event.stopPropagation()}><div><Search /><input autoFocus placeholder="Search builds, skills, items..." /></div>{[['BUILDS', 'Explore Mirage builds', 'Open Build Lab'], ['SKILLS', 'Lightning Arrow', 'Elemental Hit', 'Toxic Rain'], ['ITEMS', 'Blunderbore', 'The Brass Dome', 'Lightning Coil']].map(([group, ...items]) => <section key={group}><small>{group}</small>{items.map(item => <button key={item} onClick={() => command(item)}>{item}</button>)}</section>)}</div></div>}</header>
}

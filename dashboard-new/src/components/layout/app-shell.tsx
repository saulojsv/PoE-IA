import { useState } from 'react'
import type { ReactNode } from 'react'
import { AppSidebar } from './app-sidebar'
import { TopHeader } from './top-header'
export function AppShell({children}:{children:ReactNode}){ const [collapsed,setCollapsed]=useState(false); const [mobileOpen,setMobileOpen]=useState(false); return <div className={'shell '+(collapsed?'collapsed ':'')+(mobileOpen?'mobile-open':'')}><button className="mobile-nav-backdrop" aria-label="Close menu" onClick={()=>setMobileOpen(false)}/><AppSidebar collapsed={collapsed} setCollapsed={setCollapsed}/><div className="work"><TopHeader onMenu={()=>setMobileOpen(open=>!open)} menuOpen={mobileOpen}/><main>{children}</main></div></div> }

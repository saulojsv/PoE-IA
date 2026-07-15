import { useState } from 'react'
import type { ReactNode } from 'react'
import { AppSidebar } from './app-sidebar'
import { TopHeader } from './top-header'
export function AppShell({children}:{children:ReactNode}){ const [collapsed,setCollapsed]=useState(false); return <div className={'shell '+(collapsed?'collapsed':'')}><AppSidebar collapsed={collapsed} setCollapsed={setCollapsed}/><div className="work"><TopHeader onMenu={()=>setCollapsed(false)}/><main>{children}</main></div></div> }

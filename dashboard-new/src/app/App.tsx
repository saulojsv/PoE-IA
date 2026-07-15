import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/app-shell'
import { BuildDashboard } from '../components/build/build-dashboard'
function Placeholder({title}:{title:string}) { return <section className="placeholder"><p>PoE Build Lab</p><h1>{title}</h1><span>This section is ready for advanced build discovery and analysis.</span></section> }
export default function App(){ return <AppShell><Routes><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="/dashboard" element={<BuildDashboard/>}/>{[['explore','Explore Builds'],['build-lab','Build Lab'],['compare','Compare'],['my-builds','My Builds'],['skills','Skills'],['items','Items'],['passive-tree','Passive Tree'],['settings','Settings']].map(([path,title])=><Route key={path} path={'/'+path} element={<Placeholder title={title}/>}/>)}</Routes></AppShell> }

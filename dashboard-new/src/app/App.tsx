import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/app-shell'
import { BuildDashboard } from '../components/build/build-dashboard'
import { ExploreBuilds } from '../components/explore/explore-builds'
import { BuildDetails } from '../components/explore/build-details'
import { BuildLab } from '../components/build-lab/build-lab'
function Placeholder({title}:{title:string}) { return <section className="placeholder"><p>PoE Build Lab</p><h1>{title}</h1><span>This section is ready for advanced build discovery and analysis.</span></section> }
export default function App(){ return <AppShell><Routes><Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="/dashboard" element={<BuildDashboard/>}/><Route path="/explore" element={<ExploreBuilds/>}/><Route path="/explore/:file" element={<BuildDetails/>}/><Route path="/build-lab" element={<BuildLab/>}/><Route path="/build-lab/:id" element={<BuildLab/>}/>{[['compare','Compare'],['my-builds','My Builds'],['skills','Skills'],['items','Items'],['passive-tree','Passive Tree'],['settings','Settings']].map(([path,title])=><Route key={path} path={'/'+path} element={<Placeholder title={title}/>}/>)}</Routes></AppShell> }

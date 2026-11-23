import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  ['01','Home','/'], ['02','About Mabini','/#about'], ['03','News & Events','/#news'],
  ['04','Featured Places','/#places'], ['05','Procurement Plan/Awards','/procurement'],
  ['06','Officials','/officials'], ['07','Services','/#services'], ['08','Contact','/#contact']
];
export default function Sidebar(){
  const [open,setOpen]=useState(false); const location=useLocation();
  const close=()=>setOpen(false);
  return <>
    <button className="index-toggle" onClick={()=>setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>☰</button>
    <aside className={`sidebar ${open?'open':''}`}>
      <header className="site-header"><img src="/images/mabini-seal.jpg" alt="Mabini seal" className="seal"/><div><h1>Municipality of Mabini</h1><p>Province of Pangasinan, Philippines</p></div></header>
      <div className="nav-label">INDEX</div>
      <nav className="side-nav">{links.map(([n,label,to])=><Link key={n} to={to} onClick={close}><span>{n}</span>{label}</Link>)}</nav>
    </aside>
    {open&&<div className="sidebar-overlay" onClick={close}/>}
  </>;
}

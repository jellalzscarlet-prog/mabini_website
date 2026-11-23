import { Routes,Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Mayor from './pages/Mayor.jsx';
import Officials from './pages/Officials.jsx';
import Members from './pages/Members.jsx';
import Procurement from './pages/Procurement.jsx';
export default function App(){return <><Sidebar/><div className="page-content"><Routes><Route path="/" element={<Home/>}/><Route path="/mayor" element={<Mayor/>}/><Route path="/officials" element={<Officials/>}/><Route path="/members" element={<Members/>}/><Route path="/procurement" element={<Procurement/>}/><Route path="*" element={<Home/>}/></Routes><Footer/></div></>}

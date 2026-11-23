import { useEffect, useState } from 'react';
const slides=[
 {tag:'COMMUNITY NEWS',title:'Blood Letting Activity',text:'Update: Phil. Red Cross goes to RHU Mabini, Pangasinan. Come and donate blood. You too can save lives.',image:'/images/1.jpg'},
 {tag:'MUNICIPAL UPDATES',title:'GMA Foundation',text:'Salamat din po kay Kgd. Vilma Braganza sa pag-assist sa aming taga Barangay Calzada. Maraming salamat din po kay Father Rhendrix Rabago at sa mga sister at brothers na nakiisa sa pagbibigay ng relief.',image:'/images/2.jpg'},
 {tag:'LOCAL ANNOUNCEMENTS',title:'List of Successful Applicants for the Subsidy Allowance',text:'Please check the official municipal announcement for the complete list of successful applicants.',image:'/images/mabini-seal.jpg'}
];
export default function NewsCarousel(){
 const [index,setIndex]=useState(0);
 useEffect(()=>{const timer=setInterval(()=>setIndex(i=>(i+1)%slides.length),6000);return ()=>clearInterval(timer)},[]);
 const s=slides[index];
 return <div className="news-carousel"><div className="news-slide"><div className="news-img"><img src={s.image} alt="News slide"/></div><div className="news-text"><p className="eyebrow green">{s.tag}</p><h3>{s.title}</h3><p>{s.text}</p></div></div>
 <button className="carousel-btn prev" onClick={()=>setIndex(i=>(i+slides.length-1)%slides.length)} aria-label="Previous slide">❮</button><button className="carousel-btn next" onClick={()=>setIndex(i=>(i+1)%slides.length)} aria-label="Next slide">❯</button>
 <div className="dots">{slides.map((_,n)=><button key={n} className={index===n?'active':''} aria-label={`Go to slide ${n+1}`} onClick={()=>setIndex(n)}/>)}</div></div>
}

import React from 'react'
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft'
import "@/styles/Home/Home.css";
import SidebarRight from '../../components/Sidebar-right/SidebarRight';
const Home = () => {
  return (
    <div className='main-containor'>
      <SidebarLeft />
      <div className='main-content'>메인 페이지 입니다.</div>
      <SidebarRight />
    </div>
  )
}

export default Home
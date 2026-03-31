import React from 'react'
import SidebarLeft from '../../components/Sidebar-left/SidebarLeft'
import "@/styles/Home/Home.css";
import SidebarRight from '../../components/Sidebar-right/SidebarRight';
import WeatherCard from '../../components/WeatherCard/WeatherCard';
const Home = () => {
  return (
    <div className='main-containor'>
      <SidebarLeft />
      <div className='main-content'><WeatherCard /></div>
      <SidebarRight />
    </div>
  )
}

export default Home;
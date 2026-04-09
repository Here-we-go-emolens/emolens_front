import LandingHeader from './components/LandingHeader';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import DashboardPreviewSection from './components/DashboardPreviewSection';
import CTASection from './components/CTASection';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', system-ui, sans-serif" }}>
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DashboardPreviewSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}

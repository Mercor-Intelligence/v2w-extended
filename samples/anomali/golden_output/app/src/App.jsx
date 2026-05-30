import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import AgenticSOC from './pages/AgenticSOC.jsx'
import DataLake from './pages/DataLake.jsx'
import ThreatStream from './pages/ThreatStream.jsx'
import AgenticAI from './pages/AgenticAI.jsx'
import Resources from './pages/Resources.jsx'
import Generic from './pages/Generic.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AgenticSOC />} />
          <Route path="/products/agentic-soc-platform" element={<AgenticSOC />} />
          <Route path="/products/unified-security-data-lake" element={<DataLake />} />
          <Route path="/products/threatstream" element={<ThreatStream />} />
          <Route path="/products/agentic-ai" element={<AgenticAI />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/use-cases" element={<Generic title="Use Cases" subtitle="Explore the security challenges Anomali helps solve." />} />
          <Route path="/marketplace" element={<Generic title="Marketplace" subtitle="The largest threat intelligence and integration marketplace." />} />
          <Route path="/company" element={<Generic title="Company" subtitle="Leadership, customers, careers and press at Anomali." />} />
          <Route path="/partners" element={<Generic title="Partners" subtitle="Anomali’s global network of technology and channel partners." />} />
          <Route path="*" element={<Generic title="Page Not Found" subtitle="The page you’re looking for doesn’t exist." />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

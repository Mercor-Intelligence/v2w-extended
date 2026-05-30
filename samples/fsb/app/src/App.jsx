import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Work from './pages/Work.jsx'
import FinancialInnovation from './pages/FinancialInnovation.jsx'
import ClimateRisks from './pages/ClimateRisks.jsx'
import Publications from './pages/Publications.jsx'
import Consultations from './pages/Consultations.jsx'
import Press from './pages/Press.jsx'
import DataPage from './pages/DataPage.jsx'
import VideoAudio from './pages/VideoAudio.jsx'
import Organisation from './pages/Organisation.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/financial-innovation" element={<FinancialInnovation />} />
        <Route path="/work/financial-innovation/climate-related-risks" element={<ClimateRisks />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/consultations" element={<Consultations />} />
        <Route path="/press" element={<Press />} />
        <Route path="/data" element={<DataPage />} />
        <Route path="/video-audio" element={<VideoAudio />} />
        <Route path="/organisation" element={<Organisation />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App

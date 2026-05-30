// Mock data for the FSB website prototype.

export const carouselSlides = [
  {
    tag: 'Plenary Meeting',
    title: 'FSB Plenary meets in November 2025',
    description:
      'The Plenary discussed vulnerabilities in the global financial system and agreed on the 2026 work programme.',
    image: '/images/plenary-meeting-nov-2025-carousel-1024x341.jpg',
  },
  {
    tag: 'Annual Work Programme',
    title: 'FSB 2024 Work Programme',
    description:
      'A focus on enhancing the resilience of non-bank financial intermediation, cyber resilience and the use of AI.',
    image: '/images/2019-Work-Programme-Carousel-458219087-1024x341.jpg',
  },
  {
    tag: 'NBFI',
    title: 'Enhancing the resilience of NBFI',
    description:
      'FSB continues to address vulnerabilities in non-bank financial intermediation with a comprehensive programme.',
    image: '/images/NBFI_2021_carousel-1024x341.jpg',
  },
  {
    tag: 'G-SIBs',
    title: '2024 list of global systemically important banks',
    description:
      'The FSB publishes the annual list of G-SIBs alongside the BCBS, with updated higher loss absorbency buckets.',
    image: '/images/G-SIBs-carousel-1024x341.jpg',
  },
  {
    tag: 'Insurance',
    title: 'Insurance Resolution',
    description:
      'The FSB and the IAIS continue work to strengthen insurance resolution regimes globally.',
    image: '/images/insurance-carousel-1024x341.jpg',
  },
]

export const homeNews = [
  {
    date: '24 November 2025',
    category: 'Press Release',
    title: 'FSB publishes 2024 Annual Report on promoting global financial stability',
    excerpt:
      'The report describes the FSB’s work over the past year to enhance the resilience of the global financial system and to coordinate its response to current vulnerabilities.',
    image: '/images/2024-annual-report-graphic-500x250.jpg',
  },
  {
    date: '18 November 2025',
    category: 'Report',
    title: 'Global Monitoring Report on Non-Bank Financial Intermediation 2024',
    excerpt:
      'The FSB’s annual report describes trends in non-bank financial intermediation, including the activities of investment funds and other financial intermediaries.',
    image: '/images/NBFI_2021_carousel-300x100.jpg',
  },
  {
    date: '12 November 2025',
    category: 'Speech',
    title: 'Speech by John Schindler on Global Financial Stability outlook',
    excerpt:
      'FSB Secretary General delivers a speech on the current state of global financial stability and policy priorities for the year ahead.',
    image: '/images/John-Schindler-GEFS-speech-callout-500x250.jpg',
  },
  {
    date: '07 November 2025',
    category: 'Consultation',
    title: 'Public consultation on cyber incident reporting framework',
    excerpt:
      'FSB seeks public feedback on its proposed Format for Incident Reporting Exchange (FIRE) to strengthen cyber incident reporting.',
    image: '/images/current-consultations-500x250.jpg',
  },
  {
    date: '30 October 2025',
    category: 'Press Release',
    title: 'FSB consults on revised guidance on crypto-asset activities',
    excerpt:
      'The proposed revisions seek to ensure consistent global implementation of FSB’s high-level recommendations on crypto-asset activities and markets.',
    image: '/images/Crypto-assets-300x198.jpg',
  },
]

export const featuredReports = [
  {
    title: '2024 FSB Annual Report',
    description:
      'Reviews the FSB’s work over the past year to promote global financial stability.',
    image: '/images/2024-FSB-Annual-Report-211x300.jpg',
    cta: 'Read the report',
  },
  {
    title: '2024 Resolution Report',
    description:
      'Annual report on the implementation of resolution reforms across banking, insurance and CCPs.',
    image: '/images/2024-resolution-report-210x300.jpg',
    cta: 'Read the report',
  },
  {
    title: 'NBFI Monitoring Report 2024',
    description:
      'Annual report monitoring trends and vulnerabilities in non-bank financial intermediation.',
    image: '/images/nbfi-gmr-2024-212x300.jpg',
    cta: 'Read the report',
  },
]

export const homeCallouts = [
  {
    to: '/data',
    title: 'Data',
    description: 'Datasets, indicators and statistical resources.',
    image: '/images/Vulnerabilities-Callout-250x250.jpg',
  },
  {
    to: '/video-audio',
    title: 'Video and Audio',
    description: 'Speeches, press conferences and multimedia resources.',
    image: '/images/IMG_iStock_000021203601_Full-e1678470776566-500x250.jpg',
  },
  {
    to: '/organisation',
    title: 'Organisation and Members',
    description: 'Structure of the FSB, members and contact information.',
    image: '/images/kk-gsw-500x250.jpg',
  },
]

// ===== Publications =====
export const POLICY_AREAS = [
  'Climate-related Risks',
  'Cyber Resilience',
  'Crypto Assets',
  'Nonbank Financial Intermediation',
  'Cross-border Payments',
  'Resolution',
  'Vulnerabilities',
  'Financial Innovation',
  'Compensation',
]

export const CONTENT_TYPES = [
  'Report',
  'Consultation',
  'Statement',
  'Guidance',
  'Letter',
  'Standard',
  'Press Release',
]

const PUB_TITLES = [
  'Global Monitoring Report on Non-Bank Financial Intermediation',
  'Enhancing the Resilience of NBFI: Progress report',
  'Crypto-asset activities and markets: high-level recommendations',
  'Cyber Incident Reporting: final report',
  'Climate-related disclosures: progress report',
  'Implementation of G20 financial regulatory reforms',
  '2024 list of global systemically important banks (G-SIBs)',
  'Resolution Report: continuing implementation of resolution reforms',
  'Annual Report on the implementation of G20 financial reforms',
  'Stocktake of regulatory and supervisory practices for managing climate-related risks',
  'Money market funds policy proposals to enhance resilience',
  'Liquidity preparedness for margin and collateral calls',
  'Operational incident response and recovery: toolkit',
  'Cross-border payments roadmap: prioritised actions',
  'OTC derivatives reforms implementation progress',
  'Final report on enhancing the resilience of NBFI',
  'FSB Workplan on climate-related financial risks',
  'Common framework for collecting incident data',
]

const PUB_DESCRIPTIONS = [
  'This report describes recent progress and outlines next steps in the FSB’s work programme.',
  'Sets out high-level recommendations to address regulatory and supervisory issues globally.',
  'Reviews implementation of policy reforms agreed by the G20 since the 2008 financial crisis.',
  'Provides an overview of vulnerabilities and policy responses in the relevant area.',
  'Final policy recommendations following stakeholder consultation and overview of responses.',
]

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function generatePublications(count) {
  const r = seededRandom(42)
  const out = []
  for (let i = 1; i <= count; i++) {
    const tIdx = Math.floor(r() * PUB_TITLES.length)
    const dIdx = Math.floor(r() * PUB_DESCRIPTIONS.length)
    const pIdx = Math.floor(r() * POLICY_AREAS.length)
    const cIdx = Math.floor(r() * CONTENT_TYPES.length)
    const year = 2010 + Math.floor(r() * 16) // 2010 - 2025
    const month = 1 + Math.floor(r() * 12)
    const day = 1 + Math.floor(r() * 28)
    const date = new Date(Date.UTC(year, month - 1, day))
    out.push({
      id: i,
      title: `${PUB_TITLES[tIdx]}${i % 7 === 0 ? '' : ` (${year})`}`,
      description: PUB_DESCRIPTIONS[dIdx],
      policyArea: POLICY_AREAS[pIdx],
      contentType: CONTENT_TYPES[cIdx],
      date,
    })
  }
  // Sort by date desc
  out.sort((a, b) => b.date - a.date)
  return out
}

export const PUBLICATIONS = generatePublications(914)

// ===== Press =====
const PRESS_TITLES = [
  'FSB publishes 2024 Annual Report on global financial stability',
  'FSB Chair’s letter to G20 Leaders ahead of the November Summit',
  'FSB consults on revised crypto-asset recommendations',
  'Speech by FSB Secretary General on financial innovation and AI',
  'FSB Plenary meets to discuss vulnerabilities and 2025 work programme',
  'FSB publishes the 2024 list of G-SIBs',
  'FSB releases progress report on climate-related financial risks',
  'Statement by FSB on recent developments in non-bank financial intermediation',
  'FSB announces leadership appointments to Standing Committees',
  'FSB releases roadmap for enhancing cross-border payments',
  'FSB completes peer review on resolution regimes',
  'Speech on operational resilience and cyber preparedness',
]
const PRESS_TYPES = ['Press Release', 'Speech', 'Statement']

function generatePress(count) {
  const r = seededRandom(99)
  const out = []
  for (let i = 1; i <= count; i++) {
    const tIdx = Math.floor(r() * PRESS_TITLES.length)
    const cIdx = Math.floor(r() * PRESS_TYPES.length)
    const pIdx = Math.floor(r() * POLICY_AREAS.length)
    const year = 2012 + Math.floor(r() * 14)
    const month = 1 + Math.floor(r() * 12)
    const day = 1 + Math.floor(r() * 28)
    const date = new Date(Date.UTC(year, month - 1, day))
    out.push({
      id: i,
      title: `${PRESS_TITLES[tIdx]}${i % 5 === 0 ? '' : ` — ${year}`}`,
      type: PRESS_TYPES[cIdx],
      policyArea: POLICY_AREAS[pIdx],
      excerpt:
        'The FSB issued the following item as part of its ongoing work to promote global financial stability through monitoring and coordination.',
      date,
    })
  }
  out.sort((a, b) => b.date - a.date)
  return out
}

export const PRESS = generatePress(1034)

// ===== Work areas =====
export const WORK_AREAS = [
  {
    slug: 'vulnerabilities',
    title: 'Vulnerabilities Assessment',
    description: 'Monitors and assesses vulnerabilities in the global financial system.',
    image: '/images/Vulnerabilities-Callout-250x250.jpg',
  },
  {
    slug: 'financial-innovation',
    title: 'Financial Innovation and Structural Change',
    description:
      'Considers issues arising from financial innovation and structural changes including crypto-assets, AI, and climate-related risks.',
    image: '/images/Crypto-assets-300x198.jpg',
  },
  {
    slug: 'nbfi',
    title: 'Non-Bank Financial Intermediation',
    description: 'Promotes the resilience of non-bank financial intermediation.',
    image: '/images/NBFI_2021_carousel-300x100.jpg',
  },
  {
    slug: 'cross-border-payments',
    title: 'Cross-Border Payments',
    description: 'Coordinates work to enhance the speed, cost, transparency and access of cross-border payments.',
    image: '/images/kk-gsw-500x250.jpg',
  },
  {
    slug: 'cyber-and-operational',
    title: 'Cyber and Operational Resilience',
    description: 'Promotes financial institutions’ operational resilience to cyber and other operational incidents.',
    image: '/images/iStock-1068812244-500x250.jpg',
  },
  {
    slug: 'resolution',
    title: 'Resolution',
    description: 'Develops policies to address risks posed by failing financial institutions.',
    image: '/images/2024-resolution-report-50x71.jpg',
  },
]

export const FIN_INNOVATION_SUB_AREAS = [
  {
    slug: 'climate-related-risks',
    title: 'Climate-related Risks',
    description: 'Coordinates international work to address climate-related financial risks.',
    image: '/images/climate-related-disclosures-300x189.jpg',
  },
  {
    slug: 'crypto-assets',
    title: 'Crypto-Assets',
    description: 'Monitors and develops policy recommendations on crypto-asset activities and markets.',
    image: '/images/Crypto-assets-300x198.jpg',
  },
  {
    slug: 'ai',
    title: 'Artificial Intelligence',
    description: 'Assesses the financial stability implications of artificial intelligence in finance.',
    image: '/images/istock-1486727512-780x515.jpg',
  },
]

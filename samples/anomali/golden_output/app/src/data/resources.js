// Mock data faithful to a marketing Resource Center.
// `type` matches the filter pills exposed in the UI.

const R = (img) => `/assets/images/${img}`

const resources = [
  // Solution Briefs
  { id: 1, type: 'Solution Brief', title: 'Zero Trust with Anomali ThreatStream', desc: 'How operational threat intelligence powers a modern Zero Trust security architecture.', img: R('693c0be4e13dae0863355a1a_691f5b94d1e6fcc05869382a_Anomali-Web-Solution-Brief-Zero-Trust-01.jpeg') },
  { id: 2, type: 'Solution Brief', title: 'SIEM Optimization with Anomali', desc: 'Cut SIEM noise and cost while improving detection fidelity with curated intelligence.', img: R('693c0be5f00f1b40bfaec83d_691f786ce4704f395786af3b_Anomali-Web-Solution-Brief-Guide-SIEM-Optimization-01.jpeg') },
  { id: 3, type: 'Solution Brief', title: 'The Role of Security Analytics', desc: 'Why analytics-driven SOCs outperform their alert-driven peers — and how to make the leap.', img: R('68228a4fdbfec3b02c9c6bc8_Anomali_Solutions-Brief_The-Role-of-Security-Analytics_20240130-thumb.webp') },

  // White Papers
  { id: 4, type: 'White Paper', title: 'Real-Time Threat Detection', desc: 'A practitioner’s guide to building real-time, intelligence-driven detection at scale.', img: R('68228a4fdbfec3b02c9c6bca_Anomali_White-Paper_Real-time-Threat-Detection_20231129-thumb.webp') },
  { id: 5, type: 'White Paper', title: 'Economic Benefits of Intelligence-Driven Security', desc: 'Forrester-style analysis of ROI from operational threat intelligence programs.', img: R('68228a4fdbfec3b02c9c62de_Economic_Benefits_of_Intelligence_Driven_Security_Solutions_thumbnail.webp') },
  { id: 6, type: 'White Paper', title: 'Practical Implications of Threat Intelligence', desc: 'Where intelligence integrates into the SOC — from detection to forensics.', img: R('648e68084bfe0e87c1f00de8_datasheet-practical-implecations.jpeg') },

  // eBooks
  { id: 7, type: 'eBook', title: 'ESG: CTI Programs', desc: 'How leading organizations structure cyber threat intelligence teams for impact.', img: R('694451287bfe0285bed3dbeb_648e684a33d6b0ae464ff4c7_ESG-Anomali-eBook-CTI-Programs.jpeg') },
  { id: 8, type: 'eBook', title: 'Managing Threat Intelligence Playbook', desc: 'End-to-end playbook for collecting, curating, and operationalizing intelligence.', img: R('694451291eca8e22b9266cbf_648e682308ad43601f1a429d_Anomali-eBook_Managing_Threat_Intelligence_Playbook.jpeg') },
  { id: 9, type: 'eBook', title: 'Surviving the SIEM Storm', desc: 'A practitioner’s guide to taming SIEM costs without losing visibility.', img: R('69445129b4bf5f4861d02bc8_66c5f8e92bb1b96be91c49b2_Surviving%20the%20SIEM%20Storm%20-%20eBook%20Thumbnail.jpg') },
  { id: 10, type: 'eBook', title: 'Top 5 Use Cases for Intelligence', desc: 'Five outcomes every CTI program should deliver in year one.', img: R('6944512e6d6b4dcd3885413c_648e683308ad43601f1a5853_Top5-Use-Cases-Intelligence-eBook-Thumbnail.jpeg') },
  { id: 11, type: 'eBook', title: 'Anomali Cybersecurity Insights', desc: 'An annual research report on the state of operational threat intelligence.', img: R('6944512898f0a55b33d397ee_648e6837704e7b37f1d0d3b9_Anomali-Cybersecuirty-Insight-eBook.jpeg') },
  { id: 12, type: 'eBook', title: 'Cyber Fusion Centers', desc: 'Designing modern fusion centers that combine SOC, CTI and incident response.', img: R('694451289d4a5022f8e60956_648e682cacba1c568a25b688_Cyber-Fusion-Centers-eBook_open-graph.jpeg') },

  // Guides
  { id: 13, type: 'Guide', title: 'Insider Threats Use Case Guide', desc: 'Detect, investigate and respond to insider threats with Anomali.', img: R('6944512898249be83b691bdc_673bb536105827a5cceea289_Anomali-Social-Guide-Use-Case-Insider-Threats-01.jpg') },
  { id: 14, type: 'Guide', title: 'SOC Efficiency Guide', desc: 'How leading SOCs are reclaiming 60% of analyst time with the Anomali platform.', img: R('6944512fc8463837bedecfd0_671bf533d5b0e1bec05b1d02_Anomali-Social-Guide-SOC-Efficiency-Guide-01.jpg') },
  { id: 15, type: 'Guide', title: 'Anomali vs. Exabeam', desc: 'A buyer’s guide comparing modern SOC platforms across detection, data, and AI.', img: R('69445128e1b4207adfe74205_672fbe8a4440cf072b601f68_Anomali-Social-Guide-vs-Exabeam-02.jpg') },

  // Datasheets
  { id: 16, type: 'Datasheet', title: 'Anomali ThreatStream', desc: 'A technical overview of the Anomali ThreatStream Next-Gen intelligence platform.', img: R('648e67e3816e851e6543b652_datasheet-anomali.jpeg') },
  { id: 17, type: 'Datasheet', title: 'Anomali for Splunk', desc: 'Augment Splunk with curated, operational threat intelligence and richer detections.', img: R('68228a4fdbfec3b02c9c6c84_Four%20Benefits%20of%20Augmenting%20Splunk%20with%20Anomali%20-%20Thumbnail-p-800.jpg') },
  { id: 18, type: 'Datasheet', title: 'Anomali for QRadar', desc: 'Drive intelligence-led detection inside IBM QRadar with Anomali integration.', img: R('648e67f54bfe0e87c1f00ab4_datasheet-qradar.jpeg') },
  { id: 19, type: 'Datasheet', title: 'Anomali University', desc: 'Hands-on training paths for SOC analysts, threat hunters and intel teams.', img: R('648e67e02271db2b36853d7d_anomali-university-datasheet.jpeg') },
  { id: 20, type: 'Datasheet', title: 'Anomali for Palo Alto Networks', desc: 'Operationalize curated intelligence across NGFW, Cortex XDR and XSOAR.', img: R('648e67f8757b5e04c915c107_datasheet-paloalto-networks.jpeg') },
  { id: 21, type: 'Datasheet', title: 'Anomali for Microsoft Sentinel', desc: 'Stream threat intelligence directly into Microsoft Sentinel detections.', img: R('648e67ff0c70f80ad49384c0_datasheet-infoblox.jpeg') },

  // Product (overviews)
  { id: 22, type: 'Product', title: 'The Anomali Platform', desc: 'A 6-minute platform overview of the Anomali Agentic SOC Platform.', img: R('68228a4fdbfec3b02c9c6329_The_Anomali_Platform.webp') },
  { id: 23, type: 'Product', title: 'Anomali Overview', desc: 'How Anomali centralizes telemetry, intelligence and Agentic AI in one platform.', img: R('68228a4fdbfec3b02c9c6294_Anomali_Overview_Asite_thumbnail.webp') },
  { id: 24, type: 'Product', title: 'Anomali Enterprise', desc: 'A look inside Anomali Enterprise — built for the world’s largest SOCs.', img: R('68228a4fdbfec3b02c9c62e4_video-anomali-enterprise.webp') },

  // Use Cases
  { id: 25, type: 'Use Case', title: 'Threat Hunting with Historical Clarity', desc: 'How leading hunt teams use Anomali for years-deep retrospective hunts.', img: R('648e674d0c413ed1a444acfe_case-study-blackhawk-network.jpeg') },
  { id: 26, type: 'Use Case', title: 'Federal: Resilience Starts Here', desc: 'How a U.S. federal agency modernized its SOC with the Anomali platform.', img: R('648e67495c406545d419e199_casestudy-federal.jpeg') },
  { id: 27, type: 'Use Case', title: 'Banking on Intelligence-Led Defense', desc: 'A global bank cut MTTD by 90% with Anomali ThreatStream and Data Lake.', img: R('648e674c57e0e60c2bd117b7_casestudy-bank.jpeg') },

  // Videos
  { id: 28, type: 'Video', title: 'ThreatStream Explainer', desc: 'A short video tour of ThreatStream Next-Gen and operational intelligence.', img: R('68228a4fdbfec3b02c9c62e3_Anomali_ThreatStream_Explainer_Video.webp') },
  { id: 29, type: 'Video', title: 'Intro to Threat Intelligence', desc: 'What threat intelligence really is — and what it isn’t.', img: R('68228a4fdbfec3b02c9c628d_video-ti-intro.webp') },
  { id: 30, type: 'Video', title: 'Anomali Investigations', desc: 'A walkthrough of investigations across the Anomali platform.', img: R('68228a4fdbfec3b02c9c6298_video-investigations-update.webp') },
  { id: 31, type: 'Video', title: 'Anomali + Splunk', desc: 'See Anomali and Splunk in action together — better signal, less noise.', img: R('68228a4fdbfec3b02c9c6299_video-splunk.webp') },
  { id: 32, type: 'Video', title: 'Anomali Community', desc: 'A peek inside the Anomali user community and Trusted Circles.', img: R('68228a4fdbfec3b02c9c629f_video-anomali-community.webp') },
  { id: 33, type: 'Video', title: 'STIX/TAXII in Practice', desc: 'A hands-on intro to STIX/TAXII inside ThreatStream.', img: R('68228a4fdbfec3b02c9c629b_video-stix.webp') },

  // Webinars
  { id: 34, type: 'Webinar', title: 'CISO Fireside Chat', desc: 'Two CISOs discuss building intelligence-led security programs.', img: R('6944531d67b3cf3ac9282968_66ff0bfa8cb30a0684502db0_Anomali-Webinar-CISO-Fireside-Chat-Johnson-Bruns.jpg') },
  { id: 35, type: 'Webinar', title: 'Generative AI in Cybersecurity', desc: 'How generative AI is reshaping detection, investigation and response.', img: R('694950d227b1d2a782ba5fc2_65398aaf59b381a68151b34c_Generative-AI-Product-webinar-1600x900.jpeg') },
  { id: 36, type: 'Webinar', title: 'SANS: ChatGPT & AI in Cyber', desc: 'A SANS-hosted session on the realities of AI for security operations.', img: R('694950d2755192d7a32b15fc_6504c4a86fa19ce136f37c54_SANS-AI-Chat-GPT-webinar-1200x630.jpeg') },
  { id: 37, type: 'Webinar', title: 'SANS: Cyber Unseen Dangers', desc: 'Threats hiding in plain sight — and how to surface them.', img: R('694950d3a4cd8af0c36c4491_654c06e0601a010e636f7cc6_SANS-Cyber-Unseen-Dangers-webinar-1600x900.jpeg') },
  { id: 38, type: 'Webinar', title: 'SANS: Expanding Generative AI', desc: 'Generative AI’s expanding role in modern cybersecurity programs.', img: R('694950d3fe1df56e6526e657_654c062e9a8002a60ec825ef_SANS-Cyber-Expanding-Generative-AI-webinar-1600x900.jpeg') },
  { id: 39, type: 'Webinar', title: 'SANS Custom On-Demand', desc: 'A library of custom on-demand SANS sessions sponsored by Anomali.', img: R('694950d35cf5653533e3fbdd_658078370ae4a8f8b78850fb_SANS-Custom-on-demand-webinar-1600x900.jpeg') },
]

export default resources

export const FILTERS = ['All', 'White Paper', 'Datasheet', 'eBook', 'Guide', 'Product', 'Use Case', 'Video', 'Webinar', 'Solution Brief']

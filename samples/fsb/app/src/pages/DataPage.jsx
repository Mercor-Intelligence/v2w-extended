import Breadcrumb from '../components/Breadcrumb.jsx'

export default function DataPage() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Data' }]} />
      <div className="page-hero">
        <div className="container">
          <h1>Data</h1>
          <p>Datasets, indicators and statistical resources published by the FSB.</p>
        </div>
      </div>
      <main className="page">
        <div className="container content">
          <p>
            The FSB publishes a range of datasets and statistical resources to support analysis of
            financial stability vulnerabilities. These include the Global Monitoring Report on
            Non-Bank Financial Intermediation dataset, the G-SIB methodology indicators, and
            data underlying various peer reviews and progress reports.
          </p>
          <ul>
            <li>Global Monitoring Report on NBFI — historical dataset</li>
            <li>G-SIBs assessment indicators</li>
            <li>Implementation monitoring data</li>
            <li>Cross-border payments KPI tracking</li>
          </ul>
        </div>
      </main>
    </>
  )
}

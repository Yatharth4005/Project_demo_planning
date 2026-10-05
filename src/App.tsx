import { useRef, useState, type ReactNode } from "react";

type View = "overview" | "btr" | "campaigns" | "casting";

const Icon = ({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) => {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    upload: <><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M4 15v4a1 1 0 001 1h14a1 1 0 001-1v-4" /></>,
    layers: <><path d="M12 3L3 8l9 5 9-5-9-5z" /><path d="M3 12l9 5 9-5M3 16l9 5 9-5" /></>,
    furnace: <><path d="M7 21h10l1-13H6l1 13zM5 4h14M9 4V2m6 2V2" /><path d="M12 18c-2.5-1.2-2.5-3.3-.2-5.5.1 1.4 1 1.7 1.6 2.6.8 1.2.1 2.2-1.4 2.9z" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6v.2h-4V21a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 00.3-1.9A1.7 1.7 0 003 14H2.8v-4H3a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.6v-.2h4V3a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.6 1h.2v4H21a1.7 1.7 0 00-1.6 1z" /></>,
    chevron: <path d="M9 18l6-6-6-6" />,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    check: <path d="M5 12l4 4L19 6" />,
    bell: <><path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    file: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 13h6m-6 4h6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
    download: <><path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const Logo = ({ dark = false }: { dark?: boolean }) => (
  <div className="logo">
    <span className={dark ? "logo-mark dark" : "logo-mark"}><i /><i /><i /></span>
    <span><b>FORGE</b><small>SPM PLANNING</small></span>
  </div>
);

function Login({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <main className="login-shell">
      <section className="login-story">
        <div className="login-top"><Logo dark /></div>
        <div className="story-copy">
          <p className="eyebrow light">CAST BETTER. PLAN SMARTER.</p>
          <h1>Precision planning<br />for every <em>pour.</em></h1>
          <p>Transform demand into intelligent casting campaigns with one connected planning workspace.</p>
          <div className="story-stats">
            <div><strong>98.4%</strong><span>Planning accuracy</span></div>
            <div><strong>14%</strong><span>Average yield uplift</span></div>
            <div><strong>26h</strong><span>Saved per campaign</span></div>
          </div>
        </div>
        <div className="furnace-art" aria-hidden="true">
          <div className="art-line one" /><div className="art-line two" /><div className="art-line three" />
          <div className="art-block b1" /><div className="art-block b2" /><div className="art-block b3" />
        </div>
        <p className="story-foot">Built for Special Profile Mills worldwide</p>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <span className="secure-pill">SECURE ENTERPRISE ACCESS</span>
          <h2>Welcome back</h2>
          <p>Sign in to your planning workspace.</p>
          <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <label>WORK EMAIL</label>
            <input type="email" defaultValue="planner@arcelorworks.com" required />
            <div className="password-label"><label>PASSWORD</label><button type="button">Forgot password?</button></div>
            <div className="password-wrap">
              <input type={showPassword ? "text" : "password"} defaultValue="steelworks" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "HIDE" : "SHOW"}</button>
            </div>
            <label className="remember"><input type="checkbox" defaultChecked /><span>Keep me signed in on this device</span></label>
            <button className="primary-btn login-btn" type="submit">Sign in to workspace <Icon name="arrow" /></button>
          </form>
          <div className="help-line"><span /> Need access? <button>Contact your administrator</button><span /></div>
          <div className="security-note"><Icon name="check" size={15} /> Protected with enterprise-grade encryption</div>
        </div>
        <p className="login-legal">© 2025 Forge Planning Systems&nbsp;&nbsp;·&nbsp;&nbsp; Privacy &nbsp;·&nbsp;&nbsp; Terms</p>
      </section>
    </main>
  );
}

const nav = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "btr", label: "BTR Upload", icon: "upload" },
  { id: "campaigns", label: "Campaign Plans", icon: "layers" },
  { id: "casting", label: "Casting Plans", icon: "furnace" },
] as const;

function Sidebar({ view, setView, onLogout }: { view: View; setView: (v: View) => void; onLogout: () => void }) {
  return (
    <aside className="sidebar">
      <Logo />
      <p className="nav-heading">WORKSPACE</p>
      <nav>
        {nav.map((item) => (
          <button className={view === item.id ? "active" : ""} onClick={() => setView(item.id)} key={item.id}>
            <Icon name={item.icon} /><span>{item.label}</span>{item.id === "btr" && <i className="nav-dot" />}
          </button>
        ))}
      </nav>
      <p className="nav-heading master-heading">MASTER DATA</p>
      <nav>
        <button><Icon name="database" /><span>Rule Masters</span></button>
        <button><Icon name="settings" /><span>Settings</span></button>
      </nav>
      <div className="sidebar-status">
        <span className="status-icon"><Icon name="check" size={16} /></span>
        <div><b>All systems operational</b><small>Last synced 2m ago</small></div>
      </div>
      <button className="user-card" onClick={onLogout}>
        <span className="avatar">AK</span><span><b>Arjun Kumar</b><small>Senior Planner</small></span><Icon name="chevron" size={15} />
      </button>
    </aside>
  );
}

const recentPlans = [
  ["CP-2025-042", "Rail 60E1", "R260", "1,284 T", "In review"],
  ["CP-2025-041", "Channel UPN 200", "S355J2", "846 T", "Completed"],
  ["CP-2025-040", "Crane Rail A100", "R350HT", "612 T", "Completed"],
];

function Overview({ go }: { go: (v: View) => void }) {
  return (
    <>
      <header className="page-header">
        <div><p className="eyebrow">MONDAY, 26 MAY</p><h1>Good morning, Arjun.</h1><p>Here’s what’s happening across your mill today.</p></div>
        <button className="primary-btn" onClick={() => go("btr")}><Icon name="upload" /> Upload new BTR</button>
      </header>
      <section className="metrics">
        <article><span>OPEN DEMAND</span><strong>4,862 <small>T</small></strong><p><b>+8.2%</b> from last month</p><i className="metric-glyph"><Icon name="layers" /></i></article>
        <article><span>ACTIVE CAMPAIGNS</span><strong>06</strong><p>Across 3 rolling lines</p><i className="metric-glyph"><Icon name="furnace" /></i></article>
        <article><span>AVG. YIELD</span><strong>92.8<small>%</small></strong><p><b>+1.4%</b> above target</p><i className="metric-glyph"><Icon name="grid" /></i></article>
        <article><span>PENDING PLANS</span><strong>03</strong><p><em>Requires your review</em></p><i className="metric-glyph warn"><Icon name="file" /></i></article>
      </section>
      <section className="pipeline-card">
        <div className="section-title"><div><p className="eyebrow">PLANNING WORKFLOW</p><h2>From demand to casting floor</h2></div><span>Current cycle: <b>Week 22</b></span></div>
        <div className="pipeline">
          {[
            ["01", "Upload BTR", "Demand workbook", "btr"],
            ["02", "Select Material", "Section & grade", "campaigns"],
            ["03", "Build Campaign", "Batch sequencing", "campaigns"],
            ["04", "Casting Plan", "Billet optimization", "casting"],
          ].map((item, i) => (
            <div className="pipeline-step-wrap" key={item[0]}>
              <button className={`pipeline-step ${i === 0 ? "current" : ""}`} onClick={() => go(item[3] as View)}>
                <span>{i === 0 ? <Icon name="upload" /> : i === 1 ? <Icon name="layers" /> : i === 2 ? <Icon name="grid" /> : <Icon name="furnace" />}</span>
                <div><small>STEP {item[0]}</small><b>{item[1]}</b><p>{item[2]}</p></div>
                <Icon name="chevron" />
              </button>{i < 3 && <div className="pipe-line" />}
            </div>
          ))}
        </div>
      </section>
      <section className="lower-grid">
        <article className="table-card">
          <div className="section-title"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Latest casting plans</h2></div><button onClick={() => go("casting")}>View all <Icon name="arrow" size={15} /></button></div>
          <table><thead><tr><th>PLAN ID</th><th>SECTION</th><th>GRADE</th><th>TONNAGE</th><th>STATUS</th></tr></thead>
          <tbody>{recentPlans.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={cell}>{i === 0 ? <b>{cell}</b> : i === 4 ? <span className={`tag ${cell === "In review" ? "review" : ""}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table>
        </article>
        <article className="yield-card">
          <p className="eyebrow">YIELD PERFORMANCE</p><h2>Monthly average</h2>
          <div className="yield-chart"><div className="gauge"><span>92.8<small>%</small></span></div></div>
          <div className="yield-legend"><span><i /> Current yield <b>92.8%</b></span><span><i /> Target yield <b>91.5%</b></span></div>
          <p className="positive"><Icon name="arrow" size={15} /> Yield improved by 1.3% this cycle</p>
        </article>
      </section>
    </>
  );
}

function BTRUpload({ onDone }: { onDone: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const analyze = () => {
    if (!file) return;
    setProcessing(true);
    window.setTimeout(() => { setProcessing(false); onDone(); }, 900);
  };
  return (
    <section>
      <header className="page-header"><div><p className="eyebrow">WORKFLOW / STEP 01</p><h1>Upload BTR workbook</h1><p>Import the latest billet-to-rolling demand sheet for validation and processing.</p></div></header>
      <div className="content-panel upload-panel">
        <div className="upload-intro"><span><Icon name="file" size={24} /></span><div><h2>Demand workbook</h2><p>Upload an Excel workbook containing section, grade, order quantity, and delivery schedules.</p></div></div>
        <input ref={input} type="file" accept=".xlsx,.xls,.xlsm" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button className={`dropzone ${file ? "has-file" : ""}`} onClick={() => input.current?.click()}>
          <span className="drop-icon"><Icon name={file ? "check" : "upload"} size={25} /></span>
          <b>{file ? file.name : "Drop your BTR workbook here"}</b>
          <p>{file ? `${(file.size / 1024).toFixed(1)} KB · Ready for analysis` : "or click to browse from your computer"}</p>
          {!file && <small>XLSX, XLS or XLSM · Maximum 25 MB</small>}
        </button>
        <div className="validation-grid">
          <div><Icon name="check" /><span><b>Automatic validation</b><small>Checks columns, formats and missing data</small></span></div>
          <div><Icon name="layers" /><span><b>Rule master matching</b><small>Maps sections, grades and LFA rules</small></span></div>
          <div><Icon name="database" /><span><b>Secure processing</b><small>Workbook remains within your workspace</small></span></div>
        </div>
        <div className="panel-actions"><button className="secondary-btn" onClick={() => setFile(null)}>Clear</button><button className="primary-btn" disabled={!file || processing} onClick={analyze}>{processing ? "Analyzing workbook…" : "Validate & continue"} <Icon name="arrow" /></button></div>
      </div>
    </section>
  );
}

function Campaigns({ onDone }: { onDone: () => void }) {
  const [material, setMaterial] = useState("Rail 60E1 · R260");
  return (
    <section>
      <header className="page-header"><div><p className="eyebrow">WORKFLOW / STEPS 02–03</p><h1>Campaign planning</h1><p>Select planning material and create an optimized rolling campaign.</p></div><span className="source-chip"><Icon name="check" size={14} /> BTR validated · 186 orders</span></header>
      <div className="content-panel campaign-layout">
        <div className="form-column">
          <p className="eyebrow">PLANNING MATERIAL</p><h2>Choose a section & grade</h2>
          <label>SECTION / STEEL GRADE</label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)}><option>Rail 60E1 · R260</option><option>Channel UPN 200 · S355J2</option><option>Crane Rail A100 · R350HT</option></select>
          <div className="material-summary">
            <div><small>DEMAND</small><b>1,284 T</b></div><div><small>ORDERS</small><b>42</b></div><div><small>DELIVERY WINDOW</small><b>03–18 Jun</b></div>
          </div>
          <label>CAMPAIGN STRATEGY</label>
          <div className="radio-row"><button className="selected"><i /><span><b>Yield optimized</b><small>Minimize crop & transition loss</small></span></button><button><i /><span><b>Delivery priority</b><small>Sequence by due date</small></span></button></div>
          <button className="primary-btn generate-btn" onClick={onDone}>Generate campaign plan <Icon name="arrow" /></button>
        </div>
        <div className="rule-preview"><p className="eyebrow">MATCHED RULES</p><h3>{material.split(" · ")[0]}</h3>
          {[["LFA batch","128 T"],["Billet length","11.8 m"],["Max. heats / batch","08"],["Target yield","93.2%"],["Grade sequence","R260 → R350HT"]].map(x => <div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}
          <p className="rule-note"><Icon name="check" size={15} /> Rule master version 4.8 applied</p>
        </div>
      </div>
    </section>
  );
}

function Casting() {
  const [exported, setExported] = useState(false);
  return (
    <section>
      <header className="page-header"><div><p className="eyebrow">WORKFLOW / STEP 04</p><h1>Casting plan</h1><p>Review optimized heat sequencing, billet allocation, and expected yield.</p></div><button className="primary-btn" onClick={() => setExported(true)}><Icon name="download" /> {exported ? "Workbook ready" : "Export rolling plan"}</button></header>
      <div className="plan-banner"><div><span>CP</span><div><small>PLAN ID</small><h2>CP-2025-043</h2></div></div><div><small>CAMPAIGN</small><b>Rail 60E1 / R260</b></div><div><small>TOTAL CAST</small><b>1,378 T</b></div><div><small>EXPECTED YIELD</small><b className="green">93.2%</b></div><span className="tag review">Draft</span></div>
      <article className="table-card cast-table"><div className="section-title"><div><p className="eyebrow">HEAT SEQUENCE</p><h2>Billet allocation plan</h2></div><button><Icon name="search" /> Filter</button></div>
        <table><thead><tr><th>SEQUENCE</th><th>HEAT / BATCH</th><th>GRADE</th><th>BILLETS</th><th>CAST WEIGHT</th><th>ORDER LOAD</th><th>YIELD</th></tr></thead>
          <tbody>{[
            ["01","LFA-22051","R260","96","126.8 T","118.2 T","93.2%"],
            ["02","LFA-22052","R260","96","126.8 T","118.5 T","93.5%"],
            ["03","LFA-22053","R260","92","121.5 T","113.1 T","93.1%"],
            ["04","LFA-22054","R260","96","126.8 T","118.0 T","93.1%"],
            ["05","LFA-22055","R260","94","124.1 T","115.9 T","93.4%"],
          ].map(r => <tr key={r[0]}>{r.map((c,i)=><td key={i}>{i===0?<span className="sequence">{c}</span>:i===1||i===6?<b className={i===6?"green":""}>{c}</b>:c}</td>)}</tr>)}</tbody>
        </table>
      </article>
    </section>
  );
}

function Portal({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>("overview");
  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} onLogout={onLogout} />
      <main className="main-area">
        <div className="topbar"><div><span className="plant-dot" /> Jamshedpur SPM <Icon name="chevron" size={13} /></div><div><button aria-label="Notifications"><Icon name="bell" /></button><span className="top-divider" /><small>FY 2025–26</small></div></div>
        <div className="page-content">
          {view === "overview" && <Overview go={setView} />}
          {view === "btr" && <BTRUpload onDone={() => setView("campaigns")} />}
          {view === "campaigns" && <Campaigns onDone={() => setView("casting")} />}
          {view === "casting" && <Casting />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn ? <Portal onLogout={() => setLoggedIn(false)} /> : <Login onLogin={() => setLoggedIn(true)} />;
}

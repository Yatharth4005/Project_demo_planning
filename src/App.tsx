import { useState, useEffect, useTransition, type ReactNode } from "react";

type Tab = "synoptic" | "telemetry" | "furnace" | "caster" | "alarms" | "tags" | "reports";

interface StandData {
  id: string;
  name: string;
  type: "roughing" | "intermediate" | "finishing";
  rpm: number;
  loadPercent: number;
  torqueKnm: number;
  rollTempC: number;
  vibMmS: number;
  hydraulicBar: number;
  rollGapMm: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
  historyRpm: number[];
  historyLoad: number[];
}

interface AlarmItem {
  id: string;
  timestamp: string;
  tag: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  message: string;
  location: string;
  acknowledged: boolean;
}

interface PLCTag {
  address: string;
  name: string;
  type: "REAL" | "DINT" | "BOOL" | "WORD";
  value: string | number;
  unit: string;
  quality: "GOOD" | "BAD" | "UNCERTAIN";
  scanMs: number;
}

export interface CustomMeasure {
  id: string;
  name: string;
  value: number;
  unit: string;
  target?: string;
  plcAddress: string;
}

export interface CustomMachine {
  id: string;
  name: string;
  type: "sensor" | "stand" | "furnace" | "shear" | "cooling" | "inspection" | "custom";
  position: "pre-furnace" | "after-roughing" | "after-intermediate" | "after-finishing" | "post-shear";
  status: "NORMAL" | "WARNING" | "CRITICAL";
  iconName?: string;
  measures: CustomMeasure[];
  notes?: string;
}

const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    activity: <polyline points="22 12 18 12 14 20 10 4 6 12 2 12" />,
    furnace: (
      <>
        <path d="M7 21h10l1-13H6l1 13zM5 4h14M9 4V2m6 2V2" />
        <path d="M12 18c-2.5-1.2-2.5-3.3-.2-5.5.1 1.4 1 1.7 1.6 2.6.8 1.2.1 2.2-1.4 2.9z" />
      </>
    ),
    droplet: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
    alert: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </>
    ),
    play: <polygon points="5 3 19 12 5 21 5 3" />,
    pause: (
      <>
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </>
    ),
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    check: <polyline points="20 6 9 17 4 12" />,
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
    cpu: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="15" x2="4" y2="15" />
      </>
    ),
    gauge: (
      <>
        <path d="M12 14v-4" />
        <path d="M4.93 4.93A10 10 0 1 1 19.07 19.07 10 10 0 0 1 4.93 4.93z" />
      </>
    ),
    fileText: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </>
    ),
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>
    ),
    printer: (
      <>
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </>
    ),
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
    trash: (
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>
    ),
    edit: (
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </>
    ),
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
    layers: (
      <>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </>
    ),
    sliders: (
      <>
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

const Logo = () => (
  <div className="scada-logo">
    <div className="scada-logo-mark">
      <span />
      <span />
      <span />
    </div>
    <div className="scada-logo-text">
      <b>SPM SCADA CORE</b>
      <small>PLC REAL-TIME TELEMETRY</small>
    </div>
  </div>
);

// Pre-seeded Initial Custom Machines
const initialCustomMachines: CustomMachine[] = [
  {
    id: "MCH-01",
    name: "Laser Dimension Profile Scanner",
    type: "inspection",
    position: "after-finishing",
    status: "NORMAL",
    iconName: "search",
    measures: [
      { id: "M1", name: "Profile Width", value: 150.2, unit: "mm", target: "150.0 ± 0.5", plcAddress: "DB300.DBD0" },
      { id: "M2", name: "Profile Height", value: 150.1, unit: "mm", target: "150.0 ± 0.5", plcAddress: "DB300.DBD4" },
      { id: "M3", name: "Surface Temp", value: 895, unit: "°C", target: "880 - 920", plcAddress: "DB300.DBD8" },
    ],
    notes: "High-resolution optical laser profile gauge for rail/beam dimension compliance.",
  },
  {
    id: "MCH-02",
    name: "High-Pressure Water Descaler",
    type: "cooling",
    position: "after-roughing",
    status: "NORMAL",
    iconName: "droplet",
    measures: [
      { id: "M4", name: "Header Pressure", value: 185, unit: "Bar", target: "180 - 200", plcAddress: "DB301.DBD0" },
      { id: "M5", name: "Water Flow Rate", value: 1240, unit: "L/min", target: "1200 - 1300", plcAddress: "DB301.DBD4" },
    ],
    notes: "Removes scale build-up between Roughing and Intermediate mill sections.",
  },
];

// Initial Stands Setup
const initialStands: StandData[] = [
  { id: "R1", name: "Roughing Stand 1", type: "roughing", rpm: 215, loadPercent: 78, torqueKnm: 420, rollTempC: 642, vibMmS: 1.8, hydraulicBar: 185, rollGapMm: 42.5, status: "NORMAL", historyRpm: [210, 212, 215, 214, 216, 215], historyLoad: [76, 77, 78, 79, 78, 78] },
  { id: "R2", name: "Roughing Stand 2", type: "roughing", rpm: 284, loadPercent: 82, torqueKnm: 395, rollTempC: 658, vibMmS: 2.1, hydraulicBar: 188, rollGapMm: 34.0, status: "NORMAL", historyRpm: [280, 282, 284, 283, 285, 284], historyLoad: [80, 81, 82, 83, 82, 82] },
  { id: "I1", name: "Intermediate Stand 1", type: "intermediate", rpm: 452, loadPercent: 74, torqueKnm: 285, rollTempC: 682, vibMmS: 1.4, hydraulicBar: 192, rollGapMm: 24.8, status: "NORMAL", historyRpm: [448, 450, 452, 451, 453, 452], historyLoad: [73, 74, 74, 75, 74, 74] },
  { id: "I2", name: "Intermediate Stand 2", type: "intermediate", rpm: 530, loadPercent: 76, torqueKnm: 260, rollTempC: 690, vibMmS: 1.5, hydraulicBar: 190, rollGapMm: 20.2, status: "NORMAL", historyRpm: [526, 528, 530, 529, 531, 530], historyLoad: [74, 75, 76, 77, 76, 76] },
  { id: "I3", name: "Intermediate Stand 3", type: "intermediate", rpm: 615, loadPercent: 79, torqueKnm: 240, rollTempC: 698, vibMmS: 1.6, hydraulicBar: 189, rollGapMm: 16.5, status: "NORMAL", historyRpm: [610, 612, 615, 614, 616, 615], historyLoad: [77, 78, 79, 80, 79, 79] },
  { id: "I4", name: "Intermediate Stand 4", type: "intermediate", rpm: 710, loadPercent: 81, torqueKnm: 220, rollTempC: 705, vibMmS: 1.7, hydraulicBar: 172, rollGapMm: 12.8, status: "WARNING", historyRpm: [705, 708, 710, 709, 712, 710], historyLoad: [79, 80, 81, 82, 81, 81] },
  { id: "F1", name: "Universal Finishing 1", type: "finishing", rpm: 895, loadPercent: 88, torqueKnm: 195, rollTempC: 712, vibMmS: 1.2, hydraulicBar: 195, rollGapMm: 9.4, status: "NORMAL", historyRpm: [890, 892, 895, 894, 896, 895], historyLoad: [86, 87, 88, 89, 88, 88] },
  { id: "F2", name: "Edging Finishing 2", type: "finishing", rpm: 960, loadPercent: 86, torqueKnm: 175, rollTempC: 718, vibMmS: 1.1, hydraulicBar: 194, rollGapMm: 6.8, status: "NORMAL", historyRpm: [955, 958, 960, 959, 961, 960], historyLoad: [84, 85, 86, 87, 86, 86] },
];

const initialAlarms: AlarmItem[] = [
  { id: "ALM-902", timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), tag: "SPM_PLC_01.Stand_I4.HydraulicBar", severity: "WARNING", message: "Stand I4 Hydraulic pressure dropped below nominal setpoint (172 Bar vs 190 Bar target)", location: "Intermediate Stand 4", acknowledged: false },
  { id: "ALM-899", timestamp: new Date(Date.now() - 600000).toLocaleTimeString(), tag: "SPM_PLC_01.Furnace.Zone2_Temp", severity: "INFO", message: "Reheating Furnace Zone 2 steady-state thermal lock achieved at 1241°C", location: "Reheating Furnace", acknowledged: true },
  { id: "ALM-895", timestamp: new Date(Date.now() - 1500000).toLocaleTimeString(), tag: "SPM_PLC_01.Caster.TundishTemp", severity: "INFO", message: "Strand 1 Tundish argon purging pressure auto-calibrated", location: "Continuous Caster", acknowledged: true },
];

export default function App() {
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("synoptic");
  const [isLive, setIsLive] = useState(true);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(800);

  // Telemetry state
  const [stands, setStands] = useState<StandData[]>(initialStands);
  const [alarms, setAlarms] = useState<AlarmItem[]>(initialAlarms);
  const [millSpeed, setMillSpeed] = useState(14.2);
  const [shiftTonnage, setShiftTonnage] = useState(542.8);
  const [powerKwh, setPowerKwh] = useState(182.4);
  const [oee, setOee] = useState({ overall: 94.6, availability: 97.2, performance: 98.1, quality: 99.3 });
  
  // Furnace Telemetry
  const [furnace, setFurnace] = useState({
    zone1: 1184,
    zone2: 1241,
    zone3: 1258,
    billetCount: 42,
    gasPressure: 48.5,
    airFuelRatio: 1.08,
    pusherCycles: 1840,
  });

  // Continuous Caster Telemetry
  const [caster, setCaster] = useState({
    tundishTemp: 1542,
    castingSpeed: 1.45,
    moldOscillationHz: 2.8,
    waterFlowLmin: 1420,
    strand1Status: "CASTING",
    strand2Status: "CASTING",
    steelGrade: "R260 / Rail 60E1",
    ladleHeatNumber: "LFA-22058",
  });

  // Selected stand for popup diagnostic
  const [selectedStand, setSelectedStand] = useState<StandData | null>(null);
  const [tagSearch, setTagSearch] = useState("");

  // Custom Machine & Instrument Management State
  const [customMachines, setCustomMachines] = useState<CustomMachine[]>(initialCustomMachines);
  const [selectedCustomMachine, setSelectedCustomMachine] = useState<CustomMachine | null>(null);

  // Machine Builder Modal State
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [formMachineName, setFormMachineName] = useState("");
  const [formMachineType, setFormMachineType] = useState<CustomMachine["type"]>("sensor");
  const [formMachinePosition, setFormMachinePosition] = useState<CustomMachine["position"]>("after-finishing");
  const [formIconName, setFormIconName] = useState("gauge");
  const [formMeasures, setFormMeasures] = useState<CustomMeasure[]>([]);
  const [formNotes, setFormNotes] = useState("");

  // Open Add Machine Modal
  const handleOpenAddMachine = (defaultPos?: CustomMachine["position"]) => {
    setEditingMachineId(null);
    setFormMachineName("");
    setFormMachineType("sensor");
    setFormMachinePosition(defaultPos || "after-finishing");
    setFormIconName("gauge");
    setFormNotes("");
    setFormMeasures([
      { id: `M-${Date.now()}-1`, name: "Line Speed", value: 14.5, unit: "m/s", target: "14.0 - 15.0", plcAddress: "DB305.DBD0" },
      { id: `M-${Date.now()}-2`, name: "Surface Temp", value: 650, unit: "°C", target: "620 - 680", plcAddress: "DB305.DBD4" },
    ]);
    setIsMachineModalOpen(true);
  };

  // Open Edit Machine Modal
  const handleOpenEditMachine = (m: CustomMachine) => {
    setEditingMachineId(m.id);
    setFormMachineName(m.name);
    setFormMachineType(m.type);
    setFormMachinePosition(m.position);
    setFormIconName(m.iconName || "gauge");
    setFormNotes(m.notes || "");
    setFormMeasures(m.measures);
    setIsMachineModalOpen(true);
  };

  const handleAddMeasureRow = () => {
    const nextIdx = formMeasures.length + 1;
    setFormMeasures((prev) => [
      ...prev,
      {
        id: `M-${Date.now()}-${nextIdx}`,
        name: `Sensor Parameter ${nextIdx}`,
        value: 100,
        unit: "Bar",
        target: "Optimal",
        plcAddress: `DB30${nextIdx + 5}.DBD0`,
      },
    ]);
  };

  const handleRemoveMeasureRow = (index: number) => {
    setFormMeasures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMeasureRow = (index: number, field: keyof CustomMeasure, val: any) => {
    setFormMeasures((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: val } : m))
    );
  };

  const handleSaveMachine = () => {
    if (!formMachineName.trim()) return;

    if (editingMachineId) {
      setCustomMachines((prev) =>
        prev.map((m) =>
          m.id === editingMachineId
            ? {
                ...m,
                name: formMachineName,
                type: formMachineType,
                position: formMachinePosition,
                iconName: formIconName,
                measures: formMeasures,
                notes: formNotes,
              }
            : m
        )
      );
    } else {
      const newMachine: CustomMachine = {
        id: `MCH-${Math.floor(100 + Math.random() * 900)}`,
        name: formMachineName,
        type: formMachineType,
        position: formMachinePosition,
        status: "NORMAL",
        iconName: formIconName,
        measures: formMeasures,
        notes: formNotes,
      };
      setCustomMachines((prev) => [...prev, newMachine]);
    }
    setIsMachineModalOpen(false);
  };

  const handleDeleteMachine = (id: string) => {
    setCustomMachines((prev) => prev.filter((m) => m.id !== id));
    if (selectedCustomMachine?.id === id) {
      setSelectedCustomMachine(null);
    }
  };

  // Report Generator State
  const [reportType, setReportType] = useState("oee_shift");
  const [reportShift, setReportShift] = useState("shift_a");
  const [reportSection, setReportSection] = useState("all");
  const [generatedReport, setGeneratedReport] = useState<{
    id: string;
    title: string;
    date: string;
    shiftName: string;
    totalTonnage: number;
    avgSpeed: number;
    oee: number;
    power: number;
    alarmsLogged: number;
  } | null>(null);

  // Live simulation tick effect
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      startTransition(() => {
        // Update Mill speed & Tonnage
        setMillSpeed((prev) => parseFloat((14.2 + (Math.random() * 0.4 - 0.2)).toFixed(2)));
        setShiftTonnage((prev) => parseFloat((prev + 0.05).toFixed(2)));
        setPowerKwh((prev) => parseFloat((182.4 + (Math.random() * 2 - 1)).toFixed(1)));
        setOee((prev) => ({ ...prev, overall: parseFloat((94.6 + (Math.random() * 0.4 - 0.2)).toFixed(1)) }));

        // Update Furnace
        setFurnace((prev) => ({
          ...prev,
          zone1: Math.round(1184 + (Math.random() * 4 - 2)),
          zone2: Math.round(1241 + (Math.random() * 4 - 2)),
          zone3: Math.round(1258 + (Math.random() * 4 - 2)),
          gasPressure: parseFloat((48.5 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        }));

        // Update Caster
        setCaster((prev) => ({
          ...prev,
          tundishTemp: Math.round(1542 + (Math.random() * 3 - 1.5)),
          castingSpeed: parseFloat((1.45 + (Math.random() * 0.02 - 0.01)).toFixed(2)),
          waterFlowLmin: Math.round(1420 + (Math.random() * 10 - 5)),
        }));

        // Update Custom Machines Telemetry
        setCustomMachines((prev) =>
          prev.map((m) => ({
            ...m,
            measures: m.measures.map((meas) => {
              const delta = (Math.random() * 0.4 - 0.2);
              const val = typeof meas.value === "number" ? meas.value : parseFloat(meas.value as any) || 0;
              const updatedVal = parseFloat(
                (val + (val > 100 ? delta * 5 : delta)).toFixed(val > 50 ? 1 : 2)
              );
              return { ...meas, value: Math.max(0, updatedVal) };
            }),
          }))
        );

        // Update Stands
        setStands((prevStands) =>
          prevStands.map((s) => {
            const rpmDelta = (Math.random() * 4 - 2);
            const newRpm = Math.round(s.rpm + rpmDelta);
            const newLoad = Math.min(99, Math.max(50, Math.round(s.loadPercent + (Math.random() * 2 - 1))));
            const newHistoryRpm = [...s.historyRpm.slice(1), newRpm];
            const newHistoryLoad = [...s.historyLoad.slice(1), newLoad];
            const newTemp = Math.round(s.rollTempC + (Math.random() * 2 - 1));
            const newVib = parseFloat((s.vibMmS + (Math.random() * 0.1 - 0.05)).toFixed(2));
            
            return {
              ...s,
              rpm: newRpm,
              loadPercent: newLoad,
              rollTempC: newTemp,
              vibMmS: newVib,
              historyRpm: newHistoryRpm,
              historyLoad: newHistoryLoad,
            };
          })
        );
      });
    }, refreshIntervalMs);

    return () => clearInterval(timer);
  }, [isLive, refreshIntervalMs]);

  // Simulation Triggers
  const handleTriggerAlarm = () => {
    const newAlarm: AlarmItem = {
      id: `ALM-${Math.floor(800 + Math.random() * 200)}`,
      timestamp: new Date().toLocaleTimeString(),
      tag: "SPM_PLC_01.Stand_R1.MotorVibration",
      severity: "CRITICAL",
      message: "Stand R1 Bearings Vibration spike (> 4.8 mm/s peak alert threshold)",
      location: "Roughing Stand 1",
      acknowledged: false,
    };
    setAlarms((prev) => [newAlarm, ...prev]);

    setStands((prev) =>
      prev.map((s) => (s.id === "R1" ? { ...s, vibMmS: 4.85, status: "CRITICAL" } : s))
    );
  };

  const handleSimulateLoadSurge = () => {
    setStands((prev) =>
      prev.map((s) => ({
        ...s,
        loadPercent: Math.min(98, s.loadPercent + 12),
        torqueKnm: Math.round(s.torqueKnm * 1.12),
      }))
    );
  };

  const handleAckAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleAckAllAlarms = () => {
    setAlarms((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    setStands((prev) => prev.map((s) => ({ ...s, status: "NORMAL", vibMmS: 1.8 })));
  };

  const unackCount = alarms.filter((a) => !a.acknowledged).length;

  // Report Generation Handler
  const handleGenerateReport = () => {
    const titles: Record<string, string> = {
      oee_shift: "SPM Shift Performance & OEE Audit Report",
      stand_diag: "Mill Stands Vibration & Sensor Diagnostic Report",
      furnace_log: "Reheating Furnace Thermal Compliance Log",
      alarms_log: "SCADA Plant Alarms & Emergency Events Audit",
      quality_audit: "Laser Dimensional Profile Quality Audit",
    };

    const shiftNames: Record<string, string> = {
      shift_a: "Shift A (06:00 - 14:00)",
      shift_b: "Shift B (14:00 - 22:00)",
      shift_c: "Shift C (22:00 - 06:00)",
      full_day: "24-Hour Production Cycle",
    };

    setGeneratedReport({
      id: `REP-SPM-${Math.floor(100000 + Math.random() * 900000)}`,
      title: titles[reportType] || "SPM SCADA Plant Report",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      shiftName: shiftNames[reportShift] || "Current Shift",
      totalTonnage: shiftTonnage,
      avgSpeed: millSpeed,
      oee: oee.overall,
      power: powerKwh,
      alarmsLogged: alarms.length,
    });
  };

  // Export CSV Handler
  const handleDownloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Timestamp,Stand_ID,Stand_Name,Speed_RPM,Load_Percent,Roll_Temp_C,Vibration_mm_s,Status\n" +
      stands
        .map(
          (s) =>
            `${new Date().toISOString()},${s.id},${s.name},${s.rpm},${s.loadPercent},${s.rollTempC},${s.vibMmS},${s.status}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SPM_SCADA_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  // PLC Tags compilation (Includes all dynamically added Machine Measures!)
  const plcTagsList: PLCTag[] = [
    { address: "DB100.DBD0", name: "SPM_LineSpeed_m_s", type: "REAL", value: millSpeed, unit: "m/s", quality: "GOOD", scanMs: 50 },
    { address: "DB100.DBD4", name: "SPM_ShiftTonnage_Total", type: "REAL", value: shiftTonnage, unit: "T", quality: "GOOD", scanMs: 100 },
    { address: "DB100.DBD8", name: "SPM_Power_Specific_KWh", type: "REAL", value: powerKwh, unit: "kWh/T", quality: "GOOD", scanMs: 500 },
    { address: "DB101.DBD0", name: "Furnace_Zone1_Temp_Act", type: "REAL", value: furnace.zone1, unit: "°C", quality: "GOOD", scanMs: 200 },
    { address: "DB101.DBD4", name: "Furnace_Zone2_Temp_Act", type: "REAL", value: furnace.zone2, unit: "°C", quality: "GOOD", scanMs: 200 },
    { address: "DB101.DBD8", name: "Furnace_Zone3_Temp_Act", type: "REAL", value: furnace.zone3, unit: "°C", quality: "GOOD", scanMs: 200 },
    { address: "DB101.DBW12", name: "Furnace_Billet_Count", type: "DINT", value: furnace.billetCount, unit: "pcs", quality: "GOOD", scanMs: 1000 },
    { address: "DB102.DBD0", name: "Caster_Tundish_Temp", type: "REAL", value: caster.tundishTemp, unit: "°C", quality: "GOOD", scanMs: 100 },
    { address: "DB102.DBD4", name: "Caster_Strand1_Speed", type: "REAL", value: caster.castingSpeed, unit: "m/min", quality: "GOOD", scanMs: 100 },
    { address: "DB102.DBX8.0", name: "Caster_Strand1_Run", type: "BOOL", value: "TRUE", unit: "-", quality: "GOOD", scanMs: 50 },
    ...stands.map((s) => ({
      address: `DB200.DBD${stands.indexOf(s) * 32}`,
      name: `Stand_${s.id}_Speed_RPM`,
      type: "REAL" as const,
      value: s.rpm,
      unit: "RPM",
      quality: "GOOD" as const,
      scanMs: 50,
    })),
    ...stands.map((s) => ({
      address: `DB200.DBD${stands.indexOf(s) * 32 + 4}`,
      name: `Stand_${s.id}_Motor_Load`,
      type: "REAL" as const,
      value: `${s.loadPercent}%`,
      unit: "%",
      quality: (s.status === "CRITICAL" ? "BAD" : "GOOD") as const,
      scanMs: 50,
    })),
    ...stands.map((s) => ({
      address: `DB200.DBD${stands.indexOf(s) * 32 + 8}`,
      name: `Stand_${s.id}_Roll_Temp`,
      type: "REAL" as const,
      value: s.rollTempC,
      unit: "°C",
      quality: "GOOD" as const,
      scanMs: 200,
    })),
    ...customMachines.flatMap((m) =>
      m.measures.map((meas) => ({
        address: meas.plcAddress || `DB300.DBD0`,
        name: `${m.name.replace(/\s+/g, "_")}.${meas.name.replace(/\s+/g, "_")}`,
        type: "REAL" as const,
        value: meas.value,
        unit: meas.unit,
        quality: "GOOD" as const,
        scanMs: 100,
      }))
    ),
  ];

  const filteredTags = plcTagsList.filter(
    (t) =>
      t.name.toLowerCase().includes(tagSearch.toLowerCase()) ||
      t.address.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="scada-root">
      {/* SCADA Top Navigation Bar */}
      <header className="scada-topbar">
        <div className="scada-topbar-left">
          <Logo />
          <div className="scada-plc-badge">
            <span className={`scada-live-dot ${isLive ? "live" : "paused"}`} />
            <div>
              <strong>OPC UA SERVER: ONLINE</strong>
              <small>Siemens S7-1500 PLC (192.168.1.10) · 12ms Latency</small>
            </div>
          </div>
        </div>

        {/* Live Simulation Controls */}
        <div className="scada-topbar-right">
          <div className="scada-speed-selector">
            <small>REFRESH RATE</small>
            <select
              value={refreshIntervalMs}
              onChange={(e) => setRefreshIntervalMs(Number(e.target.value))}
            >
              <option value={300}>300ms (High Speed)</option>
              <option value={800}>800ms (Normal)</option>
              <option value={2000}>2.0s (Slow)</option>
            </select>
          </div>

          <button
            className={`scada-btn ${isLive ? "btn-warn" : "btn-live"}`}
            onClick={() => setIsLive(!isLive)}
          >
            <Icon name={isLive ? "pause" : "play"} size={14} />
            {isLive ? "PAUSE STREAM" : "RESUME LIVE"}
          </button>

          <button className="scada-btn btn-sim" onClick={handleSimulateLoadSurge}>
            <Icon name="zap" size={14} /> SURGE LOAD
          </button>

          <button className="scada-btn btn-danger" onClick={handleTriggerAlarm}>
            <Icon name="alert" size={14} /> TRIGGER ALARM
          </button>

          {unackCount > 0 && (
            <button className="scada-btn btn-ack" onClick={handleAckAllAlarms}>
              <Icon name="check" size={14} /> ACK ALARMS ({unackCount})
            </button>
          )}
        </div>
      </header>

      {/* Global Plant Telemetry Summary Header */}
      <section className="scada-kpi-bar">
        <div className="scada-kpi-card">
          <div className="kpi-icon">
            <Icon name="gauge" size={20} />
          </div>
          <div>
            <small>MILL LINE SPEED</small>
            <strong>
              {millSpeed} <small>m/s</small>
            </strong>
            <p className="kpi-tag green">Target: 14.5 m/s</p>
          </div>
        </div>

        <div className="scada-kpi-card">
          <div className="kpi-icon orange">
            <Icon name="activity" size={20} />
          </div>
          <div>
            <small>SHIFT TONNAGE</small>
            <strong>
              {shiftTonnage} <small>TONS</small>
            </strong>
            <p className="kpi-tag">Target: 650.0 T</p>
          </div>
        </div>

        <div className="scada-kpi-card">
          <div className="kpi-icon cyan">
            <Icon name="cpu" size={20} />
          </div>
          <div>
            <small>OVERALL OEE</small>
            <strong>
              {oee.overall}
              <small>%</small>
            </strong>
            <p className="kpi-tag green">Avail: 97% | Perf: 98%</p>
          </div>
        </div>

        <div className="scada-kpi-card">
          <div className="kpi-icon purple">
            <Icon name="zap" size={20} />
          </div>
          <div>
            <small>SPECIFIC POWER</small>
            <strong>
              {powerKwh} <small>kWh/T</small>
            </strong>
            <p className="kpi-tag">Optimal range: 175-185</p>
          </div>
        </div>

        <div className="scada-kpi-card">
          <div className={`kpi-icon ${unackCount > 0 ? "red-pulse" : "green"}`}>
            <Icon name="bell" size={20} />
          </div>
          <div>
            <small>ACTIVE ALARMS</small>
            <strong className={unackCount > 0 ? "text-red" : "text-green"}>
              {unackCount} <small>UNACK</small>
            </strong>
            <p className="kpi-tag">{alarms.length} total logged</p>
          </div>
        </div>
      </section>

      {/* Main Tab Navigation */}
      <nav className="scada-tabs">
        <button
          className={tab === "synoptic" ? "active" : ""}
          onClick={() => setTab("synoptic")}
        >
          <Icon name="grid" size={16} /> PLANT SYNOPTIC SCADA
        </button>
        <button
          className={tab === "telemetry" ? "active" : ""}
          onClick={() => setTab("telemetry")}
        >
          <Icon name="activity" size={16} /> MILL STANDS MATRIX
        </button>
        <button
          className={tab === "furnace" ? "active" : ""}
          onClick={() => setTab("furnace")}
        >
          <Icon name="furnace" size={16} /> REHEATING FURNACE
        </button>
        <button
          className={tab === "caster" ? "active" : ""}
          onClick={() => setTab("caster")}
        >
          <Icon name="droplet" size={16} /> LIQUID METAL & CASTER
        </button>
        <button
          className={tab === "alarms" ? "active" : ""}
          onClick={() => setTab("alarms")}
        >
          <Icon name="alert" size={16} /> ALARM & EVENT STREAM
          {unackCount > 0 && <span className="tab-badge">{unackCount}</span>}
        </button>
        <button
          className={tab === "tags" ? "active" : ""}
          onClick={() => setTab("tags")}
        >
          <Icon name="database" size={16} /> PLC TAG INSPECTOR
        </button>
        <button
          className={tab === "reports" ? "active" : ""}
          onClick={() => setTab("reports")}
        >
          <Icon name="fileText" size={16} /> SCADA REPORTS
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="scada-content">
        {/* TAB 1: PLANT SYNOPTIC SCHEMATIC */}
        {tab === "synoptic" && (
          <section className="synoptic-section">
            <div className="synoptic-header">
              <div>
                <h2>SPM Rolling Mill Line Synoptic Schematic</h2>
                <p>
                  Interactive real-time process monitoring from Billet Reheating to Flying Shear & Cooling Bed. Click any component for PLC sensor diagnostics.
                </p>
              </div>

              <div className="synoptic-header-actions">
                <button
                  className="scada-btn btn-live add-machine-header-btn"
                  onClick={() => handleOpenAddMachine()}
                >
                  <Icon name="plus" size={14} /> ADD MACHINE / INSTRUMENT
                </button>
                <div className="synoptic-legend">
                  <span>
                    <i className="dot normal" /> NORMAL
                  </span>
                  <span>
                    <i className="dot warning" /> WARNING
                  </span>
                  <span>
                    <i className="dot critical" /> CRITICAL
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Process Line Diagram */}
            <div className="synoptic-canvas">
              <div className="flow-line">
                <div className="hot-billet-anim" />
              </div>

              {/* Pre-Furnace Custom Machines */}
              {customMachines
                .filter((m) => m.position === "pre-furnace")
                .map((m) => (
                  <div key={m.id} className="synoptic-custom-wrapper">
                    <div
                      className={`synoptic-node synoptic-custom-node ${m.status.toLowerCase()}`}
                      onClick={() => setSelectedCustomMachine(m)}
                    >
                      <div className="custom-node-top">
                        <div className="node-icon custom-icon">
                          <Icon name={m.iconName || "gauge"} size={20} />
                        </div>
                        <span className="node-type-badge">{m.type.toUpperCase()}</span>
                      </div>
                      <div className="node-title custom-title">{m.name}</div>
                      <div className="custom-measures-list">
                        {m.measures.map((meas) => (
                          <div key={meas.id} className="custom-measure-item">
                            <span className="meas-name">{meas.name}:</span>
                            <span className="meas-val">
                              <b>{meas.value}</b> <small>{meas.unit}</small>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="custom-node-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-icon-mini edit"
                          title="Edit Machine & Measures"
                          onClick={() => handleOpenEditMachine(m)}
                        >
                          <Icon name="edit" size={12} />
                        </button>
                        <button
                          className="btn-icon-mini del"
                          title="Delete Machine"
                          onClick={() => handleDeleteMachine(m.id)}
                        >
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="synoptic-arrow">➔</div>
                  </div>
                ))}

              {/* 1. Reheating Furnace */}
              <div
                className="synoptic-node node-furnace"
                onClick={() => setTab("furnace")}
              >
                <div className="node-icon">
                  <Icon name="furnace" size={24} />
                </div>
                <div className="node-title">REHEATING FURNACE</div>
                <div className="node-metrics">
                  <span>
                    Z1: <b>{furnace.zone1}°C</b>
                  </span>
                  <span>
                    Z2: <b>{furnace.zone2}°C</b>
                  </span>
                  <span>
                    Z3: <b>{furnace.zone3}°C</b>
                  </span>
                  <span className="badge-billet">{furnace.billetCount} Billets</span>
                </div>
              </div>

              <div className="synoptic-arrow">➔</div>

              {/* 2. Roughing Mill (R1-R2) */}
              <div className="synoptic-group">
                <div className="group-label">ROUGHING MILL</div>
                <div className="group-stands">
                  {stands.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      className={`synoptic-stand ${s.status.toLowerCase()}`}
                      onClick={() => setSelectedStand(s)}
                    >
                      <div className="stand-header">
                        <b>{s.id}</b>
                        <small>{s.name}</small>
                      </div>
                      <div className="stand-values">
                        <div>
                          <small>SPEED</small>
                          <b>{s.rpm} RPM</b>
                        </div>
                        <div>
                          <small>LOAD</small>
                          <b>{s.loadPercent}%</b>
                        </div>
                        <div>
                          <small>TORQUE</small>
                          <b>{s.torqueKnm} kN·m</b>
                        </div>
                        <div>
                          <small>TEMP</small>
                          <b>{s.rollTempC}°C</b>
                        </div>
                      </div>
                      <svg className="stand-spark" viewBox="0 0 100 25">
                        <polyline
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          points={s.historyLoad
                            .map(
                              (v, idx) =>
                                `${idx * 20},${25 - ((v - 50) / 50) * 20}`
                            )
                            .join(" ")}
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              <div className="synoptic-arrow">➔</div>

              {/* After-Roughing Custom Machines */}
              {customMachines
                .filter((m) => m.position === "after-roughing")
                .map((m) => (
                  <div key={m.id} className="synoptic-custom-wrapper">
                    <div
                      className={`synoptic-node synoptic-custom-node ${m.status.toLowerCase()}`}
                      onClick={() => setSelectedCustomMachine(m)}
                    >
                      <div className="custom-node-top">
                        <div className="node-icon custom-icon">
                          <Icon name={m.iconName || "droplet"} size={20} />
                        </div>
                        <span className="node-type-badge">{m.type.toUpperCase()}</span>
                      </div>
                      <div className="node-title custom-title">{m.name}</div>
                      <div className="custom-measures-list">
                        {m.measures.map((meas) => (
                          <div key={meas.id} className="custom-measure-item">
                            <span className="meas-name">{meas.name}:</span>
                            <span className="meas-val">
                              <b>{meas.value}</b> <small>{meas.unit}</small>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="custom-node-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-icon-mini edit"
                          title="Edit Machine & Measures"
                          onClick={() => handleOpenEditMachine(m)}
                        >
                          <Icon name="edit" size={12} />
                        </button>
                        <button
                          className="btn-icon-mini del"
                          title="Delete Machine"
                          onClick={() => handleDeleteMachine(m.id)}
                        >
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="synoptic-arrow">➔</div>
                  </div>
                ))}

              {/* Quick Add Here Button: Post Roughing */}
              <button
                className="synoptic-add-here-btn"
                onClick={() => handleOpenAddMachine("after-roughing")}
                title="Add custom machine after Roughing Mill"
              >
                <Icon name="plus" size={12} /> Add Machine
              </button>

              <div className="synoptic-arrow">➔</div>

              {/* 3. Intermediate Mill (I1-I4) */}
              <div className="synoptic-group">
                <div className="group-label">INTERMEDIATE MILL</div>
                <div className="group-stands">
                  {stands.slice(2, 6).map((s) => (
                    <div
                      key={s.id}
                      className={`synoptic-stand ${s.status.toLowerCase()}`}
                      onClick={() => setSelectedStand(s)}
                    >
                      <div className="stand-header">
                        <b>{s.id}</b>
                        <small>{s.name}</small>
                      </div>
                      <div className="stand-values">
                        <div>
                          <small>SPEED</small>
                          <b>{s.rpm} RPM</b>
                        </div>
                        <div>
                          <small>LOAD</small>
                          <b>{s.loadPercent}%</b>
                        </div>
                        <div>
                          <small>PRESS</small>
                          <b>{s.hydraulicBar} Bar</b>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="synoptic-arrow">➔</div>

              {/* After-Intermediate Custom Machines */}
              {customMachines
                .filter((m) => m.position === "after-intermediate")
                .map((m) => (
                  <div key={m.id} className="synoptic-custom-wrapper">
                    <div
                      className={`synoptic-node synoptic-custom-node ${m.status.toLowerCase()}`}
                      onClick={() => setSelectedCustomMachine(m)}
                    >
                      <div className="custom-node-top">
                        <div className="node-icon custom-icon">
                          <Icon name={m.iconName || "gauge"} size={20} />
                        </div>
                        <span className="node-type-badge">{m.type.toUpperCase()}</span>
                      </div>
                      <div className="node-title custom-title">{m.name}</div>
                      <div className="custom-measures-list">
                        {m.measures.map((meas) => (
                          <div key={meas.id} className="custom-measure-item">
                            <span className="meas-name">{meas.name}:</span>
                            <span className="meas-val">
                              <b>{meas.value}</b> <small>{meas.unit}</small>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="custom-node-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-icon-mini edit"
                          title="Edit Machine & Measures"
                          onClick={() => handleOpenEditMachine(m)}
                        >
                          <Icon name="edit" size={12} />
                        </button>
                        <button
                          className="btn-icon-mini del"
                          title="Delete Machine"
                          onClick={() => handleDeleteMachine(m.id)}
                        >
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="synoptic-arrow">➔</div>
                  </div>
                ))}

              {/* 4. Universal Finishing Mill (F1-F2) */}
              <div className="synoptic-group">
                <div className="group-label">UNIVERSAL FINISHING</div>
                <div className="group-stands">
                  {stands.slice(6, 8).map((s) => (
                    <div
                      key={s.id}
                      className={`synoptic-stand ${s.status.toLowerCase()}`}
                      onClick={() => setSelectedStand(s)}
                    >
                      <div className="stand-header">
                        <b>{s.id}</b>
                        <small>{s.name}</small>
                      </div>
                      <div className="stand-values">
                        <div>
                          <small>SPEED</small>
                          <b>{s.rpm} RPM</b>
                        </div>
                        <div>
                          <small>LOAD</small>
                          <b>{s.loadPercent}%</b>
                        </div>
                        <div>
                          <small>GAP</small>
                          <b>{s.rollGapMm} mm</b>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="synoptic-arrow">➔</div>

              {/* After-Finishing Custom Machines */}
              {customMachines
                .filter((m) => m.position === "after-finishing")
                .map((m) => (
                  <div key={m.id} className="synoptic-custom-wrapper">
                    <div
                      className={`synoptic-node synoptic-custom-node ${m.status.toLowerCase()}`}
                      onClick={() => setSelectedCustomMachine(m)}
                    >
                      <div className="custom-node-top">
                        <div className="node-icon custom-icon">
                          <Icon name={m.iconName || "search"} size={20} />
                        </div>
                        <span className="node-type-badge">{m.type.toUpperCase()}</span>
                      </div>
                      <div className="node-title custom-title">{m.name}</div>
                      <div className="custom-measures-list">
                        {m.measures.map((meas) => (
                          <div key={meas.id} className="custom-measure-item">
                            <span className="meas-name">{meas.name}:</span>
                            <span className="meas-val">
                              <b>{meas.value}</b> <small>{meas.unit}</small>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="custom-node-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-icon-mini edit"
                          title="Edit Machine & Measures"
                          onClick={() => handleOpenEditMachine(m)}
                        >
                          <Icon name="edit" size={12} />
                        </button>
                        <button
                          className="btn-icon-mini del"
                          title="Delete Machine"
                          onClick={() => handleDeleteMachine(m.id)}
                        >
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="synoptic-arrow">➔</div>
                  </div>
                ))}

              {/* Quick Add Here Button: Post Finishing */}
              <button
                className="synoptic-add-here-btn"
                onClick={() => handleOpenAddMachine("after-finishing")}
                title="Add custom machine after Finishing Mill"
              >
                <Icon name="plus" size={12} /> Add Instrument
              </button>

              <div className="synoptic-arrow">➔</div>

              {/* 5. Flying Shear */}
              <div className="synoptic-node node-shear">
                <div className="node-icon">
                  <Icon name="cpu" size={24} />
                </div>
                <div className="node-title">HOT FLYING SHEAR</div>
                <div className="node-metrics">
                  <span>
                    Cut Count: <b>3,412 cuts</b>
                  </span>
                  <span>
                    Blade Temp: <b>340°C</b>
                  </span>
                  <span>
                    Tolerance: <b>±1.2 mm</b>
                  </span>
                </div>
              </div>

              {/* Post-Shear Custom Machines */}
              {customMachines
                .filter((m) => m.position === "post-shear")
                .map((m) => (
                  <div key={m.id} className="synoptic-custom-wrapper">
                    <div className="synoptic-arrow">➔</div>
                    <div
                      className={`synoptic-node synoptic-custom-node ${m.status.toLowerCase()}`}
                      onClick={() => setSelectedCustomMachine(m)}
                    >
                      <div className="custom-node-top">
                        <div className="node-icon custom-icon">
                          <Icon name={m.iconName || "gauge"} size={20} />
                        </div>
                        <span className="node-type-badge">{m.type.toUpperCase()}</span>
                      </div>
                      <div className="node-title custom-title">{m.name}</div>
                      <div className="custom-measures-list">
                        {m.measures.map((meas) => (
                          <div key={meas.id} className="custom-measure-item">
                            <span className="meas-name">{meas.name}:</span>
                            <span className="meas-val">
                              <b>{meas.value}</b> <small>{meas.unit}</small>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="custom-node-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-icon-mini edit"
                          title="Edit Machine & Measures"
                          onClick={() => handleOpenEditMachine(m)}
                        >
                          <Icon name="edit" size={12} />
                        </button>
                        <button
                          className="btn-icon-mini del"
                          title="Delete Machine"
                          onClick={() => handleDeleteMachine(m.id)}
                        >
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Quick Live Alarm Feed Below Synoptic */}
            <div className="synoptic-alarms-panel">
              <div className="panel-title">
                <Icon name="alert" size={16} />
                <span>REAL-TIME SCADA ALARM STREAM</span>
              </div>
              <div className="alarm-mini-list">
                {alarms.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className={`alarm-mini-item ${a.severity.toLowerCase()} ${
                      a.acknowledged ? "ack" : ""
                    }`}
                  >
                    <span className="alarm-sev">{a.severity}</span>
                    <span className="alarm-time">{a.timestamp}</span>
                    <span className="alarm-msg">{a.message}</span>
                    {!a.acknowledged && (
                      <button
                        className="btn-ack-mini"
                        onClick={() => handleAckAlarm(a.id)}
                      >
                        ACK
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: MILL STANDS MATRIX */}
        {tab === "telemetry" && (
          <section className="stands-matrix-section">
            <div className="section-title-bar">
              <h2>SPM 8-Stand Mill Telemetry Matrix</h2>
              <p>Real-time sensor readings for roll speeds, motor currents, roll gap, vibration, and hydraulic pressures.</p>
            </div>
            <div className="stands-grid">
              {stands.map((s) => (
                <div key={s.id} className={`stand-card ${s.status.toLowerCase()}`}>
                  <div className="stand-card-top">
                    <div>
                      <span className="stand-tag">{s.id}</span>
                      <h3>{s.name}</h3>
                    </div>
                    <span className={`status-pill ${s.status.toLowerCase()}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="stand-metrics-grid">
                    <div className="m-box">
                      <small>MOTOR SPEED</small>
                      <strong>
                        {s.rpm} <small>RPM</small>
                      </strong>
                    </div>
                    <div className="m-box">
                      <small>MOTOR LOAD</small>
                      <strong className={s.loadPercent > 85 ? "text-orange" : ""}>
                        {s.loadPercent}
                        <small>%</small>
                      </strong>
                    </div>
                    <div className="m-box">
                      <small>ROLL TORQUE</small>
                      <strong>
                        {s.torqueKnm} <small>kN·m</small>
                      </strong>
                    </div>
                    <div className="m-box">
                      <small>ROLL TEMP</small>
                      <strong>
                        {s.rollTempC} <small>°C</small>
                      </strong>
                    </div>
                    <div className="m-box">
                      <small>VIBRATION RMS</small>
                      <strong className={s.vibMmS > 3.0 ? "text-red" : ""}>
                        {s.vibMmS} <small>mm/s</small>
                      </strong>
                    </div>
                    <div className="m-box">
                      <small>HYDRAULIC PRESS</small>
                      <strong className={s.hydraulicBar < 180 ? "text-orange" : ""}>
                        {s.hydraulicBar} <small>Bar</small>
                      </strong>
                    </div>
                  </div>

                  <div className="load-bar-wrap">
                    <div className="load-bar-label">
                      <span>LOAD CAPACITY</span>
                      <span>{s.loadPercent}% / 100%</span>
                    </div>
                    <div className="load-bar-track">
                      <div
                        className={`load-bar-fill ${
                          s.loadPercent > 85 ? "warn" : ""
                        }`}
                        style={{ width: `${s.loadPercent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    className="stand-diag-btn"
                    onClick={() => setSelectedStand(s)}
                  >
                    <Icon name="cpu" size={14} /> VIEW DIAGNOSTICS & PLC TAGS
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: REHEATING FURNACE SCADA */}
        {tab === "furnace" && (
          <section className="furnace-section">
            <div className="section-title-bar">
              <h2>Reheating Furnace SCADA Telemetry</h2>
              <p>Walking beam furnace zone temperatures, combustion air-fuel ratio, gas pressure, and billet pusher tracking.</p>
            </div>

            <div className="furnace-visual-grid">
              <div className="furnace-card furnace-heat-map">
                <h3>Thermal Zones Live Map</h3>
                <div className="thermal-zones">
                  <div className="zone-box z1">
                    <span className="zone-name">ZONE 1 (PRE-HEAT)</span>
                    <strong className="zone-temp">{furnace.zone1}°C</strong>
                    <div className="flame-anim" />
                    <small>Target: 1180°C</small>
                  </div>
                  <div className="zone-box z2">
                    <span className="zone-name">ZONE 2 (HEATING)</span>
                    <strong className="zone-temp">{furnace.zone2}°C</strong>
                    <div className="flame-anim" />
                    <small>Target: 1240°C</small>
                  </div>
                  <div className="zone-box z3">
                    <span className="zone-name">ZONE 3 (SOAKING)</span>
                    <strong className="zone-temp">{furnace.zone3}°C</strong>
                    <div className="flame-anim" />
                    <small>Target: 1260°C</small>
                  </div>
                </div>
              </div>

              <div className="furnace-card">
                <h3>Combustion & Gas Controls</h3>
                <div className="furnace-kv-list">
                  <div>
                    <span>NATURAL GAS PRESSURE</span>
                    <strong>{furnace.gasPressure} mbar</strong>
                  </div>
                  <div>
                    <span>AIR / FUEL RATIO</span>
                    <strong>{furnace.airFuelRatio} λ</strong>
                  </div>
                  <div>
                    <span>BILLET COUNT INSIDE</span>
                    <strong className="text-green">{furnace.billetCount} Billets</strong>
                  </div>
                  <div>
                    <span>PUSHER HYDRAULIC CYCLES</span>
                    <strong>{furnace.pusherCycles}</strong>
                  </div>
                  <div>
                    <span>DISCHARGE FREQUENCY</span>
                    <strong>1 Billet / 85 sec</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: LIQUID METAL & CASTER TELEMETRY */}
        {tab === "caster" && (
          <section className="caster-section">
            <div className="section-title-bar">
              <h2>Continuous Caster & Liquid Metal SCADA</h2>
              <p>Direct real-time stream from CCM (Continuous Casting Machine) supplying steel billets to SPM mill.</p>
            </div>

            <div className="caster-grid">
              <div className="caster-card">
                <h3>Tundish Liquid Metal Thermal State</h3>
                <div className="tundish-display">
                  <div className="tundish-temp">
                    <span>TUNDISH TEMP</span>
                    <strong>{caster.tundishTemp} °C</strong>
                    <p className="green">Superheat: +32°C above liquidus</p>
                  </div>
                  <div className="tundish-meta">
                    <div>
                      <small>STEEL GRADE</small>
                      <b>{caster.steelGrade}</b>
                    </div>
                    <div>
                      <small>LADLE HEAT NO.</small>
                      <b>{caster.ladleHeatNumber}</b>
                    </div>
                  </div>
                </div>
              </div>

              <div className="caster-card">
                <h3>Strands Live Status</h3>
                <div className="strands-status-row">
                  <div className="strand-box">
                    <span className="strand-title">STRAND 1</span>
                    <span className="strand-status-pill casting">CASTING</span>
                    <p>Casting Speed: <b>{caster.castingSpeed} m/min</b></p>
                    <p>Water Cooling: <b>{caster.waterFlowLmin} L/min</b></p>
                    <p>Mold Oscillation: <b>{caster.moldOscillationHz} Hz</b></p>
                  </div>
                  <div className="strand-box">
                    <span className="strand-title">STRAND 2</span>
                    <span className="strand-status-pill casting">CASTING</span>
                    <p>Casting Speed: <b>{(caster.castingSpeed - 0.02).toFixed(2)} m/min</b></p>
                    <p>Water Cooling: <b>{caster.waterFlowLmin - 15} L/min</b></p>
                    <p>Mold Oscillation: <b>{caster.moldOscillationHz} Hz</b></p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: ALARM & EVENT STREAM */}
        {tab === "alarms" && (
          <section className="alarms-section">
            <div className="section-title-bar">
              <h2>SCADA Real-Time Alarm & Event Log</h2>
              <p>Full audit trail of PLC alarm triggers, parameter violations, and operator acknowledgments.</p>
            </div>

            <div className="alarms-table-wrap">
              <table className="scada-table">
                <thead>
                  <tr>
                    <th>SEVERITY</th>
                    <th>ID</th>
                    <th>TIMESTAMP</th>
                    <th>PLC TAG ADDRESS</th>
                    <th>LOCATION</th>
                    <th>DESCRIPTION</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {alarms.map((a) => (
                    <tr key={a.id} className={a.acknowledged ? "row-ack" : "row-unack"}>
                      <td>
                        <span className={`sev-tag ${a.severity.toLowerCase()}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td><b>{a.id}</b></td>
                      <td>{a.timestamp}</td>
                      <td><code>{a.tag}</code></td>
                      <td>{a.location}</td>
                      <td>{a.message}</td>
                      <td>
                        <span className={a.acknowledged ? "text-green" : "text-red"}>
                          {a.acknowledged ? "ACKNOWLEDGED" : "UNACKNOWLEDGED"}
                        </span>
                      </td>
                      <td>
                        {!a.acknowledged ? (
                          <button
                            className="btn-ack-table"
                            onClick={() => handleAckAlarm(a.id)}
                          >
                            ACKNOWLEDE
                          </button>
                        ) : (
                          <span className="text-gray">CLEARED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 6: PLC TAG INSPECTOR */}
        {tab === "tags" && (
          <section className="tags-section">
            <div className="section-title-bar">
              <h2>OPC UA / Siemens PLC Live Tag Inspector</h2>
              <p>Live polling registry of active PLC data blocks, scan cycles, and data quality metrics.</p>
              <div className="search-wrap">
                <Icon name="search" size={16} />
                <input
                  type="text"
                  placeholder="Search PLC Tag address or symbol (e.g. DB100, Speed)..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="tags-table-wrap">
              <table className="scada-table">
                <thead>
                  <tr>
                    <th>PLC ADDRESS</th>
                    <th>SYMBOLIC NAME</th>
                    <th>TYPE</th>
                    <th>LIVE VALUE</th>
                    <th>UNIT</th>
                    <th>SCAN RATE</th>
                    <th>QUALITY</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTags.map((t, idx) => (
                    <tr key={idx}>
                      <td><code>{t.address}</code></td>
                      <td><b>{t.name}</b></td>
                      <td><span className="type-tag">{t.type}</span></td>
                      <td><strong className="text-cyan">{t.value}</strong></td>
                      <td>{t.unit}</td>
                      <td>{t.scanMs} ms</td>
                      <td>
                        <span className={`quality-tag ${t.quality.toLowerCase()}`}>
                          {t.quality}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 7: SCADA REPORTS & ANALYTICS GENERATOR */}
        {tab === "reports" && (
          <section className="reports-section">
            <div className="section-title-bar">
              <h2>SCADA Plant Reports & Analytics Generator</h2>
              <p>Generate, preview, export CSV, and print official shift performance and equipment diagnostic reports.</p>
            </div>

            {/* Report Configuration Form */}
            <div className="report-config-card">
              <div className="config-grid">
                <div>
                  <label>SELECT REPORT TYPE</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="oee_shift">Shift Performance & OEE Summary Report</option>
                    <option value="stand_diag">Mill Stands Vibration & Sensor Audit</option>
                    <option value="furnace_log">Reheating Furnace Thermal Compliance Log</option>
                    <option value="alarms_log">SCADA Plant Alarms & Incident Audit</option>
                    <option value="quality_audit">Laser Profile Dimension & Quality Report</option>
                  </select>
                </div>

                <div>
                  <label>SHIFT / TIME RANGE</label>
                  <select
                    value={reportShift}
                    onChange={(e) => setReportShift(e.target.value)}
                  >
                    <option value="shift_a">Shift A (06:00 - 14:00)</option>
                    <option value="shift_b">Shift B (14:00 - 22:00)</option>
                    <option value="shift_c">Shift C (22:00 - 06:00)</option>
                    <option value="full_day">Full 24 Hours (Today)</option>
                  </select>
                </div>

                <div>
                  <label>MILL SECTION FILTER</label>
                  <select
                    value={reportSection}
                    onChange={(e) => setReportSection(e.target.value)}
                  >
                    <option value="all">Entire SPM Mill Line</option>
                    <option value="roughing">Roughing Stands (R1 - R2)</option>
                    <option value="intermediate">Intermediate Stands (I1 - I4)</option>
                    <option value="finishing">Universal Finishing (F1 - F2)</option>
                  </select>
                </div>
              </div>

              <div className="config-actions">
                <button className="scada-btn btn-live" onClick={handleGenerateReport}>
                  <Icon name="fileText" size={16} /> GENERATE PLANT REPORT
                </button>

                <button className="scada-btn btn-sim" onClick={handleDownloadCSV}>
                  <Icon name="download" size={16} /> EXPORT CSV DATA
                </button>

                {generatedReport && (
                  <button className="scada-btn btn-warn" onClick={handlePrintReport}>
                    <Icon name="printer" size={16} /> PRINT / SAVE PDF
                  </button>
                )}
              </div>
            </div>

            {/* Generated Official Report Preview Card */}
            {generatedReport && (
              <div className="official-report-card">
                <div className="report-header">
                  <div className="report-stamp">OFFICIAL SCADA AUDIT REPORT</div>
                  <div className="report-meta">
                    <h3>{generatedReport.title}</h3>
                    <p>
                      Report ID: <code>{generatedReport.id}</code> | Date: <b>{generatedReport.date}</b> | {generatedReport.shiftName}
                    </p>
                  </div>
                </div>

                {/* Key Summary Metrics Grid */}
                <div className="report-summary-grid">
                  <div>
                    <small>TOTAL SHIFT TONNAGE</small>
                    <strong>{generatedReport.totalTonnage} TONS</strong>
                  </div>
                  <div>
                    <small>AVERAGE LINE SPEED</small>
                    <strong>{generatedReport.avgSpeed} m/s</strong>
                  </div>
                  <div>
                    <small>OVERALL OEE</small>
                    <strong className="text-green">{generatedReport.oee}%</strong>
                  </div>
                  <div>
                    <small>SPECIFIC POWER</small>
                    <strong>{generatedReport.power} kWh/T</strong>
                  </div>
                  <div>
                    <small>LOGGED SCADA ALARMS</small>
                    <strong className={generatedReport.alarmsLogged > 0 ? "text-orange" : ""}>
                      {generatedReport.alarmsLogged} ALARMS
                    </strong>
                  </div>
                </div>

                {/* Mill Stand Breakdown Table inside Report */}
                <div className="report-section-box">
                  <h4>SPM Mill Stand Equipment Sensor Audit Breakdown</h4>
                  <table className="scada-table report-inner-table">
                    <thead>
                      <tr>
                        <th>STAND</th>
                        <th>NAME</th>
                        <th>SPEED (RPM)</th>
                        <th>LOAD %</th>
                        <th>TORQUE (kN·m)</th>
                        <th>ROLL TEMP (°C)</th>
                        <th>VIBRATION (mm/s)</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stands.map((s) => (
                        <tr key={s.id}>
                          <td><b>{s.id}</b></td>
                          <td>{s.name}</td>
                          <td>{s.rpm}</td>
                          <td>{s.loadPercent}%</td>
                          <td>{s.torqueKnm}</td>
                          <td>{s.rollTempC}</td>
                          <td>{s.vibMmS}</td>
                          <td>
                            <span className={`status-pill ${s.status.toLowerCase()}`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Signature Approval Block */}
                <div className="report-signatures">
                  <div>
                    <div className="sig-line" />
                    <small>SCADA & AUTOMATION ENGINEER</small>
                    <p>Siemens OPC UA System</p>
                  </div>
                  <div>
                    <div className="sig-line" />
                    <small>MILL SUPERINTENDENT</small>
                    <p>SPM Production Department</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Stand Diagnostic Modal Drawer */}
      {selectedStand && (
        <div className="scada-modal-overlay" onClick={() => setSelectedStand(null)}>
          <div className="scada-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedStand.id} - {selectedStand.name} Diagnostic</h2>
                <p>PLC Sensor Deep-Dive & Vibration FFT Analysis</p>
              </div>
              <button className="btn-close" onClick={() => setSelectedStand(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div>
                  <small>OPERATING SPEED</small>
                  <strong>{selectedStand.rpm} RPM</strong>
                </div>
                <div>
                  <small>MOTOR LOAD</small>
                  <strong>{selectedStand.loadPercent}%</strong>
                </div>
                <div>
                  <small>ROLL TEMP</small>
                  <strong>{selectedStand.rollTempC}°C</strong>
                </div>
                <div>
                  <small>HYDRAULIC PRESS</small>
                  <strong>{selectedStand.hydraulicBar} Bar</strong>
                </div>
              </div>

              <div className="modal-chart-box">
                <h4>Motor Speed & Load History (Last 30 Seconds)</h4>
                <div className="chart-preview">
                  {selectedStand.historyLoad.map((val, i) => (
                    <div
                      key={i}
                      className="chart-bar"
                      style={{ height: `${val}%` }}
                      title={`Load: ${val}%`}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-plc-tags">
                <h4>PLC Memory Addresses</h4>
                <ul>
                  <li>
                    <code>DB200.DBD0</code> Speed Setpoint: <b>{selectedStand.rpm} RPM</b>
                  </li>
                  <li>
                    <code>DB200.DBD4</code> Motor Current: <b>{Math.round(selectedStand.loadPercent * 4.2)} Amps</b>
                  </li>
                  <li>
                    <code>DB200.DBD8</code> Hydraulic Pressure: <b>{selectedStand.hydraulicBar} Bar</b>
                  </li>
                  <li>
                    <code>DB200.DBD12</code> Bearing Vibration: <b>{selectedStand.vibMmS} mm/s</b>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Custom Machine Diagnostic Modal Drawer */}
      {selectedCustomMachine && (
        <div className="scada-modal-overlay" onClick={() => setSelectedCustomMachine(null)}>
          <div className="scada-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedCustomMachine.name} Telemetry & Diagnostics</h2>
                <p>
                  Category: <b>{selectedCustomMachine.type.toUpperCase()}</b> | ID: <code>{selectedCustomMachine.id}</code> | Position: <b>{selectedCustomMachine.position}</b>
                </p>
              </div>
              <button className="btn-close" onClick={() => setSelectedCustomMachine(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {selectedCustomMachine.notes && (
                <div className="custom-notes-box">
                  <small>MACHINE DESCRIPTION / NOTES:</small>
                  <p>{selectedCustomMachine.notes}</p>
                </div>
              )}

              <div className="custom-measures-grid">
                {selectedCustomMachine.measures.map((m) => (
                  <div key={m.id} className="custom-m-card">
                    <small>{m.name.toUpperCase()}</small>
                    <strong>
                      {m.value} <small>{m.unit}</small>
                    </strong>
                    {m.target && <span className="target-tag">Target: {m.target}</span>}
                    <code className="plc-tag-address">{m.plcAddress}</code>
                  </div>
                ))}
              </div>

              <div className="modal-actions-bar">
                <button
                  className="scada-btn btn-sim"
                  onClick={() => {
                    const target = selectedCustomMachine;
                    setSelectedCustomMachine(null);
                    handleOpenEditMachine(target);
                  }}
                >
                  <Icon name="edit" size={14} /> EDIT MACHINE & MEASURES
                </button>
                <button
                  className="scada-btn btn-danger"
                  onClick={() => {
                    handleDeleteMachine(selectedCustomMachine.id);
                  }}
                >
                  <Icon name="trash" size={14} /> DELETE MACHINE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Machine & Instrument Builder Modal Drawer */}
      {isMachineModalOpen && (
        <div className="scada-modal-overlay" onClick={() => setIsMachineModalOpen(false)}>
          <div className="scada-modal-card machine-builder-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>
                  {editingMachineId ? "Edit Machine & Measures" : "+ Add New Machine / Instrument to Flow"}
                </h2>
                <p>Configure equipment name, position in rolling mill process flow, and sensor telemetry measures.</p>
              </div>
              <button className="btn-close" onClick={() => setIsMachineModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Machine Basic Configuration */}
              <div className="form-row-grid">
                <div>
                  <label className="form-label">MACHINE / INSTRUMENT NAME</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Laser Profile Gauge, Water Quench Box..."
                    value={formMachineName}
                    onChange={(e) => setFormMachineName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">INSTRUMENT CATEGORY</label>
                  <select
                    className="form-select"
                    value={formMachineType}
                    onChange={(e) => setFormMachineType(e.target.value as any)}
                  >
                    <option value="sensor">Sensor / Instrument</option>
                    <option value="inspection">Inspection / Optical Gauge</option>
                    <option value="cooling">Cooling / Water Quench / Descaler</option>
                    <option value="stand">Rolling Motor Stand</option>
                    <option value="furnace">Heating / Induction Chamber</option>
                    <option value="shear">Cutting Shear / Saw Unit</option>
                    <option value="custom">Custom Process Equipment</option>
                  </select>
                </div>
              </div>

              <div className="form-row-grid" style={{ marginTop: "14px" }}>
                <div>
                  <label className="form-label">POSITION IN ROLLING FLOW LINE</label>
                  <select
                    className="form-select"
                    value={formMachinePosition}
                    onChange={(e) => setFormMachinePosition(e.target.value as any)}
                  >
                    <option value="pre-furnace">1. Pre-Furnace Entry</option>
                    <option value="after-roughing">2. After Roughing Mill (Post-R2)</option>
                    <option value="after-intermediate">3. After Intermediate Mill (Post-I4)</option>
                    <option value="after-finishing">4. After Finishing Mill (Post-F2)</option>
                    <option value="post-shear">5. Post-Shear Exit & Cooling Bed</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">DISPLAY ICON</label>
                  <select
                    className="form-select"
                    value={formIconName}
                    onChange={(e) => setFormIconName(e.target.value)}
                  >
                    <option value="gauge">Gauge Indicator</option>
                    <option value="search">Laser / Optical Scanner</option>
                    <option value="droplet">Water / Liquid Spray</option>
                    <option value="cpu">CPU / Controller Unit</option>
                    <option value="zap">Electrical / Surge Unit</option>
                    <option value="furnace">Thermal Furnace Chamber</option>
                    <option value="activity">Sensor Activity Pulse</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "14px" }}>
                <label className="form-label">PROCESS NOTES / DESCRIPTION</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief operational detail or tolerance spec..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              {/* Dynamic Telemetry Measures Builder */}
              <div className="measures-builder-section" style={{ marginTop: "22px" }}>
                <div className="measures-header-bar">
                  <div>
                    <h4>MEASUREMENT INSTRUMENT TELEMETRY TAGS</h4>
                    <small>Define custom metrics, initial values, units, targets, and PLC tags</small>
                  </div>
                  <button className="btn-add-measure" onClick={handleAddMeasureRow}>
                    <Icon name="plus" size={14} /> Add Measure Parameter
                  </button>
                </div>

                <div className="measures-table-wrap">
                  <table className="scada-table measures-input-table">
                    <thead>
                      <tr>
                        <th>MEASURE NAME</th>
                        <th>VALUE</th>
                        <th>UNIT</th>
                        <th>TARGET RANGE</th>
                        <th>PLC ADDRESS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formMeasures.map((meas, idx) => (
                        <tr key={meas.id || idx}>
                          <td>
                            <input
                              type="text"
                              className="table-input"
                              placeholder="Measure Name"
                              value={meas.name}
                              onChange={(e) => handleUpdateMeasureRow(idx, "name", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="any"
                              className="table-input num-input"
                              value={meas.value}
                              onChange={(e) => handleUpdateMeasureRow(idx, "value", Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="table-input unit-input"
                              placeholder="unit (mm, °C)"
                              value={meas.unit}
                              onChange={(e) => handleUpdateMeasureRow(idx, "unit", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="table-input"
                              placeholder="e.g. 150 ± 0.5"
                              value={meas.target || ""}
                              onChange={(e) => handleUpdateMeasureRow(idx, "target", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="table-input address-input"
                              placeholder="DB300.DBD0"
                              value={meas.plcAddress}
                              onChange={(e) => handleUpdateMeasureRow(idx, "plcAddress", e.target.value)}
                            />
                          </td>
                          <td>
                            <button
                              className="btn-del-row"
                              title="Remove measure"
                              onClick={() => handleRemoveMeasureRow(idx)}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                      {formMeasures.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "16px", color: "#64748b" }}>
                            No measure tags defined. Click "+ Add Measure Parameter" above to add telemetry parameters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions-bar" style={{ marginTop: "24px" }}>
                <button className="scada-btn btn-warn" onClick={() => setIsMachineModalOpen(false)}>
                  CANCEL
                </button>
                <button className="scada-btn btn-live" onClick={handleSaveMachine}>
                  <Icon name="check" size={14} /> SAVE MACHINE TO PROCESS FLOW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

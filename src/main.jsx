import React from "react";
import { createRoot } from "react-dom/client";
import KPI from "./components/KPI";
import { callFn } from "./api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

function useAsync(d = null) {
  const [data, setData] = React.useState(d);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState(null);
  return {
    data, loading, err,
    async run(promise) {
      try { setLoading(true); setErr(null); setData(await promise); }
      catch (e) { setErr(e.message || String(e)); }
      finally { setLoading(false); }
    },
  };
}

const App = () => {
  const [sessions, setSessions] = React.useState([
    { locationId: "A", kWh: 18, durationMin: 45 },
    { locationId: "A", kWh: 12, durationMin: 30 },
    { locationId: "B", kWh: 28, durationMin: 60 },
    { locationId: "C", kWh: 14, durationMin: 35 },
  ]);
  const [discount, setDiscount] = React.useState(0.25);
  const [lambda] = React.useState(Array.from({ length: 24 }, (_, i) => (i >= 18 || i < 6 ? 1.2 : 0.4)));
  const [stations, setStations] = React.useState([
    { id: "S1", waitMin: 5, availableKW: 60 },
    { id: "S2", waitMin: 2, availableKW: 30 },
    { id: "S3", waitMin: 8, availableKW: 100 },
  ]);

  const inc = useAsync(), util = useAsync(), route = useAsync();

  return (
    <div className="wrap fade-in">

      {/* ✅ Back to Home Button */}
      <div className="btn-back-container">
        <a
          href="https://energy-verse-portal.netlify.app/?feature=10"
          className="btn-back-scroll"
        >
          ← Back to Home
        </a>
      </div>

      {/* Header */}
      <div className="title">
        <div>
          <h1>EV Behavior & Incentives — Dashboard ⚡</h1>
          <div className="sub">Session analytics, demand shifts, arrivals, and routing.</div>
        </div>
        <div className="toolbar">
          <button onClick={() => inc.run(callFn("ev_behavior_incentives", { sessions, incentive: { discountPct: discount } }))}>
            Compute Incentive Impact
          </button>
          <button onClick={() => util.run(callFn("ev_utilization_forecast", { lambda }))}>
            Forecast Utilization
          </button>
          <button onClick={() => route.run(callFn("ev_routing_suggestion", { stations, requiredKW: 50 }))}>
            Suggest Station
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpis">
        <KPI label="Sessions" value={sessions.length} />
        <KPI label="Discount %" value={(discount * 100).toFixed(0)} />
        <KPI label="Stations" value={stations.length} />
        <KPI label="Inputs Editable" value="Yes" hint="Modify inputs below" />
      </div>

      {/* GRID */}
      <div className="grid" style={{ marginTop: 16 }}>
        {/* Left column */}
        <div className="leftcol">
          <div className="card">
            <h3>Sessions</h3>

            <div className="scroll-area">
              {sessions.map((s, i) => (
                <div key={i} className="form-row">
                  <input
                    value={s.locationId}
                    onChange={(e) => {
                      const n = sessions.slice();
                      n[i] = { ...n[i], locationId: e.target.value };
                      setSessions(n);
                    }}
                    placeholder="ID"
                  />
                  <input
                    type="number"
                    value={s.kWh}
                    onChange={(e) => {
                      const n = sessions.slice();
                      n[i] = { ...n[i], kWh: +e.target.value };
                      setSessions(n);
                    }}
                    placeholder="kWh"
                  />
                  <input
                    type="number"
                    value={s.durationMin}
                    onChange={(e) => {
                      const n = sessions.slice();
                      n[i] = { ...n[i], durationMin: +e.target.value };
                      setSessions(n);
                    }}
                    placeholder="Minutes"
                  />
                  <button
                    className="btn-remove"
                    onClick={() => setSessions(sessions.filter((_, k) => k !== i))}
                  >
                    ✖ Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              className="btn-add"
              onClick={() => setSessions([...sessions, { locationId: "X", kWh: 10, durationMin: 25 }])}
            >
              ➕ Add Session
            </button>

            <h3 style={{ marginTop: 18 }}>Incentive</h3>
            <div className="form-row compact">
              <label className="label">Discount (0–1)</label>
              <input
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>

            <h3 style={{ marginTop: 18 }}>Stations</h3>
            <div className="scroll-area">
              {stations.map((s, i) => (
                <div key={i} className="form-row">
                  <input
                    value={s.id}
                    onChange={(e) => {
                      const n = stations.slice();
                      n[i] = { ...n[i], id: e.target.value };
                      setStations(n);
                    }}
                    placeholder="Station ID"
                  />
                  <input
                    type="number"
                    value={s.waitMin}
                    onChange={(e) => {
                      const n = stations.slice();
                      n[i] = { ...n[i], waitMin: +e.target.value };
                      setStations(n);
                    }}
                    placeholder="Wait (min)"
                  />
                  <input
                    type="number"
                    value={s.availableKW}
                    onChange={(e) => {
                      const n = stations.slice();
                      n[i] = { ...n[i], availableKW: +e.target.value };
                      setStations(n);
                    }}
                    placeholder="KW"
                  />
                  <button
                    className="btn-remove"
                    onClick={() => setStations(stations.filter((_, k) => k !== i))}
                  >
                    ✖ Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              className="btn-add"
              onClick={() => setStations([...stations, { id: "Sx", waitMin: 4, availableKW: 40 }])}
            >
              ➕ Add Station
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="rightcol">
          <div className="card">
            <h3>Utilization Forecast</h3>
            {util.data ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={util.data.forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="utilization_prob" stroke="#baff37" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="muted">Run Forecast.</div>
            )}
          </div>

          <div className="card">
            <h3>Incentive Impact</h3>
            {inc.data ? <pre>{JSON.stringify(inc.data, null, 2)}</pre> : <div className="muted">Compute Incentive Impact.</div>}
          </div>

          <div className="card">
            <h3>Best Station</h3>
            {route.data ? <pre>{JSON.stringify(route.data.best_station, null, 2)}</pre> : <div className="muted">Suggest a station.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")).render(<App />);

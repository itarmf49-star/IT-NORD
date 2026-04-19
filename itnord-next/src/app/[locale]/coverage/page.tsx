"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button, LinkButton } from "@/components/ui/button";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

function estimateApCount(areaSqm: number, floors: number, wallLossDb: number) {
  const effectiveArea = areaSqm * Math.sqrt(floors);
  const apCoverageSqm = 120;
  const base = Math.ceil(effectiveArea / apCoverageSqm);
  const lossPenalty = Math.max(0, Math.round((wallLossDb - 6) / 3));
  return Math.min(64, Math.max(1, base + lossPenalty));
}

type PlanRow = {
  id: string;
  areaSqm: number;
  floors: number;
  wallLossDb: number;
  recommendedAps: number;
  recommendedSwitches: number;
  createdAt: string;
};

export default function CoverageCalculatorPage() {
  const params = useParams();
  const raw = typeof params?.locale === "string" ? params.locale : defaultLocale;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  const { data: session, status } = useSession();
  const [area, setArea] = useState(220);
  const [floors, setFloors] = useState(2);
  const [wallLoss, setWallLoss] = useState(8);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [saveState, setSaveState] = useState<string | null>(null);

  const result = useMemo(() => {
    const ap = estimateApCount(area, floors, wallLoss);
    const switches = Math.max(1, Math.ceil(ap / 24));
    return { ap, switches };
  }, [area, floors, wallLoss]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (status !== "authenticated") return;
      const res = await fetch("/api/coverage/plans", { method: "GET" });
      if (!res.ok) return;
      const data = (await res.json()) as { plans?: PlanRow[] };
      if (!cancelled) setPlans(data.plans ?? []);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [status, saveState]);

  return (
    <section className="section">
      <Container>
        <h1 className="h1">Smart coverage planner</h1>
        <p className="muted">
          A fast indoor Wi‑Fi planning estimate for sales calls. Replace with RF survey data before final BOQ.
        </p>

        <div className="auth-card" style={{ marginTop: "1rem" }}>
          <div className="auth-form">
            <label className="field">
              <span className="field-label">Indoor area (m²)</span>
              <input className="input" type="number" min={20} max={20000} value={area} onChange={(e) => setArea(Number(e.target.value))} />
            </label>
            <label className="field">
              <span className="field-label">Floors</span>
              <input className="input" type="number" min={1} max={40} value={floors} onChange={(e) => setFloors(Number(e.target.value))} />
            </label>
            <label className="field">
              <span className="field-label">Estimated wall/obstacle loss (dB)</span>
              <input
                className="input"
                type="number"
                min={0}
                max={30}
                value={wallLoss}
                onChange={(e) => setWallLoss(Number(e.target.value))}
              />
            </label>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <p className="field-label">Recommended starting point</p>
            <p className="muted" style={{ marginTop: "0.35rem" }}>
              <strong style={{ color: "rgba(212,175,55,0.95)" }}>{result.ap}</strong> indoor APs (Wi‑Fi 6 class) and{" "}
              <strong style={{ color: "rgba(51,184,255,0.95)" }}>{result.switches}</strong> PoE aggregation switches
              (24‑port class).
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
              <Button type="button" onClick={() => window.print()}>
                Export / print
              </Button>
              {status === "authenticated" ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    setSaveState(null);
                    const res = await fetch("/api/coverage/plans", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({
                        areaSqm: area,
                        floors,
                        wallLossDb: wallLoss,
                        recommendedAps: result.ap,
                        recommendedSwitches: result.switches,
                      }),
                    });
                    if (!res.ok) {
                      setSaveState("Could not save plan.");
                      return;
                    }
                    setSaveState("Plan saved to your account.");
                  }}
                >
                  Save plan
                </Button>
              ) : (
                <LinkButton href={`/${locale}/login?next=/${locale}/coverage`} variant="ghost">
                  Sign in to save
                </LinkButton>
              )}
            </div>
            {saveState ? <p className="muted" style={{ marginTop: "0.5rem" }}>{saveState}</p> : null}
          </div>
        </div>

        {status === "authenticated" && plans.length > 0 ? (
          <div className="auth-card" style={{ marginTop: "1rem" }}>
            <p className="field-label">Your saved plans</p>
            <div className="admin-table-wrap" style={{ marginTop: "0.75rem" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Area</th>
                    <th>Floors</th>
                    <th>APs</th>
                    <th>Switches</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p.id}>
                      <td>{new Date(p.createdAt).toLocaleString()}</td>
                      <td>{p.areaSqm} m²</td>
                      <td>{p.floors}</td>
                      <td>{p.recommendedAps}</td>
                      <td>{p.recommendedSwitches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

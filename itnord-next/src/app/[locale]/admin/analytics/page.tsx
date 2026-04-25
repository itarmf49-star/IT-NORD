import { prisma } from "@/lib/prisma";
import { AnalyticsChart, type DailyPoint } from "@/components/admin/analytics-chart";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function last7DaysKeys() {
  const keys: string[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

type AdminAnalyticsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAnalyticsPage({ params }: AdminAnalyticsPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dayKeys = last7DaysKeys();
  const since = new Date(`${dayKeys[0]}T00:00:00.000Z`);

  let views: { path: string; createdAt: Date }[] = [];
  let aiUsage7d = 0;
  let chatMessages7d = 0;

  try {
    const [pv, ai, cm] = await Promise.all([
      prisma.pageView.findMany({
        where: { createdAt: { gte: since } },
        select: { path: true, createdAt: true },
        take: 5000,
      }),
      prisma.aiUsage.count({ where: { createdAt: { gte: since } } }),
      prisma.chatMessage.count({ where: { createdAt: { gte: since } } }),
    ]);
    views = pv;
    aiUsage7d = ai;
    chatMessages7d = cm;
  } catch {
    views = [];
    aiUsage7d = 0;
    chatMessages7d = 0;
  }

  const perDay = new Map<string, number>();
  for (const k of dayKeys) perDay.set(k, 0);
  for (const v of views) {
    const k = v.createdAt.toISOString().slice(0, 10);
    if (perDay.has(k)) perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }

  const daily: DailyPoint[] = dayKeys.map((day) => ({ day: day.slice(5), views: perDay.get(day) ?? 0 }));

  const pathCounts = new Map<string, number>();
  for (const v of views) {
    pathCounts.set(v.path, (pathCounts.get(v.path) ?? 0) + 1);
  }
  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <section className="admin-page">
      <h1 className="h1">{t(locale, "adminAnalytics")}</h1>
      <p className="muted">{t(locale, "analyticsTrafficSummary")}</p>

      <div className="admin-kpis">
        <div className="admin-kpi">
          <p className="muted" style={{ margin: "0 0 0.35rem" }}>
            {t(locale, "analyticsPageViews7d")}
          </p>
          <strong>{views.length}</strong>
        </div>
        <div className="admin-kpi">
          <p className="muted" style={{ margin: "0 0 0.35rem" }}>
            {t(locale, "analyticsAiCalls7d")}
          </p>
          <strong>{aiUsage7d}</strong>
        </div>
        <div className="admin-kpi">
          <p className="muted" style={{ margin: "0 0 0.35rem" }}>
            {t(locale, "analyticsChatMessages7d")}
          </p>
          <strong>{chatMessages7d}</strong>
        </div>
      </div>

      <div className="auth-card" style={{ marginTop: "1rem" }}>
        <p className="field-label">{t(locale, "analyticsDailyPageViews")}</p>
        <AnalyticsChart daily={daily} />
      </div>

      <div className="auth-card" style={{ marginTop: "1rem" }}>
        <p className="field-label">{t(locale, "analyticsTopPaths")}</p>
        <div className="admin-table-wrap" style={{ marginTop: "0.75rem" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t(locale, "analyticsPath")}</th>
                <th>{t(locale, "analyticsViews")}</th>
              </tr>
            </thead>
            <tbody>
              {topPaths.map(([path, count]) => (
                <tr key={path}>
                  <td>{path}</td>
                  <td>{count}</td>
                </tr>
              ))}
              {topPaths.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">
                    {t(locale, "analyticsNoPageViewData")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

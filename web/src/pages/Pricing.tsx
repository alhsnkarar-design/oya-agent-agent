import { useState } from "react";
import { useT } from "../i18n";
import { go } from "../router";
import { Icon } from "../components/Icon";
import { toast } from "../lib/toast";
import { useAuth } from "../lib/auth";
import "./pricing.css";

export const PLANS = [
  { key: "plan_creator", price: 9, edit: 60, dub: 10, cmds: 300, seats: 0 },
  { key: "plan_editor", price: 19, edit: 200, dub: 20, cmds: 1000, seats: 0, best: true },
  { key: "plan_studio", price: 49, edit: 500, dub: 50, cmds: 2500, seats: 3 },
] as const;

export function Pricing() {
  const { t, lang } = useT();
  const [yearly, setYearly] = useState(false);
  const auth = useAuth();
  const n = (v: number) => v.toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
  const choose = () => { toast(t.pay_soon); if (!auth.user) go("/login?signup=1"); };
  return (
    <main className="pricing wrap">
      <h1 className="h-display ptitle">{t.pricing_title_a} <span className="swoosh">{t.pricing_title_b} {t.pricing_title_c}</span></h1>
      <div className="bar">
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={!yearly} className={!yearly ? "on" : ""} onClick={() => setYearly(false)}>{t.monthly}</button>
          <button role="tab" aria-selected={yearly} className={yearly ? "on" : ""} onClick={() => setYearly(true)}>{t.yearly}</button>
        </div>
        <span className="div" />
        <span className="note">{t.yearly_note}</span>
        <span className="promo"><Icon n="tag" /> {t.promo}</span>
      </div>
      <div className="plans">
        {PLANS.map((p) => {
          const price = yearly ? Math.round((p.price * 10 / 12) * 100) / 100 : p.price;
          return (
            <article key={p.key} className={"plan card" + ("best" in p && p.best ? " best" : "")}>
              <div className="head">
                <h2>{t[p.key]}</h2>
                {"best" in p && p.best && <span className="badge">{t.most_popular}</span>}
              </div>
              <p className="price"><span dir="ltr">${price % 1 ? price.toFixed(2) : price}</span> <small>{t.per_month}</small></p>
              {yearly && <p className="yr" dir="auto">${p.price * 10} / {lang === "ar" ? "سنة" : "year"}</p>}
              <ul>
                <li><Icon n="check" /> {n(p.edit)} {t.min_edit}</li>
                <li><Icon n="check" /> {n(p.dub)} {t.min_dub}</li>
                <li><Icon n="check" /> {n(p.cmds)} {t.cmds}</li>
                {p.seats > 0 && <li><Icon n="check" /> {n(p.seats)} {t.seats}</li>}
              </ul>
              <button className={"btn " + ("best" in p && p.best ? "amber" : "ghost") + " full"} onClick={choose}>{t.get_plan} {t[p.key]}</button>
            </article>
          );
        })}
      </div>
      <div className="extra card">
        <Icon n="stack" size={30} />
        <strong>{t.extra}</strong>
        <span className="grow" />
        <button className="btn" onClick={choose}>{t.buy_minutes}</button>
      </div>
      <div className="pfaq">
        {(["1", "2"] as const).map((k) => (
          <details key={k} className="card"><summary>{t[`q${k}`]}<Icon n="chev" /></summary><p>{t[`a${k}`]}</p></details>
        ))}
      </div>
    </main>
  );
}

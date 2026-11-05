import { useEffect, useState } from "react";
import { useT } from "../i18n";
import { go, linkProps } from "../router";
import { Icon } from "../components/Icon";
import { deleteRow, listRows } from "../lib/db";
import { fmt } from "../lib/newproject";
import { outDuration, type Project } from "../editor/model";
import "./projects.css";

type Item = { id: string; p: Project; thumb?: string };

export function Projects() {
  const { t } = useT();
  const [items, setItems] = useState<Item[] | null>(null);
  useEffect(() => {
    const urls: string[] = [];
    listRows().then((rows) => setItems(rows.sort((a, b) => b.project.updatedAt - a.project.updatedAt).map((r) => {
      const thumb = r.thumb ? URL.createObjectURL(r.thumb) : undefined; if (thumb) urls.push(thumb);
      return { id: r.id, p: r.project, thumb };
    }))).catch(() => setItems([]));
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);
  return (
    <main className="projects wrap">
      <div className="head"><h1 className="h2">{t.projects_title}</h1><a className="btn amber" {...linkProps("/editor")}><Icon n="plus" /> {t.new_project}</a></div>
      <p className="muted">{t.local_note}</p>
      {items && !items.length && <p className="empty card">{t.no_projects}</p>}
      <div className="pgrid">
        {items?.map((it) => (
          <article key={it.id} className="pcard card">
            <button className="open" onClick={() => go("/editor?id=" + it.id)}>
              {it.thumb ? <img src={it.thumb} alt="" /> : <span className="ph"><Icon n="film" size={30} /></span>}
              <span className="time" dir="ltr">{fmt(outDuration(it.p))}</span>
              {it.p.edited && <span className="tag">{t.edited}</span>}
            </button>
            <div className="meta">
              <strong dir="auto">{it.p.name}</strong>
              <button className="del" aria-label="delete" onClick={async () => { await deleteRow(it.id); setItems((x) => x?.filter((y) => y.id !== it.id) ?? null); }}><Icon n="trash" /></button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

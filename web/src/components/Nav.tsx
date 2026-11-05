import { getLang, setLang, useT } from "../i18n";
import { linkProps, useRoute } from "../router";
import { signOut, useAuth } from "../lib/auth";

export function Nav() {
  const { t } = useT();
  const { path } = useRoute();
  const auth = useAuth();
  const inApp = path === "/editor" || path === "/projects";
  const links = inApp
    ? [{ to: "/", l: t.nav_home }, { to: "/editor", l: t.nav_editor }, { to: "/projects", l: t.nav_projects }, { to: "/pricing", l: t.nav_pricing }]
    : [{ to: "/#features", l: t.nav_features }, { to: "/pricing", l: t.nav_pricing }, { to: "/#faq", l: t.nav_faq }];
  return (
    <header className="nav">
      <div className="wrap row">
        <a className="logo" {...linkProps("/")} aria-label="Zifidit">Zifidit</a>
        <nav className="links" aria-label="main">
          {links.map((x) => <a key={x.to} {...linkProps(x.to)} className={path === x.to ? "on" : ""}>{x.l}</a>)}
        </nav>
        <div className="right">
          <button className="lang" onClick={() => setLang(getLang() === "ar" ? "en" : "ar")} aria-label="language">{t.lang_switch}</button>
          {auth.user ? (
            <button className="btn navlogin" onClick={() => void signOut()}>{t.logout}</button>
          ) : (
            <a className="btn navlogin" {...linkProps("/login")}>{t.login}</a>
          )}
          <a className="btn cream" {...linkProps("/editor")}>{t.get_started}</a>
        </div>
      </div>
    </header>
  );
}

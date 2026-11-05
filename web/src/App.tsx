import { lazy, Suspense } from "react";
import { useRoute } from "./router";
import { Nav } from "./components/Nav";
import { Home } from "./pages/Home";
import { Pricing } from "./pages/Pricing";
import { Login } from "./pages/Login";
import { Projects } from "./pages/Projects";
import { useToast } from "./lib/toast";
import { useT } from "./i18n";

const Editor = lazy(() => import("./pages/Editor"));

export function App() {
  const { path } = useRoute();
  const toast = useToast();
  useT();
  const page =
    path === "/pricing" ? <Pricing /> :
    path === "/login" ? <Login /> :
    path === "/projects" ? <Projects /> :
    path === "/editor" ? <Suspense fallback={<div style={{ minHeight: "60vh" }} />}><Editor /></Suspense> :
    <Home />;
  return (
    <>
      <Nav />
      {page}
      {toast && <div className={"toast" + (toast.bad ? " bad" : "")} role="status">{toast.text}</div>}
    </>
  );
}

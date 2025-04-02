import { useEffect } from "react";
import "./App.module.css";
import Dashboard from "./pages/Dashboard";
import { initGrafanaFaro } from "./util/grafanaFaro";

export default function App() {
  useEffect(() => {
    const devModes = ["mock", "backend", "backend-q1"];

    // Only initialize Grafana Faro in production environments
    if (!devModes.includes(import.meta.env.MODE)) {
      initGrafanaFaro();
    }
  }, []);

  return <Dashboard />;
}

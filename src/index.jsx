import { createRoot } from "react-dom/client";
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);

const Root = (
  <React.StrictMode>
    {import.meta.env.DEV ? (
      <Inspector>
        <App />
      </Inspector>
    ) : (
      <App />
    )}
  </React.StrictMode>
);

root.render(Root);

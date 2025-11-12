import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { seedDatabase } from "./scripts/seed";

seedDatabase().then(() => {
    createRoot(document.getElementById("root")!).render(<App />);
});

import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout"; // Layout component
import "./styles/global.scss";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<Layout />} />{" "}
      {/* Wrap your Layout with Routes */}
    </Routes>
  );
}

export default App;

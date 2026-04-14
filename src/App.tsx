import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import ProductDecomposition from "./pages/ProductDecomposition";
import FunctionalPromise from "./pages/FunctionalPromise";
import Constraints from "./pages/Constraints";
import HomeMarketCompetition from "./pages/HomeMarketCompetition";
import NewMarketDiscovery from "./pages/NewMarketDiscovery";
import NewMarketAnalysis from "./pages/NewMarketAnalysis";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/product" replace />} />
          <Route path="/product" element={<ProductDecomposition />} />
          <Route path="/functional-promise" element={<FunctionalPromise />} />
          <Route path="/constraints" element={<Constraints />} />
          <Route path="/home-market" element={<HomeMarketCompetition />} />
          <Route path="/home-market/:tab" element={<HomeMarketCompetition />} />
          <Route path="/discovery" element={<NewMarketDiscovery />} />
          <Route path="/analysis" element={<NewMarketAnalysis />} />
          <Route path="/analysis/:marketSlug" element={<NewMarketAnalysis />} />
          <Route path="/analysis/:marketSlug/:tab" element={<NewMarketAnalysis />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

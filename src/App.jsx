import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ListForm from "./pages/ListForm";
import Categories from "./pages/Categories";
import MisItems from "./pages/MisItems";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/nueva" element={<ListForm />} />
      <Route path="/lista/:id" element={<ListForm />} />
      <Route path="/categorias" element={<Categories />} />
      <Route path="/mis-items" element={<MisItems />} />
    </Routes>
  );
}

export default App;

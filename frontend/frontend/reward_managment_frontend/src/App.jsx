import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Business from "./pages/Business";
import Customer from "./pages/Customer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login></Login>} />
        <Route path="/business" element={<Business></Business>} />
        <Route path="/customer" element={<Customer></Customer>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

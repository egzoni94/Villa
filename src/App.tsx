import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import { HomePage } from "./pages/homePage";
import { ThemeContextProvider } from "./utilities/theme";
const App: React.FC = () => {
  //todo =>add the checkout timer for the token to be removed and if the token exist redirect to home
  return (
    <ThemeContextProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Router>
    </ThemeContextProvider>
  );
};

export default App;

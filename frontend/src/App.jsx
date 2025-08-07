import React from "react";
import "./App.css";
import Header from "./components/Header";
import { FileProvider } from "./context/FileContext";
import SideBar from "./components/SideBar";
import MainSection from "./components/MainSection";
import Login from "./components/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotesEditorPage from "./components/NotesEditorPage";
import PrivateRoute from "./components/PrivateRoute"; // ✅ import
import GoogleDriveFileUploader from "./components/GoogleDriveFileUploader";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <FileProvider>
                <div className="h-screen flex flex-col">
                  <Header />
                  <div className="flex flex-1">
                    <SideBar />
                    <MainSection />
                  </div>
                </div>
              </FileProvider>
            </PrivateRoute>
          }
        />

        <Route
          path="/notes/:id"
          element={
            <PrivateRoute>
              <FileProvider>
                <NotesEditorPage />
              </FileProvider>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

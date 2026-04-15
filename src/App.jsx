import { useState } from "react";
import Wood from "./Components/wood.jsx";
import Home from "./Components/Home.jsx";
import './App.css'

function App() {
  const [screen, setScreen] = useState("home");

  return (
    <>
      {/* Landscape Error for Mobile */}
      <div className="landscape-error">
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>⚠️</div>
        <h2 style={{ fontSize: "28px", margin: "0 0 10px 0", color: "#ff4444" }}>ERROR</h2>
        <h3 style={{ fontSize: "22px", margin: "0 0 15px 0" }}>Mobile Landscape Not Supported</h3>
        <p style={{ fontSize: "16px", opacity: 0.8 }}>Please rotate your phone to portrait mode to play.</p>
      </div>

      {screen === "home" ? (
        <Home onPlay={() => setScreen("game")} />
      ) : (
        <Wood />
      )}

      {/* Pure CSS to show error ONLY on horizontal mobile screens */}
      <style>{`
        .landscape-error {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #2a160a;
          z-index: 999999;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #f3e5ab;
          text-align: center;
          padding: 20px;
          font-family: 'Trebuchet MS', sans-serif;
        }

        /* Show error when device is in landscape AND height is small (like a mobile phone) */
        @media screen and (orientation: landscape) and (max-height: 500px) {
          .landscape-error {
            display: flex;
          }
        }
      `}</style>
    </>
  )
}

export default App
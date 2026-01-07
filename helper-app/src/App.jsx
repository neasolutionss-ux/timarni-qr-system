import { useState, useEffect } from "react";

const API_BASE = "https://timarni-qr-backend.onrender.com/api";

function App() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [savedVehicle, setSavedVehicle] = useState(null);
  const [qrId, setQrId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [waste, setWaste] = useState({
    wet: false,
    dry: false,
    dhw: false,
    sanitary: false
  });

  /* 🔑 RECEIVE QR FROM NATIVE ANDROID */
  useEffect(() => {
    window.onNativeQrScan = (raw) => {
      const id = raw.split("/").pop();
      setQrId(id);
    };

    return () => {
      delete window.onNativeQrScan;
    };
  }, []);

  /* Vehicle stored ONLY for current session */
  useEffect(() => {
    const v = localStorage.getItem("vehicleNumber");
    if (v) setSavedVehicle(v);
  }, []);

  const handleSaveVehicle = () => {
    if (!vehicleNumber.trim()) {
      alert("Enter vehicle number");
      return;
    }

    localStorage.setItem("vehicleNumber", vehicleNumber.trim());
    setSavedVehicle(vehicleNumber.trim());

    // 🔔 Try opening camera immediately
    if (window.Android && window.Android.onSubmitDone) {
      window.Android.onSubmitDone();
    }
  };

  const toggleWaste = (type) => {
    setWaste((prev) => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSubmit = async () => {
    if (!qrId) return;

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/waste/collect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrId,
          vehicleNumber: savedVehicle,
          segregation: waste
        })
      });

      if (!res.ok) throw new Error("Failed");

      alert("Saved successfully");

      setQrId(null);
      setWaste({
        wet: false,
        dry: false,
        dhw: false,
        sanitary: false
      });

      if (window.Android && window.Android.onSubmitDone) {
        window.Android.onSubmitDone();
      }

    } catch (err) {
      alert("Error saving data");
    } finally {
      setSubmitting(false);
    }
  };

  /* VEHICLE LOGIN SCREEN */
  if (!savedVehicle) {
    return (
      <div style={styles.container}>
        <h2>Enter Vehicle Number</h2>
        <input
          style={styles.input}
          placeholder="e.g. MP05-AB-1234"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
        />
        <button style={styles.button} onClick={handleSaveVehicle}>
          Continue
        </button>
      </div>
    );
  }

  /* MAIN SCREEN */
  return (
    <div style={styles.container}>
      <h3>Vehicle: {savedVehicle}</h3>

      {qrId && (
        <div style={styles.qrBox}>
          <strong>QR ID:</strong> {qrId}
        </div>
      )}

      <div style={styles.grid}>
        <WasteButton label="Wet" active={waste.wet} onClick={() => toggleWaste("wet")} />
        <WasteButton label="Dry" active={waste.dry} onClick={() => toggleWaste("dry")} />
        <WasteButton label="DHW" active={waste.dhw} onClick={() => toggleWaste("dhw")} />
        <WasteButton label="Sanitary" active={waste.sanitary} onClick={() => toggleWaste("sanitary")} />
      </div>

      <button
        style={{ ...styles.button, marginTop: 20 }}
        onClick={handleSubmit}
        disabled={submitting || !qrId}
      >
        {submitting ? "Saving..." : "Submit"}
      </button>

      {/* 🔴 DEBUG BUTTON */}
      <button
        style={{
          marginTop: 20,
          padding: 10,
          background: "red",
          color: "#fff",
          fontSize: 16
        }}
        onClick={() => {
          alert("Calling Android");
          if (window.Android && window.Android.onSubmitDone) {
            window.Android.onSubmitDone();
          } else {
            alert("Android bridge NOT found");
          }
        }}
      >
        DEBUG: OPEN CAMERA
      </button>
    </div>
  );
}

/* ---------- WASTE BUTTON ---------- */

function WasteButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 16,
        fontSize: 18,
        borderRadius: 8,
        border: "1px solid #ccc",
        backgroundColor: active ? "#16a34a" : "#f1f5f9",
        color: active ? "#fff" : "#000"
      }}
    >
      {label}
    </button>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  container: {
    minHeight: "100vh",
    padding: 20,
    fontFamily: "sans-serif",
    textAlign: "center"
  },
  input: {
    width: "100%",
    maxWidth: 300,
    padding: 12,
    fontSize: 18,
    marginBottom: 12
  },
  button: {
    width: "100%",
    maxWidth: 300,
    padding: 14,
    fontSize: 18,
    backgroundColor: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 6
  },
  qrBox: {
    margin: "16px 0",
    padding: 12,
    border: "1px dashed #999"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 20
  }
};

export default App;


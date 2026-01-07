import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "./api/api";

const INITIAL_FORM = {
  qrId: "",
  wardNumber: "",
  houseNumber: "",
  address: "",
  ownerName: "",
  mobile: "",
  familyMembers: "",
  propertyType: "Residential",
};

function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [message, setMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const qrInstance = useRef(null);

  // ---------------- GPS ----------------
  const captureLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => reject("Location permission denied"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  // ---------------- INPUT ----------------
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ---------------- QR SCAN (BACK CAMERA ONLY) ----------------
  const startScanner = async () => {
    setMessage("");
    setShowScanner(true);

    const html5QrCode = new Html5Qrcode("qr-reader");
    qrInstance.current = html5QrCode;

    try {
      const devices = await Html5Qrcode.getCameras();
      const backCamera =
        devices.find((d) =>
          d.label.toLowerCase().includes("back")
        ) || devices[devices.length - 1];

      await html5QrCode.start(
        { deviceId: { exact: backCamera.id } },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          let qrValue = decodedText.includes("/")
            ? decodedText.split("/").pop()
            : decodedText;

          html5QrCode.stop().then(() => {
            qrInstance.current = null;
            setShowScanner(false);
            setForm((p) => ({ ...p, qrId: qrValue }));
          });
        }
      );
    } catch (e) {
      setMessage("Unable to open back camera");
      setShowScanner(false);
    }
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    setMessage("");

    if (
      !form.qrId ||
      !form.wardNumber ||
      !form.houseNumber ||
      !form.address ||
      !form.ownerName ||
      !form.mobile ||
      !form.familyMembers
    ) {
      setMessage("⚠️ Please fill all mandatory fields");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.mobile)) {
      setMessage("⚠️ Mobile number must be 10 digits");
      return;
    }

    try {
      const gps = await captureLocation();

      const payload = {
        ...form,
        wardNumber: Number(form.wardNumber),
        familyMembers: Number(form.familyMembers),
        latitude: gps.latitude,
        longitude: gps.longitude,
        createdBy: "admin",
      };

const res = await api.post("/api/admin/activate-qr", payload);

// ✅ show success
setMessage(`✅ ${res.data.message}`);

// ✅ HARD RESET (important for Android WebView)
setTimeout(() => {
  window.location.reload();
}, 800);
    } catch (err) {
      setMessage("❌ Error activating QR");
    }
  };

  const input = {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: 6,
    border: "1px solid #ccc",
    marginBottom: 12,
  };

  return (
    <div style={{ maxWidth: 420, margin: "16px auto", padding: 16 }}>
      <h2>Timarni Municipal Council</h2>
      <p>QR Activation (Admin)</p>

      <button onClick={startScanner} style={{ width: "100%", padding: 14 }}>
        📷 Scan QR
      </button>

      {showScanner && <div id="qr-reader" style={{ marginTop: 12 }} />}

      {Object.entries({
        qrId: "QR ID",
        wardNumber: "Ward Number",
        houseNumber: "House Number",
        address: "Address",
        ownerName: "Owner Name",
        mobile: "Mobile Number",
        familyMembers: "Family Members",
      }).map(([k, v]) => (
        <input
          key={k}
          name={k}
          placeholder={v}
          value={form[k]}
          onChange={handleChange}
          style={input}
        />
      ))}

      <select
        name="propertyType"
        value={form.propertyType}
        onChange={handleChange}
        style={input}
      >
        <option value="Residential">Residential</option>
        <option value="Commercial">Commercial</option>
      </select>

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: 14,
          background: "#1b5e20",
          color: "#fff",
        }}
      >
        Activate QR
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}

export default App;


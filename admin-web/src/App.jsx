import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "./api/api";

function App() {
  const [form, setForm] = useState({
    qrId: "",
    wardNumber: "",
    houseNumber: "",
    address: "",
    ownerName: "",
    mobile: "",
    familyMembers: "",
    propertyType: "Residential",
  });

  const [message, setMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);
const [location, setLocation] = useState({
  latitude: null,
  longitude: null,
});
const captureLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        reject("Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startScanner = () => {
    setShowScanner(true);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        (decodedText) => {
          let qrValue = decodedText;

          // Extract QR ID from URL if needed
          if (decodedText.includes("/")) {
            const parts = decodedText.split("/");
            qrValue = parts[parts.length - 1];
          }

          setForm((prev) => ({ ...prev, qrId: qrValue }));
          setShowScanner(false);
          scanner.clear();
        },
        (error) => {
          // ignore scan errors
        }
      );
    }, 300);
  };

const handleSubmit = async () => {
  // Basic validation
  if (
    !form.qrId ||
    !form.wardNumber ||
    !form.houseNumber ||
    !form.address ||
    !form.ownerName ||
    !form.mobile ||
    !form.familyMembers
  ) {
    setMessage("Please fill all mandatory fields");
    return;
  }

  if (isNaN(form.wardNumber)) {
    setMessage("Ward number must be numeric");
    return;
  }

  if (isNaN(form.familyMembers)) {
    setMessage("Family members must be numeric");
    return;
  }

  if (!/^[0-9]{10}$/.test(form.mobile)) {
    setMessage("Mobile number must be 10 digits");
    return;
  }

  try {
    // ⬅️ WAIT for GPS
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
    setMessage(res.data.message || "QR Activated Successfully");
  } catch (err) {
    setMessage(
      typeof err === "string"
        ? err
        : err.response?.data?.message || "Error activating QR"
    );
  }
};
  const inputStyle = {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 20 }}>
      <h2>Timarni Municipal Council</h2>
      <p>QR Activation (Admin)</p>

      <button onClick={startScanner} style={{ marginBottom: 10 }}>
        Scan QR
      </button>

      {showScanner && <div id="qr-reader" style={{ width: "100%" }} />}

      <input
        style={inputStyle}
        name="qrId"
        placeholder="QR ID"
        value={form.qrId}
        onChange={handleChange}
      />

      <input
        style={inputStyle}
        name="wardNumber"
        placeholder="Ward Number"
        value={form.wardNumber}
        onChange={handleChange}
      />

      <input
        style={inputStyle}
        name="houseNumber"
        placeholder="House Number"
        value={form.houseNumber}
        onChange={handleChange}
      />

      <input
        style={inputStyle}
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
      />

      <input
        style={inputStyle}
        name="ownerName"
        placeholder="Owner Name"
        value={form.ownerName}
        onChange={handleChange}
      />

      <input
        style={inputStyle}
        name="mobile"
        placeholder="Mobile Number"
        value={form.mobile}
        onChange={handleChange}
      />

      <input
        style={inputStyle}
        name="familyMembers"
        placeholder="No. of Family Members"
        value={form.familyMembers}
        onChange={handleChange}
      />

      <select
        style={inputStyle}
        name="propertyType"
        value={form.propertyType}
        onChange={handleChange}
      >
        <option value="Residential">Residential</option>
        <option value="Commercial">Commercial</option>
      </select>

      <button onClick={handleSubmit} style={{ width: "100%" }}>
        Activate QR
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}

export default App;


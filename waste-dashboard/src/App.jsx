import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const WASTE_API = "https://timarni-qr-backend.onrender.com/api/waste";
const HOUSEHOLD_API = "https://timarni-qr-backend.onrender.com/api/admin/households";

export default function App() {
  const [data, setData] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [loadingHouse, setLoadingHouse] = useState(false);
const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0]
);

useEffect(() => {
  fetch(WASTE_API)
    .then(r => r.json())
    .then(setData)
    .catch(console.error);
}, []);

  const fetchHouse = async (qrId) => {
    try {
      setLoadingHouse(true);
      const res = await fetch(HOUSEHOLD_API);
      const all = await res.json();
      const found = all.find(h => h.qrId === qrId);
      setSelectedHouse(found || { notFound: true });
    } catch (err) {
      alert("Failed to load household details");
    } finally {
      setLoadingHouse(false);
    }
  };
const filteredData = data.filter(
  d => d.dateKey === selectedDate
);
const vehicleSummary = Object.values(
  filteredData.reduce((acc, row) => {
    if (!acc[row.vehicleNumber]) {
      acc[row.vehicleNumber] = {
        vehicleNumber: row.vehicleNumber,
        houses: new Set(),
        wet: false,
        dry: false,
        dhw: false,
        sanitary: false
      };
    }
    acc[row.vehicleNumber].houses.add(row.qrId);
    acc[row.vehicleNumber].wet ||= row.segregation.wet;
    acc[row.vehicleNumber].dry ||= row.segregation.dry;
    acc[row.vehicleNumber].dhw ||= row.segregation.dhw;
    acc[row.vehicleNumber].sanitary ||= row.segregation.sanitary;
    return acc;
  }, {})
);
const exportExcel = async () => {
  if (filteredData.length === 0) {
    alert("No data to export for selected date");
    return;
  }

  try {
    // 1️⃣ Fetch household master data ONCE
    const res = await fetch(HOUSEHOLD_API);
    const households = await res.json();

    // 2️⃣ Build QR → household lookup
    const householdMap = {};
    households.forEach(h => {
      householdMap[h.qrId] = h;
    });

    // 3️⃣ Build Excel rows with enrichment
    const rows = filteredData.map(row => {
      const house = householdMap[row.qrId] || {};

      return {
        Vehicle: row.vehicleNumber,
        Time: new Date(row.createdAt).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        "QR ID": row.qrId,
        "Owner Name": house.ownerName || "",
        "Ward Number": house.wardNumber || "",
        "House Number": house.houseNumber || "",
        Address: house.address || "",
        Wet: row.segregation.wet ? "YES" : "NO",
        Dry: row.segregation.dry ? "YES" : "NO",
        DHW: row.segregation.dhw ? "YES" : "NO",
        Sanitary: row.segregation.sanitary ? "YES" : "NO"
      };
    });

    // 4️⃣ Generate Excel
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Waste Report");

    const fileDate = selectedDate.split("-").reverse().join("-");
    XLSX.writeFile(workbook, `Waste_Report_${fileDate}.xlsx`);

  } catch (err) {
    alert("Failed to export Excel with household data");
    console.error(err);
  }
};

  return (
    <div className="container">
      <h1>Waste Collection Dashboard</h1>
      <div className="sub">Timarni Municipal Council</div>

<div className="meta">
  <div>
    Date:&nbsp;
    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
    />
  </div>

  <div>
    <button className="view-btn" onClick={exportExcel}>
      Export Excel
    </button>
  </div>

  <div>Last Sync: {new Date().toLocaleTimeString()}</div>
</div>

<div className="stats">
  Total Records: {filteredData.length} &nbsp; | &nbsp;
  Vehicles Active: {new Set(filteredData.map(d => d.vehicleNumber)).size} &nbsp; | &nbsp;
  Houses Covered: {new Set(filteredData.map(d => d.qrId)).size}
</div>
{vehicleSummary.length > 0 && (
  <div style={{ marginBottom: "18px" }}>
    <h3 style={{ margin: "8px 0" }}>
      Vehicle Summary ({selectedDate.split("-").reverse().join("/")})
    </h3>

    <table>
      <thead>
        <tr>
          <th>Vehicle</th>
          <th>Houses</th>
          <th>Wet</th>
          <th>Dry</th>
          <th>DHW</th>
          <th>Sanitary</th>
        </tr>
      </thead>
      <tbody>
        {vehicleSummary.map(v => (
          <tr key={v.vehicleNumber}>
            <td>{v.vehicleNumber}</td>
            <td>{v.houses.size}</td>
            <td className={v.wet ? "badge-yes" : "badge-no"}>{v.wet ? "YES" : "NO"}</td>
            <td className={v.dry ? "badge-yes" : "badge-no"}>{v.dry ? "YES" : "NO"}</td>
            <td className={v.dhw ? "badge-yes" : "badge-no"}>{v.dhw ? "YES" : "NO"}</td>
            <td className={v.sanitary ? "badge-yes" : "badge-no"}>{v.sanitary ? "YES" : "NO"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Time</th>
            <th>QR ID</th>
            <th>Wet</th>
            <th>Dry</th>
            <th>DHW</th>
            <th>Sanitary</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
{filteredData.map(row => (
            <tr key={row._id}>
              <td>{row.vehicleNumber}</td>
              <td>
                {new Date(row.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </td>
              <td>{row.qrId}</td>
              <td className={row.segregation.wet ? "badge-yes" : "badge-no"}>
                {row.segregation.wet ? "YES" : "NO"}
              </td>
              <td className={row.segregation.dry ? "badge-yes" : "badge-no"}>
                {row.segregation.dry ? "YES" : "NO"}
              </td>
              <td className={row.segregation.dhw ? "badge-yes" : "badge-no"}>
                {row.segregation.dhw ? "YES" : "NO"}
              </td>
              <td className={row.segregation.sanitary ? "badge-yes" : "badge-no"}>
                {row.segregation.sanitary ? "YES" : "NO"}
              </td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => fetchHouse(row.qrId)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== MODAL ===== */}
      {selectedHouse && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 999
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "420px",
              margin: "8% auto",
              padding: "20px",
              border: "1px solid #e5e7eb"
            }}
          >
            <h3 style={{ marginTop: 0 }}>Household Details</h3>

            {loadingHouse ? (
              <p>Loading...</p>
            ) : selectedHouse.notFound ? (
              <p>No household record found for this QR.</p>
            ) : (
              <>
                <p><b>Owner Name:</b> {selectedHouse.ownerName}</p>
                <p><b>Ward Number:</b> {selectedHouse.wardNumber}</p>
                <p><b>House Number:</b> {selectedHouse.houseNumber}</p>
                <p><b>Address:</b> {selectedHouse.address}</p>
                {selectedHouse.mobile && (
                  <p><b>Mobile:</b> {selectedHouse.mobile}</p>
                )}
              </>
            )}

            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <button
                className="view-btn"
                onClick={() => setSelectedHouse(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== END MODAL ===== */}
    </div>
  );
}


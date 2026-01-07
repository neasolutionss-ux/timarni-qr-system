import { useEffect, useState } from "react";
import { fetchHouseholds, updateHousehold } from "./api/adminApi";
import Login from "./Login";
import * as XLSX from "xlsx";
import "./App.css";

function formatIST(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function App() {
  const [households, setHouseholds] = useState([]);
  const [wardFilter, setWardFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  /* ✅ FETCH DATA ONLY AFTER LOGIN */
  useEffect(() => {
    if (!isLoggedIn) return;

    fetchHouseholds()
      .then((res) => setHouseholds(res.data))
      .catch((err) => console.error("API error:", err));
  }, [isLoggedIn]);

  const wards = Array.from(
    new Set(households.map((h) => h.wardNumber))
  ).sort((a, b) => a - b);

  const filteredHouseholds = households.filter((h) => {
    if (wardFilter && String(h.wardNumber) !== wardFilter) return false;

    const createdDate = new Date(h.createdAt);

    if (fromDate) {
      const from = new Date(fromDate);
      if (createdDate < from) return false;
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (createdDate > to) return false;
    }

    return true;
  });

  /* ===== EXCEL EXPORT ===== */
  const exportToExcel = () => {
    const exportData = filteredHouseholds.map((h) => ({
      "QR ID": h.qrId,
      Ward: h.wardNumber,
      "House No": h.houseNumber,
      Owner: h.ownerName,
      Mobile: h.mobile,
      "Family Members": h.familyMembers,
      "Property Type": h.propertyType,
      "Activated (IST)": formatIST(h.createdAt),
      Latitude: h.latitude ?? "",
      Longitude: h.longitude ?? "",
      "Property Tax Status": h.propertyTaxStatus,
      "User Charge Status": h.userChargeStatus,
      "User Charge Amount": h.userChargeAmount,
      Remarks: h.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Households");
    XLSX.writeFile(workbook, "Timarni_QR_Households.xlsx");
  };

  /* ✅ LOGIN GATE */
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {/* HEADER + LOGOUT */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Timarni QR Admin Dashboard</h1>
        <button
          className="btn-save"
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            setIsLoggedIn(false);
          }}
        >
          Logout
        </button>
      </div>

      <p>
        Total Activated QR Codes: <b>{filteredHouseholds.length}</b>
      </p>

      {/* Filters */}
      <label>
        Ward:{" "}
        <select
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
        >
          <option value="">All Wards</option>
          {wards.map((w) => (
            <option key={w} value={w}>
              Ward {w}
            </option>
          ))}
        </select>
      </label>

      &nbsp;&nbsp;

      <label>
        From:{" "}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </label>

      &nbsp;&nbsp;

      <label>
        To:{" "}
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </label>

      &nbsp;&nbsp;
      <button className="btn-save" onClick={exportToExcel}>
        Export Excel
      </button>

      <br />
      <br />

      <table border="1" cellPadding="6" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>QR ID</th>
            <th>Ward</th>
            <th>House No</th>
            <th>Owner</th>
            <th>Mobile</th>
            <th>Family</th>
            <th>Property</th>
            <th>Activated (IST)</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Property Tax</th>
            <th>User Charge</th>
            <th>Amount</th>
            <th>Remarks</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredHouseholds.map((h, index) => (
            <tr key={h._id}>
              <td>{h.qrId}</td>
              <td>{h.wardNumber}</td>
              <td>{h.houseNumber}</td>
              <td>{h.ownerName}</td>
              <td>{h.mobile}</td>
              <td>{h.familyMembers}</td>
              <td>{h.propertyType}</td>
              <td>{formatIST(h.createdAt)}</td>
              <td>{h.latitude ?? "-"}</td>
              <td>{h.longitude ?? "-"}</td>

              <td>
                <select
                  value={h.propertyTaxStatus}
                  className={
                    h.propertyTaxStatus === "Paid"
                      ? "status-paid"
                      : "status-due"
                  }
                  onChange={(e) => {
                    const copy = [...households];
                    copy[index].propertyTaxStatus = e.target.value;
                    setHouseholds(copy);
                  }}
                >
                  <option value="NA">NA</option>
                  <option value="Paid">Paid</option>
                  <option value="Due">Due</option>
                </select>
              </td>

              <td>
                <select
                  value={h.userChargeStatus}
                  className={
                    h.userChargeStatus === "Paid"
                      ? "status-paid"
                      : "status-unpaid"
                  }
                  onChange={(e) => {
                    const copy = [...households];
                    copy[index].userChargeStatus = e.target.value;
                    setHouseholds(copy);
                  }}
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </td>

              <td>
                <input
                  type="number"
                  value={h.userChargeAmount}
                  style={{ width: "70px" }}
                  onChange={(e) => {
                    const copy = [...households];
                    copy[index].userChargeAmount = Number(e.target.value);
                    setHouseholds(copy);
                  }}
                />
              </td>

              <td>
                <input
                  type="text"
                  value={h.remarks}
                  style={{ width: "140px" }}
                  onChange={(e) => {
                    const copy = [...households];
                    copy[index].remarks = e.target.value;
                    setHouseholds(copy);
                  }}
                />
              </td>

              <td>
                <button
                  className="btn-save"
                  onClick={async () => {
                    await updateHousehold(h._id, {
                      propertyTaxStatus: h.propertyTaxStatus,
                      userChargeStatus: h.userChargeStatus,
                      userChargeAmount: h.userChargeAmount,
                      remarks: h.remarks,
                    });
                    alert("Saved successfully");
                  }}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;


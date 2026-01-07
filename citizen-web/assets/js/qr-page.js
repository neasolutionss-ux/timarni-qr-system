// ===== QR ID extraction (local + production) =====
const params = new URLSearchParams(window.location.search);
let qrId = params.get("qr");

if (!qrId) {
  const parts = window.location.pathname.split("/");
  qrId = parts[parts.length - 1];
}

console.log("QR ID:", qrId);

// ===== Backend URL (Render) =====
const API_BASE = "https://timarni-qr-backend.onrender.com/api/qr/"; // CHANGE if needed

// ===== Fetch property data =====
fetch(`${API_BASE}/api/admin/qr/${qrId}`)
  .then(res => res.json())
  .then(resp => {
    if (!resp.success) {
      alert("Property data not found");
      return;
    }

    const d = resp.data;

    // ===== Bind data to UI =====
    document.getElementById("qrId").innerText = d.qrId;
    document.getElementById("ownerName").innerText = d.ownerName;
    document.getElementById("mobile").innerText = d.mobile;
    document.getElementById("houseNo").innerText = d.houseNo;
    document.getElementById("ward").innerText = d.ward;
    document.getElementById("propertyType").innerText = d.propertyType;
    document.getElementById("taxAmount").innerText = d.taxAmount;
    document.getElementById("taxStatus").innerText = d.taxStatus;

    // ===== Payment button logic =====
    const payBtn = document.getElementById("payBtn");

    if (d.taxStatus === "DUE") {
      payBtn.disabled = false;
      payBtn.onclick = () => {
        window.location.href =
          `/payment-result/index.html?qr=${d.qrId}&amount=${d.taxAmount}`;
      };
    }
  })
  .catch(err => {
    console.error(err);
    alert("Server error");
  });


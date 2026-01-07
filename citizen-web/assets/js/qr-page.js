(function () {
  const params = new URLSearchParams(window.location.search);
  const qrId = params.get("qr");

  if (!qrId) {
    alert("Invalid QR code");
    return;
  }

  // Show QR ID
  document.getElementById("qrId").textContent = qrId;

  const API_URL = `https://timarni-qr-backend.onrender.com/api/qr/${qrId}`;

  fetch(API_URL)
    .then(res => res.json())
    .then(json => {
      if (!json.success) {
        alert("Property data not found");
        return;
      }

      const d = json.data;

      setText("ownerName", d.ownerName);
      setText("mobile", d.mobile);
      setText("houseNo", d.houseNo);
      setText("ward", d.ward);
      setText("propertyType", d.propertyType);
      setText("taxAmount", d.taxAmount);
      setText("status", d.taxStatus);

      const payBtn = document.getElementById("payBtn");

      // Enable payment only if tax is DUE
      if (String(d.taxStatus).toLowerCase() === "due") {
        payBtn.disabled = false;
        payBtn.classList.add("pay-enabled");
        payBtn.onclick = () => {
          alert("Payment gateway integration next step");
        };
      } else {
        payBtn.disabled = true;
        payBtn.classList.remove("pay-enabled");
      }
    })
    .catch(() => {
      alert("Failed to load property details. Please try again.");
    });

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
  }
})();


const MASTER_KEY = "9999";
const DEFAULT_PIN = "1234";

// ده اللي بيصلح مشكلة 9999
function isLicenseValid(code) {
  if (!code) return false;
  code = code.toString().trim();
  if (code === MASTER_KEY) return true;
  if (code.startsWith("888") && code.length >= 5) return true;
  // اكواد انت مولدها قبل كده
  let licenses = JSON.parse(localStorage.getItem("all_licenses") || "[]");
  if (licenses.includes(code)) return true;
  return false;
}

function checkActivation() {
  const activated = localStorage.getItem("app_activated") === "true";
  const licenseOverlay = document.getElementById("license-overlay");
  const pinOverlay = document.getElementById("pin-overlay");
  if (!activated) {
    if (licenseOverlay) licenseOverlay.style.display = "flex";
    if (pinOverlay) pinOverlay.style.display = "none";
  } else {
    if (licenseOverlay) licenseOverlay.style.display = "none";
  }
}

function activateApp() {
  const inputEl = document.getElementById("license-input");
  if (!inputEl) return;
  const code = inputEl.value.trim();
  console.log("Trying code:", code);

  if (isLicenseValid(code)) {
    localStorage.setItem("app_activated", "true");
    localStorage.setItem("app_license", code);
    alert("تم التفعيل بنجاح ✅");
    location.reload();
  } else {
    alert("كود التفعيل غلط، جرب 9999");
    inputEl.value = "";
  }
}

function checkPin() {
  const inputEl = document.getElementById("pin-input");
  if (!inputEl) return;
  const pin = inputEl.value.trim();
  const savedPin = localStorage.getItem("user_pin") || DEFAULT_PIN;

  if (pin === MASTER_KEY || pin === savedPin || pin === "1234") {
    document.getElementById("pin-overlay").style.display = "none";
    localStorage.setItem("pin_ok", "true");
  } else {
    document.getElementById("pin-error").style.display = "block";
  }
}

function emergencyReset() {
  localStorage.clear();
  location.reload();
}

// شغل الفحص اول ما الصفحة تفتح
document.addEventListener("DOMContentLoaded", checkActivation);

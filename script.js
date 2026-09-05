const CONFIG = {
  bookingEmail: "your-email@example.com",
  upiId: "",
  qrImage: ""
};

const devices = {
  midnight: {
    name: "Midnight MacBook",
    image: "assets/macbook-midnight.jpeg",
    positions: [
      { x: 23, y: 26, name: "Top-left", tier: "Standard", price: 499 },
      { x: 40, y: 24, name: "Upper-left", tier: "Standard", price: 499 },
      { x: 59, y: 24, name: "Upper-right", tier: "Standard", price: 499 },
      { x: 76, y: 27, name: "Top-right", tier: "Standard", price: 499 },
      { x: 23, y: 63, name: "Lower-left", tier: "Standard", price: 499 },
      { x: 40, y: 65, name: "Bottom-left", tier: "Premium", price: 699 },
      { x: 59, y: 65, name: "Bottom-right", tier: "Premium", price: 699 },
      { x: 75, y: 61, name: "Lower-right", tier: "Premium", price: 699 }
    ]
  },
  silver: {
    name: "Silver MacBook",
    image: "assets/macbook-silver.jpeg",
    positions: [
      { x: 33, y: 25, name: "Top-left", tier: "Standard", price: 499 },
      { x: 48, y: 23, name: "Top-centre", tier: "Standard", price: 499 },
      { x: 64, y: 25, name: "Top-right", tier: "Standard", price: 499 },
      { x: 32, y: 44, name: "Middle-left", tier: "Premium", price: 699 },
      { x: 66, y: 44, name: "Middle-right", tier: "Premium", price: 699 },
      { x: 34, y: 64, name: "Bottom-left", tier: "Standard", price: 499 },
      { x: 49, y: 68, name: "Bottom-centre", tier: "Premium", price: 699 },
      { x: 65, y: 64, name: "Bottom-right", tier: "Standard", price: 499 }
    ]
  }
};

let activeDevice = "midnight";
let selectedSpot = null;
let uploadedLogo = "";
const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const $ = selector => document.querySelector(selector);

function renderDevice() {
  const device = devices[activeDevice];
  $("#device-image").src = device.image;
  $("#device-image").alt = `${device.name} with eight selectable advertising positions`;
  $("#slot-layer").innerHTML = device.positions.map((spot, index) =>
    `<button class="slot" style="left:${spot.x}%;top:${spot.y}%" data-index="${index}" aria-label="Spot ${index + 1}, ${spot.name}, ${money(spot.price)}">${String(index + 1).padStart(2,"0")}</button>`
  ).join("");
  selectedSpot = null;
  updateSelection();
}

function selectSpot(index) {
  selectedSpot = { device: activeDevice, index, ...devices[activeDevice].positions[index] };
  document.querySelectorAll(".slot").forEach((slot, i) => slot.classList.toggle("active", i === index));
  updateSelection();
}

function updateSelection() {
  const empty = $("#selection-empty");
  const details = $("#selection-details");
  if (!selectedSpot) {
    empty.hidden = false; details.hidden = true;
    $("#checkout-title").textContent = "Select a spot first";
    $("#checkout-subtitle").textContent = "Choose from the live inventory above";
    $("#checkout-price").textContent = "—";
    $("#checkout-total").textContent = "—";
    $("#logo-preview").hidden = true;
    return;
  }
  const device = devices[selectedSpot.device];
  empty.hidden = true; details.hidden = false;
  $("#selection-number").textContent = String(selectedSpot.index + 1).padStart(2,"0");
  $("#selection-device").textContent = device.name;
  $("#selection-name").textContent = selectedSpot.name;
  $("#selection-tier").textContent = selectedSpot.tier;
  $("#selection-price").textContent = money(selectedSpot.price);
  $("#checkout-image").src = device.image;
  $("#checkout-title").textContent = `${device.name} · Spot ${String(selectedSpot.index + 1).padStart(2,"0")}`;
  $("#checkout-subtitle").textContent = `${selectedSpot.name} · ${selectedSpot.tier}`;
  $("#checkout-price").textContent = money(selectedSpot.price);
  $("#checkout-total").textContent = money(selectedSpot.price);
  if (uploadedLogo) positionLogo();
}

function positionLogo() {
  if (!selectedSpot || !uploadedLogo) return;
  const preview = $("#logo-preview");
  preview.hidden = false;
  preview.style.left = `${selectedSpot.x}%`;
  preview.style.top = `${selectedSpot.y}%`;
  preview.querySelector("img").src = uploadedLogo;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2800);
}

document.querySelectorAll(".device-tab").forEach(tab => tab.addEventListener("click", () => {
  activeDevice = tab.dataset.device;
  document.querySelectorAll(".device-tab").forEach(item => {
    const active = item === tab;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", active);
  });
  renderDevice();
}));

$("#slot-layer").addEventListener("click", event => {
  const slot = event.target.closest(".slot");
  if (slot) selectSpot(Number(slot.dataset.index));
});

$("#continue-button").addEventListener("click", () => $("#book").scrollIntoView({ behavior: "smooth" }));
$("#change-spot").addEventListener("click", () => $("#inventory").scrollIntoView({ behavior: "smooth" }));

$("#logo-upload").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast("Please choose an image smaller than 5 MB."); event.target.value = ""; return; }
  const reader = new FileReader();
  reader.onload = () => { uploadedLogo = reader.result; $("#upload-title").textContent = file.name; positionLogo(); showToast("Logo loaded — choose a spot to preview it."); };
  reader.readAsDataURL(file);
});

if (CONFIG.upiId) {
  $("#upi-id").textContent = CONFIG.upiId;
  $("#copy-upi").disabled = false;
}
if (CONFIG.qrImage) {
  $("#qr-placeholder").innerHTML = `<img src="${CONFIG.qrImage}" alt="UPI payment QR code">`;
}
$("#copy-upi").addEventListener("click", async () => {
  await navigator.clipboard.writeText(CONFIG.upiId);
  showToast("UPI ID copied.");
});

$("#booking-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!selectedSpot) { showToast("Please choose an advertising spot first."); $("#inventory").scrollIntoView({ behavior: "smooth" }); return; }
  const data = new FormData(event.currentTarget);
  const subject = `Adplace booking — ${data.get("brand")} — ${devices[selectedSpot.device].name} spot ${selectedSpot.index + 1}`;
  const body = [
    "Hi, I would like to book an Adplace spot.", "",
    `Brand: ${data.get("brand")}`, `Name: ${data.get("name")}`, `Email: ${data.get("email")}`,
    `Website: ${data.get("url") || "Not provided"}`, `Placement: ${devices[selectedSpot.device].name}, spot ${selectedSpot.index + 1} (${selectedSpot.name})`,
    `Duration: 7 days`, `Total: ${money(selectedSpot.price)}`, `Transaction ID: ${data.get("transaction") || "Will provide after payment"}`,
    `Campaign note: ${data.get("note") || "None"}`, "", "I will attach my artwork and payment screenshot to this email."
  ].join("\n");
  if (CONFIG.bookingEmail === "your-email@example.com") {
    navigator.clipboard.writeText(`${subject}\n\n${body}`);
    showToast("Booking brief copied. Add your email in script.js to enable direct booking.");
    return;
  }
  window.location.href = `mailto:${CONFIG.bookingEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

$("#year").textContent = new Date().getFullYear();
renderDevice();

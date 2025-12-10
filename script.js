import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  query,
  limitToLast,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://aqua-flood-system-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const ui = {
  waterVal: document.getElementById("water-value"),
  waterBar: document.getElementById("water-bar"),
  soilVal: document.getElementById("soil-value"),
  soilCircle: document.getElementById("soil-circle"),
  soilText: document.getElementById("soil-text"),
  rainText: document.getElementById("rain-text"),
  rainPercent: document.getElementById("rain-percent"),
  rainIcon: document.getElementById("weather-dynamic-icon"),
  statusText: document.getElementById("system-status-text"),
  statusDot: document.querySelector(".status-dot"),
  statusBadge: document.getElementById("system-status-badge"),
  featuredCard: document.querySelector(".featured-card"),
  adviceHeading: document.getElementById("advice-status-heading"),
  adviceText: document.getElementById("advice-text"),
  adviceIconContainer: document.querySelector(".icon-container"),
  adviceIcon: document.querySelector(".icon-container i"),
  themeBtn: document.getElementById("theme-toggle"),
  themeIcon: document.getElementById("theme-icon"),
  dateDisplay: document.getElementById("date-display"),
  chartCanvas: document.getElementById("historyChart"),
};

document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash-screen");
  
  setTimeout(() => {
    splash.classList.add("hidden");
  }, 3000);
});

let myChart;

function initChart() {
  const ctx = ui.chartCanvas.getContext("2d");

  const gradientWater = ctx.createLinearGradient(0, 0, 0, 400);
  gradientWater.addColorStop(0, "rgba(6, 182, 212, 0.4)");
  gradientWater.addColorStop(1, "rgba(6, 182, 212, 0.0)");

  const gradientSoil = ctx.createLinearGradient(0, 0, 0, 400);
  gradientSoil.addColorStop(0, "rgba(16, 185, 129, 0.4)");
  gradientSoil.addColorStop(1, "rgba(16, 185, 129, 0.0)");

  const gradientRain = ctx.createLinearGradient(0, 0, 0, 400);
  gradientRain.addColorStop(0, "rgba(168, 85, 247, 0.4)");
  gradientRain.addColorStop(1, "rgba(168, 85, 247, 0.0)");

  Chart.defaults.color = "#64748b";
  Chart.defaults.borderColor = "rgba(255, 255, 255, 0.05)";
  Chart.defaults.font.family = "'Inter', sans-serif";

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Water (cm)",
          data: [],
          borderColor: "#06b6d4",
          backgroundColor: gradientWater,
          borderWidth: 2,
          fill: "start",
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
        {
          label: "Soil (%)",
          data: [],
          borderColor: "#10b981",
          backgroundColor: gradientSoil,
          borderWidth: 2,
          fill: "start",
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
        {
          label: "Rain (%)",
          data: [],
          borderColor: "#a855f7",
          backgroundColor: gradientRain,
          borderWidth: 2,
          fill: "start",
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleColor: "#f1f5f9",
          bodyColor: "#cbd5e1",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          displayColors: true,
          usePointStyle: true,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 6, color: "#94a3b8" }, 
        },
        y: {
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#94a3b8" },
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
    },
  });
}

initChart();

let isDarkMode = true;
ui.themeBtn.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark-mode");
  ui.themeIcon.setAttribute("data-lucide", isDarkMode ? "sun" : "moon");
  if (window.lucide) window.lucide.createIcons();
  
  if (myChart) {
    const textColor = isDarkMode ? "#94a3b8" : "#475569";
    const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
    myChart.options.scales.x.ticks.color = textColor;
    myChart.options.scales.y.ticks.color = textColor;
    myChart.options.scales.y.grid.color = gridColor;
    myChart.update();
  }
});

setInterval(() => {
  const now = new Date();
  ui.dateDisplay.innerText = now
    .toLocaleDateString("en-GB", {
      weekday: "short", day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit",
    })
    .replace(",", " -");
}, 1000);

const currentRef = ref(db, "AQUA/Current");
onValue(currentRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    let waterRaw = parseFloat(data.water);
    if (waterRaw >= 1000) {
      ui.waterVal.innerText = "Err";
      ui.waterBar.style.width = "0%";
      waterRaw = 0;
    } else {
      ui.waterVal.innerText = waterRaw.toFixed(1);
      let visualPct = 100 - waterRaw;
      if (visualPct < 0) visualPct = 0;
      if (visualPct > 100) visualPct = 100;
      ui.waterBar.style.width = `${visualPct}%`;
    }

    const soilMoisture = data.soil || 0;
    ui.soilVal.innerText = soilMoisture;
    ui.soilText.innerText = soilMoisture > 60 ? "Wet / Saturated" : "Dry / Stable";

    const progressColor = getComputedStyle(document.body).getPropertyValue("--text-primary").trim();
    const trailColor = getComputedStyle(document.body).getPropertyValue("--border-color").trim();
    ui.soilCircle.style.background = `conic-gradient(${progressColor} ${soilMoisture * 3.6}deg, ${trailColor} 0deg)`;

    const rainRaw = data.rain || 4095;
    let rainPct = Math.round(((4095 - rainRaw) / 4095) * 100);
    if (rainPct < 0) rainPct = 0;
    ui.rainPercent.innerText = rainPct;

    if (rainRaw < 2500) {
      ui.rainText.innerText = "RAINING";
      ui.rainIcon.setAttribute("data-lucide", "cloud-rain");
    } else {
      ui.rainText.innerText = "NO RAIN";
      ui.rainIcon.setAttribute("data-lucide", "cloud");
    }

    calculateStatus(waterRaw, rainRaw, soilMoisture);
    if (window.lucide) window.lucide.createIcons();
  }
});

function calculateStatus(water, rainRaw, soil) {
  let status = "SAFE";
  let msg = "System operational. All sensors within safe parameters.";

  if (water > 0 && water < 30) {
    status = "DANGER";
    msg = "CRITICAL ALERT: Flood imminent! Water level critical (<30cm).";
  } else if (water > 0 && water < 60 && (rainRaw < 1500 || soil > 80)) {
    status = "DANGER";
    msg = "DANGER: High water level detected with adverse weather conditions.";
  } else if ((water > 0 && water < 60) || rainRaw < 2500 || soil > 50) {
    status = "WARNING";
    msg = "CAUTION: Potential flood risk detected. Monitor sensors closely.";
  }
  updateSystemStatus(status, msg);
}

function updateSystemStatus(statusString, msg) {
  let type = "safe";
  if (statusString === "WARNING") type = "warning";
  if (statusString === "DANGER") type = "danger";

  ui.statusText.innerText = `SYSTEM ${statusString}`;
  ui.adviceHeading.innerText = statusString === "SAFE" ? "SECURE" : statusString;
  ui.adviceText.innerText = msg;

  const colorMap = {
    safe: "var(--accent-safe)",
    warning: "var(--accent-warning)",
    danger: "var(--accent-danger)",
  };
  const colorVar = colorMap[type];

  ui.featuredCard.style.setProperty("--dynamic-color", colorVar);
  ui.statusDot.style.backgroundColor = colorVar;
  ui.statusDot.style.boxShadow = `var(--glow-${type})`;
  ui.statusBadge.style.color = colorVar;
  ui.statusBadge.style.borderColor = type !== "safe" ? colorVar : "var(--border-color)";

  ui.adviceIconContainer.style.animationName = "none";
  void ui.adviceIconContainer.offsetWidth;

  if (type === "safe") {
    ui.adviceIcon.setAttribute("data-lucide", "shield-check");
    ui.adviceIconContainer.style.animationName = "pulse-safe";
    document.body.classList.remove("danger-active");
  } else if (type === "warning") {
    ui.adviceIcon.setAttribute("data-lucide", "shield-alert");
    ui.adviceIconContainer.style.animationName = "pulse-warning";
    document.body.classList.remove("danger-active");
  } else {
    ui.adviceIcon.setAttribute("data-lucide", "shield-x");
    ui.adviceIconContainer.style.animationName = "pulse-danger";
    document.body.classList.add("danger-active");
  }
}

const historyRef = query(ref(db, "AQUA/History"), limitToLast(50));
onValue(historyRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    const labels = [];
    const waterData = [];
    const soilData = [];
    const rainData = [];

    const dataArray = Object.values(data).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    dataArray.forEach((entry) => {
      if (entry.timestamp) {
        const dateObj = new Date(entry.timestamp);
        const timeLabel = dateObj.toLocaleTimeString("id-ID", {
          hour: "2-digit", minute: "2-digit", hour12: false,
        });
        labels.push(timeLabel);
      } else {
        labels.push("??:??");
      }

      let w = parseFloat(entry.water);
      if (w > 900 || isNaN(w)) w = 0;
      waterData.push(w);
      soilData.push(entry.soil);

      let rRaw = parseFloat(entry.rain || 4095);
      let rPct = Math.round(((4095 - rRaw) / 4095) * 100);
      if (rPct < 0) rPct = 0;
      rainData.push(rPct);
    });

    if (myChart) {
      myChart.data.labels = labels;
      myChart.data.datasets[0].data = waterData;
      myChart.data.datasets[1].data = soilData;
      myChart.data.datasets[2].data = rainData;
      myChart.update("none");
    }
  }
});

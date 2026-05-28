/* =====================================================
   SCROLL-ANIMATIONER
===================================================== */

const observer = new IntersectionObserver((entries) => {

  entries.forEach(entry => {

    if(entry.isIntersecting){

      entry.target.classList.add("in");

    }

  });

},{
  threshold:0.15
});

document.querySelectorAll(".animate").forEach(element => {

  observer.observe(element);

});


/* =====================================================
   KALKYLATOR
===================================================== */

function calculateSavings(){

  const consumption =
    parseFloat(
      document.getElementById("consumption").value
    ) || 0;

  const price =
    parseFloat(
      document.getElementById("price").value
    ) || 0;

  const area =
    parseFloat(
      document.getElementById("area").value
    ) || 0;

  const regionFactor =
    parseFloat(
      document.getElementById("region").value
    );


  /* =========================================
     BERÄKNINGAR
  ========================================== */

  const production =
    area * 150 * regionFactor;


  const coverage = consumption > 0
    ? Math.min(production / consumption, 1)
    : 0;


  const yearlySaving =
    production * price;


  const installationCost =
    area * 2000;


  const paybackTime =
    yearlySaving > 0
      ? (installationCost / yearlySaving).toFixed(1)
      : "–";


  /* =========================================
     SKRIV RESULTAT TILL HTML
  ========================================== */

  document.getElementById("productionResult")
    .textContent =
      Math.round(production).toLocaleString("sv-SE")
      + " kWh";


  document.getElementById("coverageResult")
    .textContent =
      Math.round(coverage * 100)
      + " %";


  document.getElementById("savingResult")
    .textContent =
      Math.round(yearlySaving).toLocaleString("sv-SE")
      + " kr";


  document.getElementById("paybackResult")
    .textContent =
      paybackTime + " år";


  document.getElementById("resultBox")
    .classList.add("show");


  updateChart(consumption, production);

}


/* =====================================================
   KALKYLATOR-GRAF
===================================================== */

const consumptionProfile = [
  0.11,0.10,0.10,0.08,
  0.07,0.06,0.06,0.06,
  0.07,0.09,0.10,0.10
];

const solarProfile = [
  0.02,0.03,0.07,0.10,
  0.13,0.14,0.14,0.12,
  0.09,0.07,0.04,0.05
];

const months = [
  "Jan","Feb","Mar","Apr",
  "Maj","Jun","Jul","Aug",
  "Sep","Okt","Nov","Dec"
];


const ctx =
  document.getElementById("energyChart")
  .getContext("2d");


const chart = new Chart(ctx,{

  type:"bar",

  data:{

    labels:months,

    datasets:[

      {
        label:"Förbrukning",

        data:
          consumptionProfile.map(value =>
            Math.round(value * 20000)
          ),

        backgroundColor:
          "rgba(21,101,192,0.75)"
      },

      {
        label:"Solproduktion",

        data:
          solarProfile.map(value =>
            Math.round(value * 5000)
          ),

        backgroundColor:
          "rgba(79,195,247,0.85)"
      }

    ]

  },

  options:{

    responsive:true,

    plugins:{
      legend:{
        position:"bottom"
      }
    }

  }

});


function updateChart(yearlyConsumption, yearlyProduction){

  chart.data.datasets[0].data =
    consumptionProfile.map(value =>
      Math.round(value * yearlyConsumption)
    );


  chart.data.datasets[1].data =
    solarProfile.map(value =>
      Math.round(value * yearlyProduction)
    );


  chart.update();

}


/* =====================================================
   KONTAKTFORMULÄR
===================================================== */

function sendForm(event){

  event.preventDefault();

  alert("Tack! Vi kontaktar dig inom 24 timmar.");

  event.target.reset();

}


/* =====================================================
   MOBILMENY
===================================================== */

const menuBtn =
  document.getElementById("menuBtn");

const navLinks =
  document.getElementById("navLinks");


menuBtn.addEventListener("click", () => {

  navLinks.classList.toggle("open");

});


function closeMenu(){

  navLinks.classList.remove("open");

}


/* =====================================================
   LIVE ELPRIS & GRAF (Korrigerad ordning)
===================================================== */

const today = new Date();
const year = today.getFullYear(); 
const month = String(today.getMonth() + 1).padStart(2, "0"); 
const day = String(today.getDate()).padStart(2, "0"); 

const apiUrl = `https://www.elprisetjustnu.se/api/v1/prices/${year}/${month}-${day}_SE3.json`;

fetch(apiUrl)
  .then(response => {
    if (!response.ok) throw new Error("Hittade inga priser för dagens datum.");
    return response.json();
  })
  .then(data => {
    const currentHour = new Date().getHours();
    const currentPrice = data[currentHour] ? data[currentHour].SEK_per_kWh : data[0].SEK_per_kWh;

    document.getElementById("livePrice").textContent =
      currentPrice.toFixed(2) + " kr/kWh";
  })
  .catch(error => {
    document.getElementById("livePrice").textContent = "API-fel";
    console.error("Fel vid hämtning av livepris:", error);
  });

fetch(apiUrl)
  .then(response => {
    if (!response.ok) throw new Error("Hittade inga priser för grafen.");
    return response.json();
  })
  .then(data => {
    const labels = data.map(price =>
      price.time_start.substring(11, 16)
    );

    const prices = data.map(price =>
      price.SEK_per_kWh
    );

    const priceCtx = document.getElementById("priceChart").getContext("2d");

    new Chart(priceCtx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "kr/kWh",
          data: prices,
          borderColor: "#4fc3f7",
          backgroundColor: "rgba(79,195,247,0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: "#ffffff"
            },
            grid: {
              color: "rgba(255,255,255,0.08)"
            }
          },
          y: {
            beginAtZero: false,
            ticks: {
              color: "#ffffff"
            },
            grid: {
              color: "rgba(255,255,255,0.08)"
            }
          }
        }
      }
    });
  })
  .catch(error => {
    console.error("Fel vid hämtning av prisgraf:", error);
  });

/* =====================================================
   KARTA – ÅVA GYMNASIUM
===================================================== */
const map = L.map("contactMap").setView([59.440671, 18.062999], 15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>;'
  }).addTo(map);
  L.marker([59.440671, 18.062999])
  .addTo(map)
  .bindPopup(
    "<strong>EasySolar</strong><br>Åva skolgränd 1–3<br>Täby"
  )
  .openPopup();




/* =====================================================
   SCROLL-ANIMATIONER
===================================================== */

/*
  IntersectionObserver håller koll på när
  element syns på skärmen.

  När ett element kommer in i viewporten
  läggs klassen "in" till.
*/
const observer = new IntersectionObserver((entries) => {

  entries.forEach(entry => {

    /*
      isIntersecting = true
      betyder att elementet är synligt.
    */
    if(entry.isIntersecting){

      entry.target.classList.add("in");

    }

  });

},{
  threshold:0.15
});


/*
  Vi väljer alla element som har
  klassen "animate".
*/
document.querySelectorAll(".animate").forEach(element => {

  observer.observe(element);

});



/* =====================================================
   KALKYLATOR
===================================================== */

/*
  Funktionen körs när användaren klickar
  på "Beräkna".
*/
function calculateSavings(){

  /*
    parseFloat gör om text till nummer.

    || 0 betyder:
    Om inputfältet är tomt används 0 istället.
  */
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

  /*
    Ungefärlig årsproduktion:

    1 m² ≈ 150 kWh/år
  */
  const production =
    area * 150 * regionFactor;


  /*
    Hur stor del av hushållets
    elförbrukning som täcks.

    Math.min används för att
    värdet aldrig ska bli över 100%.
  */
  const coverage = consumption > 0
    ? Math.min(production / consumption, 1)
    : 0;


  /*
    Pengar som sparas per år.
  */
  const yearlySaving =
    production * price;


  /*
    Väldigt förenklad installationskostnad.
  */
  const installationCost =
    area * 2000;


  /*
    Återbetalningstid i år.

    toFixed(1) rundar till 1 decimal.
  */
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


  /*
    Gör resultatboxen synlig.
  */
  document.getElementById("resultBox")
    .classList.add("show");


  /*
    Uppdaterar diagrammet.
  */
  updateChart(consumption, production);

}



/* =====================================================
   CHART.JS
===================================================== */

/*
  Fördelning över årets månader.

  Totalt = 100%
*/
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


/* Månader */
const months = [
  "Jan","Feb","Mar","Apr",
  "Maj","Jun","Jul","Aug",
  "Sep","Okt","Nov","Dec"
];


/*
  Hämtar canvas-elementet.
*/
const ctx =
  document.getElementById("energyChart")
  .getContext("2d");


/*
  Skapar diagrammet.
*/
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


/*
  Uppdaterar diagrammet
  efter användarens siffror.
*/
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

/*
  Hindrar sidan från att laddas om
  när formuläret skickas.
*/
function sendForm(event){

  event.preventDefault();

  /*
    Enkel feedback till användaren.
  */
  alert("Tack! Vi kontaktar dig inom 24 timmar.");

  /*
    Rensar formuläret.
  */
  event.target.reset();

}



/* =====================================================
   MOBILMENY
===================================================== */

/* Hämtar elementen */
const menuBtn =
  document.getElementById("menuBtn");

const navLinks =
  document.getElementById("navLinks");


/*
  Öppnar/stänger menyn.
*/
menuBtn.addEventListener("click", () => {

  navLinks.classList.toggle("open");

});


/*
  Stänger menyn när man klickar
  på en länk.
*/
function closeMenu(){

  navLinks.classList.remove("open");

}

/* =====================================================
   LIVE ELPRIS API
===================================================== */

/*
  Hämtar nuvarande elpris.
*/
fetch("https://www.elprisetjustnu.se/api/v1/prices/current.json?zone=SE3")

  .then(response => response.json())

  .then(data => {

    document.getElementById("livePrice")
      .textContent =
        data.SEK_per_kWh.toFixed(2) + " kr/kWh";

  })

  .catch(error => {

    document.getElementById("livePrice")
      .textContent = "Kunde inte hämta elpris";

    console.error(error);

  });




/* =====================================================
   GRAF ÖVER DAGENS ELPRIS
===================================================== */

/*
  Hämtar dagens datum automatiskt.
*/
const today = new Date();

const year = today.getFullYear();

const month =
  String(today.getMonth() + 1)
  .padStart(2, "0");

const day =
  String(today.getDate())
  .padStart(2, "0");


/*
  API-format:
  YYYY-MM-DD_SE3.json
*/
const apiUrl =
  `https://www.elprisetjustnu.se/api/v1/prices/${year}-${month}-${day}_SE3.json`;


/*
  Hämtar dagens priser.
*/
fetch(apiUrl)

  .then(response => response.json())

  .then(data => {

    /*
      Tider för X-axeln.
    */
    const labels = data.map(price =>

      price.time_start.substring(11,16)

    );


    /*
      Prisdata.
    */
    const prices = data.map(price =>

      price.SEK_per_kWh

    );


    /*
      Skapar grafen.
    */
    const priceCtx =
  document.getElementById("priceChart")
  .getContext("2d");

  new Chart(

  priceCtx,

      {

        type:"line",

        data:{

          labels:labels,

          datasets:[{

            label:"kr/kWh",

            data:prices,

            borderColor:"#1565c0",

            backgroundColor:"rgba(79,195,247,0.15)",

            fill:true,

            tension:0.35

          }]

        },

        options:{

          responsive:true,

          plugins:{
            legend:{
              display:false
            }
          },

          scales:{

            y:{
              beginAtZero:false
            }

          }

        }

      }

    );

  })

  .catch(error => {

    console.error(error);

  });

  /* =====================================================
   LIVE ELPRIS API
===================================================== */

/*
  Hämtar nuvarande elpris.
*/
fetch("https://www.elprisetjustnu.se/api/v1/prices/current.json?zone=SE3")

  .then(response => response.json())

  .then(data => {

    document.getElementById("livePrice")
      .textContent =
        data.SEK_per_kWh.toFixed(2) + " kr/kWh";

  })

  .catch(error => {

    document.getElementById("livePrice")
      .textContent = "Kunde inte hämta elpris";

    console.error(error);

  });





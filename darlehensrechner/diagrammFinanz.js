function tilgungs_diagramm(){

    var zinssatz=document.getElementById('feld_zinssatz').value;
    var anzahl=document.getElementById('feld_dauer').value;
    var dahrlehensbetrag=document.getElementById('feld_darlehensbetrag').value;
    var annuitaet=document.getElementById('feld_monatlicheRate').value;
    var rueckzahlungstermine=0;
    var rechnungsart=darlehen_was_ist_gesucht(zinssatz,anzahl,dahrlehensbetrag,annuitaet);
    if (document.getElementById('monatlich').checked==true){
        rueckzahlungstermine=12;
    }
    if (document.getElementById('jaehrlich').checked==true){
        rueckzahlungstermine=1;
    }
    zinssatz=zinssatz/rueckzahlungstermine;			//Zinssatz auf Termine umrechnen

    if (rechnungsart == "fehler"){
        alert("Keine Erstellung des Diagrammes möglich, überprüfen Sie die Angaben!\nGib bitte mindestens 3 der dafür nötigen Felder ein.");
    }
    else{
        erstellung_tilgungs_plan(dahrlehensbetrag, anzahl, zinssatz, annuitaet);
        suche_tilgung_annuitaet_anzahl(dahrlehensbetrag, zinssatz, annuitaet, anzahl);
    }
}

function suche_tilgung_annuitaet_anzahl(dahrlehensbetrag, zinssatz, annuitaet, anzahl){
    console.log("IN SUCHE TILGUNG!");
    if (zinssatz == 0){
        zinssatz = darlehen_zinssatz_berechnen(dahrlehensbetrag, annuitaet, anzahl, 0)/12*rueckzahlungstermine;
        console.log("Zinssatz: ", zinssatz);
    }
    else if (annuitaet == 0){
        annuitaet = darlehen_funktionen_annuitaet(zinssatz, anzahl, dahrlehensbetrag, 0);
        console.log("Annuität: ", annuitaet);
    }
    else if(anzahl == 0){
        anzahl = dauerRechnen(dahrlehensbetrag, zinssatz, annuitaet);
        console.log("Anzahl: ", anzahl);
    }

    anzahl = parseInt(anzahl);
    let anzahl2 = anzahl;   //+anzahl weil immer ein bisschen mehr werte auf der x achse angeben
        anzahl2 = anzahl2 + 1;
        console.log("ANZAHL2 DAVOR: ", anzahl2);
    let anzahl_diagramm = [];
    annuitaet = parseInt(annuitaet);
    let annuitaet_diagramm = [];

    for(let i = 0; anzahl_diagramm.length <= anzahl2; i++){
        anzahl_diagramm[i] = i;
        annuitaet_diagramm[i - 1] = annuitaet;
        console.log("ANZAHL AUSGABE FÜR DIAGRAMM: ", anzahl_diagramm[i]);
        console.log("ANZAHL: ", anzahl);
        console.log("ANZAHL2: ", anzahl2);
    }

    zinssatz = zinssatz/100;
    let zinszahlung = [];
    let tilgung = [];
    let restbetrag = dahrlehensbetrag;

    for (let i = 0; restbetrag >= 0; i++){
        zinszahlung[i] = restbetrag * zinssatz;
        console.log("ZINSZAHLUNG: ", zinszahlung[i]);
        tilgung[i] = annuitaet - zinszahlung[i];
        console.log("TILGUNG: ", tilgung[i]);
        restbetrag = restbetrag - tilgung[i];
        console.log("RESTBETRAG: ", restbetrag);
    }


    erstellung_diagramm(tilgung, annuitaet, annuitaet_diagramm, zinszahlung, zinssatz, anzahl, anzahl_diagramm);
    return;
}

function erstellung_diagramm(tilgung, annuitaet, annuitaet_diagramm, zinszahlung, zinssatz, anzahl, anzahl_diagramm){
    var xValues = anzahl_diagramm;
    var yValues = [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000];

    document.getElementById('tilgungs_diagramm').style.display = "block";

    new Chart("myChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                data: tilgung, yValues,
                borderColor: "rgba(255,0,0,0.7)",
                fill: true
            }, {
                data: zinszahlung, yValues,
                borderColor: "rgba(0,255,0,0.7)",
                fill: true
            }, {
                data: annuitaet_diagramm, yValues,
                borderColor: "rgba(0,0,255,0.7)",
                fill: true
            }]
        },
        options: {
            legend: {display: false}
        }
    });
    return;
}


function erstellung_tilgungs_plan(dahrlehensbetrag, anzahl, zinssatz, annuitaet){


    const columnDefs = [
        { field: "Monat" },
        { field: "Schulden" },
        { field: "Annuitaet" },
        { field: "Zins_Zahlung" },
        { field: "Tilgungs_Zahlung"},
        { field: "Rest_Schulden" }
    ];
    let rowData = [];
    let p = null;

    let gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData
    };
    let d = document.getElementById('tilgungs_plan');
    document.getElementById('tilgungs_plan').style.display = "block"; //lässt es wieder erscheinen
    dahrlehensbetrag= parseFloat(parseFloat(dahrlehensbetrag).toFixed(2));
    anzahl = parseFloat(anzahl);
    console.log("ANZAHL IN TABELLE: ", anzahl);
    annuitaet = parseFloat(parseFloat(annuitaet).toFixed(2));
    let zinsen = parseFloat((dahrlehensbetrag * zinssatz / 100).toFixed(2));
    let schulden = parseFloat(dahrlehensbetrag.toFixed(2));
    for (let i = 0; i < anzahl; i++) {
        schulden = parseFloat((schulden - annuitaet + zinsen).toFixed(2));
        if(schulden < 0 || i === anzahl-1){
            schulden = 0
        }
        console.log("GEATS?")
        rowData.push({Monat: i, Schulden: dahrlehensbetrag, Annuitaet: annuitaet, Zins_Zahlung: zinsen, Tilgungs_Zahlung: (annuitaet-zinsen).toFixed(2), Rest_Schulden : schulden})
        dahrlehensbetrag = schulden;
        zinsen = parseFloat((schulden * zinssatz / 100).toFixed(2));
    }
    if(p != null){
        d.innerHTML = '';
    }
    p = new agGrid.Grid(d, gridOptions);
    return;
}


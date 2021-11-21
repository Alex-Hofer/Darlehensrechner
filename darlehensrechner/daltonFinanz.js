function darlehen_berechnen(){

    var restschuld=0;
    var zinssatz=document.getElementById('feld_zinssatz').value;
    var anzahl=document.getElementById('feld_dauer').value;
    var dahrlehensbetrag=document.getElementById('feld_darlehensbetrag').value;
    var annuitaet=document.getElementById('feld_monatlicheRate').value;
    var eff_zinssatz=document.getElementById('feld_effZinssatz').value;
    var kosten_pro_rate=document.getElementById('feld_kostenProRate').value;
    var rueckzahlungstermine=0;

    if (document.getElementById('monatlich').checked==true){    //Radio Button auf Monat
        rueckzahlungstermine=12;
    }
    if (document.getElementById('jaehrlich').checked==true){    //Radio Button auf Jahr
        rueckzahlungstermine=1;
    }
    zinssatz=zinssatz/rueckzahlungstermine;			//Zinssatz auf Termine umrechnen


//was ist gefragt?
    var rechnungsart=darlehen_was_ist_gesucht(zinssatz,anzahl,dahrlehensbetrag,annuitaet);
    console.log(rechnungsart);
    if (rechnungsart=="fehler"){
        alert("Keine Berechnung möglich, überprüfen Sie die Angaben!\nGib bitte mindestens 3 der dafür nötigen Felder ein.");
    }

    else if (rechnungsart=="annuitaet"){
        annuitaet=darlehen_funktionen_annuitaet(zinssatz,anzahl,dahrlehensbetrag,0);
        document.getElementById('feld_monatlicheRate').value=annuitaet.toFixed(2);
        console.log("ANNUITÄT: ", annuitaet);
    }

    else if (rechnungsart=="dahrlehensbetrag"){
        dahrlehensbetrag=darlehen_funktionen_dahrlehensbetrag(annuitaet,anzahl,zinssatz,0);
        document.getElementById('feld_darlehensbetrag').value=dahrlehensbetrag.toFixed(2);
    }

    else if (rechnungsart=="zinssatz"){
        zinssatz=darlehen_zinssatz_berechnen(dahrlehensbetrag, annuitaet, anzahl, 0)/12*rueckzahlungstermine;
        document.getElementById('feld_zinssatz').value=zinssatz.toFixed(3);
        zinssatz=zinssatz/rueckzahlungstermine;			// - wieder korrigieren - Zinssatz auf Termine umrechnen
    }

    else if (rechnungsart=="anzahl"){
        let anzahl = dauerRechnen(dahrlehensbetrag, zinssatz, annuitaet);
        document.getElementById('feld_dauer').value=anzahl;
        console.log("ANZAHL: ", anzahl);
        darlehen_funktionen_annuitaet(zinssatz, anzahl, dahrlehensbetrag);
    }


    let gesZinsen = 0;
    let gesGezahlt = 0;
    restschuld=dahrlehensbetrag;
    for (i=0;i<=anzahl-1;i++){
        kapitalquote =kap_quote(zinssatz, restschuld, annuitaet);
        zinsquote = annuitaet-kapitalquote;
        if((restschuld-kapitalquote) < kapitalquote){
            console.log("RESTINNEN :", restschuld, "i: ", i);
            restschuld = restschuld-restschuld; //wenn man nicht genügend , stellen eingibt kommt manchmal als leste restschuld 1,20$ heraus, ...
            gesGezahlt = gesGezahlt + restschuld; //Man muss die 1,20$ auch dazurechnen
        }
        else {
            restschuld = restschuld - kapitalquote;
            gesGezahlt = gesGezahlt + zinsquote + kapitalquote;
            gesZinsen = gesZinsen + zinsquote;
        }

        console.log("ANZAHL: ", anzahl, "i: ", i)
        //gesGezahlt = gesGezahlt + zinsquote + kapitalquote;
        //gesZinsen = gesZinsen + zinsquote;

        annuitaet_=annuitaet;
        kapitalquote_=kapitalquote.toFixed(2);
        zinsquote_=zinsquote.toFixed(2);
    }

    document.getElementById('feld_gesGezahlt').value=gesGezahlt.toFixed(2);
    document.getElementById('feld_gesamtzinsen').value=gesZinsen.toFixed(2);

    if(annuitaet !== ""){
        //effektiven Zinssatz berechnen
        annuitaet = annuitaet * 1 + kosten_pro_rate * 1;
        eff_zinssatz=darlehen_zinssatz_berechnen(dahrlehensbetrag,annuitaet,anzahl,0)/12*rueckzahlungstermine;
        //document.getElementById('field_eff_zinssatz').value=eff_zinssatz.fixedDigits(3,trennzeichen_komma,trennzeichen_tausender,trennzeichen_komma);
        //field_eff_zinssatz_pangv berechnnen
        eff_zinssatz_pangv=Math.pow((1+eff_zinssatz/12/100),12);
        eff_zinssatz_pangv=(eff_zinssatz_pangv-1)*100;
        document.getElementById('feld_effZinssatz').value=eff_zinssatz_pangv.toFixed(3);

    console.log(zinssatz);
    console.log(dahrlehensbetrag);
    console.log(anzahl);
    console.log(annuitaet);
    }
}


function kap_quote(zinssatz, restschuld, rate){

    var kapitalquote;
    kapitalquote=rate-(restschuld*zinssatz/100);
    return kapitalquote;
}


function darlehen_funktionen_annuitaet(zinssatz, anzahl,dahrlehensbetrag,zahlungsbeginn){
    var rate;
    var zwischenspeicher;
    var zwischenspeicher_1;

    //rate=dahrlehensbetrag*Math.pow(zwischenspeicher,anzahl)*((zwischenspeicher-1)/(Math.pow(zwischenspeicher,anzahl)-1));
    //neue Berechnung

    zinssatz=zinssatz/100;
    zwischenspeicher=Math.pow(1+zinssatz,anzahl);
    zwischenspeicher_1=Math.pow(1+zinssatz*zahlungsbeginn,anzahl);
    rate=(-zinssatz * (dahrlehensbetrag*zwischenspeicher))/(zwischenspeicher_1*zwischenspeicher-1);
    rate=rate*-1;

    return rate;
}


function darlehen_was_ist_gesucht(zinssatz,anzahl,dahrlehensbetrag,annuitaet){
    var berechnungsart;
    var angaben=0;

    console.log("Was wird gesucht: " );

    if(zinssatz==0){
        angaben++;
    }
    if(anzahl==0){
        angaben++;
    }
    if(annuitaet==0){
        angaben++;
    }
    if(dahrlehensbetrag==0){
        angaben++;
    }
    if (angaben==0){        //wenn alle Angaben gegeben, trotzdem berechnen, es könnte eine Angabenänderung erfolgt sein
        annuitaet=0;
        angaben++;
    }
    if(angaben > 1){
        return("fehler");
        console.log("Fehler!");
    }
    else {
        if(zinssatz==0){
            berechnungsart="zinssatz";
            console.log("Zinssatz");
        }
        if(anzahl==0){
            berechnungsart="anzahl";
            console.log("Anzahl");
        }
        if(annuitaet==0){
            berechnungsart="annuitaet";
            console.log("Annuität");
        }
        if(dahrlehensbetrag==0){
            berechnungsart="dahrlehensbetrag";
            console.log("Dahrlehensbetrag");
        }
    }
    return(berechnungsart);
}



function darlehen_zinssatz_berechnen(dahrlehensbetrag, rate, anzahl, zahlungsbeginn){
    var zinssatz_local=10;
    var rate_annaeherung=0;
    var annaeherungsfaktor=100;

//annäherungsweise den zinssatz bestimmen

    for (i=0; i<8;i++){
        annaeherungsfaktor=annaeherungsfaktor/10;
        if (rate_annaeherung < rate){
            while (rate_annaeherung < rate){
                zinssatz_local=zinssatz_local+annaeherungsfaktor;
                if (zinssatz_local==0){ //würde eine Rate = NA ergeben, daher geringe korrektur
                    zinssatz_local=zinssatz_local-annaeherungsfaktor/10;
                }
                rate_annaeherung=darlehen_funktionen_annuitaet(zinssatz_local/12, anzahl, dahrlehensbetrag, zahlungsbeginn);
            }
        }
        else {
            while (rate_annaeherung > rate){
                zinssatz_local=zinssatz_local-annaeherungsfaktor;
                if (zinssatz_local==0){ //würde eine Rate = NA ergeben, daher geringe korrektur
                    zinssatz_local=zinssatz_local+annaeherungsfaktor/10;
                }
                rate_annaeherung=darlehen_funktionen_annuitaet(zinssatz_local/12, anzahl, dahrlehensbetrag, zahlungsbeginn);
            }
        }
        if (rate==rate_annaeherung){break;}
    }
    //return rate_annaeherung;
    return zinssatz_local;
}



function darlehen_funktionen_dahrlehensbetrag(annuitaet, anzahl, zinssatz, zahlungsbeginn){
    var dahrlehensbetrag=0;
    var zwischenergebnis_1=0;
    var zwischenergebnis_2=0;
    zinssatz=zinssatz/100;
    //zwischenergebnis_1=(Math.pow(1+zinssatz,anzahl))-1;
    //zwischenergebnis_2=(Math.pow(1+zinssatz,anzahl))*zinssatz;
    //dahrlehensbetrag=annuitaet*(zwischenergebnis_1/zwischenergebnis_2);

    zwischenergebnis_1=(Math.pow(1+zinssatz,anzahl));
    zwischenergebnis_2=((zwischenergebnis_1-1)/zinssatz);
    //dahrlehensbetrag=(rate*(1+zinssatz*zahlungsbeginn)*zwischenergebnis_2)/zwischenergebnis_1;
    dahrlehensbetrag=((annuitaet*(1+zinssatz*zahlungsbeginn)*zwischenergebnis_2))/zwischenergebnis_1;
    return dahrlehensbetrag;
}


function dauerRechnen(dahrlehensbetrag, zinssatz, annuitaet){   //formel: laufzeit=-(ln(1+(i*S0)/R)/ln(q))
    var laufzeit = 0, i = zinssatz*0.01, s0 = dahrlehensbetrag, r = annuitaet;

    console.log(Math.log(1-((i*s0)/r)));
    console.log("ZINSSATZ: ", zinssatz);
    console.log(Math.log(i+1));

    laufzeit = -((Math.log(1-(i*s0)/r))/(Math.log(i+1)));

    console.log("Laufzeit/Dauer: ", laufzeit);

    return laufzeit;
}
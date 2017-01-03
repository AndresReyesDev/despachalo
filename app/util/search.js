'use strict';

module.exports = {
  comunasCDCH: comunasCDCH,
  comunasCXP: comunasCXP,
  regionesCXP: regionesCXP
};

function regionesCXP(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (parseInt(myArray[i].identificadorDSPL) == parseInt(nameKey)) {	
            return i;
        }
        if (parseInt(myArray[i].identificadorDSPL) == 13 && nameKey.trim() == 'M') {
        	return i
        }
    }
}

function comunasCDCH(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].nombreDSPL == nameKey){
            return i;
        }
        if (myArray[i].nombreDSPL == 'PAIHUANO' && nameKey == 'PAIGUANO') {
        	return i
        }
        if (myArray[i].nombreDSPL == "O'HIGGINS" && nameKey == 'O"HIGGINS') {
        	return i
        }
    }
}

function comunasCXP(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].nombreDSPL == nameKey){
            return i;
        }
        if (myArray[i].nombreDSPL == 'ÑUÑOA' && nameKey == 'NUNOA') {
        	return i
        }
        if (myArray[i].nombreDSPL == "AYSEN" && nameKey == 'AISEN') {
        	return i
        }
        if (myArray[i].nombreDSPL == "CAÑETE" && nameKey == 'CANETE') {
        	return i
        }
        if (myArray[i].nombreDSPL == "CHAÑARAL" && nameKey == 'CHANARAL') {
        	return i
        }
        if (myArray[i].nombreDSPL == "DOÑIHUE" && nameKey == 'DONIHUE') {
        	return i
        }
        if (myArray[i].nombreDSPL == "CALERA" && nameKey == 'LA CALERA') {
        	return i
        }
        if (myArray[i].nombreDSPL == "LLAILLAY" && nameKey == 'LLAY LLAY') {
        	return i
        }
        if (myArray[i].nombreDSPL == "MARCHIHUE" && nameKey == 'MARCHIGUE') {
        	return i
        }
        if (myArray[i].nombreDSPL == "PEÑAFLOR" && nameKey == 'PENAFLOR') {
        	return i
        }
        if (myArray[i].nombreDSPL == "PEÑALOLEN" && nameKey == 'PENALOLEN') {
        	return i
        }
        if (myArray[i].nombreDSPL == "PLACILLA" && nameKey == 'PLACILLA SEXTA REGION') {
        	return i
        }
		if (myArray[i].nombreDSPL == "MOSTAZAL" && nameKey == 'SAN FRANCISCO DE MOSTAZAL') {
        	return i
        }
        if (myArray[i].nombreDSPL == "SAN VICENTE" && nameKey == 'SAN VICENTE DE TAGUA TAGUA') {
        	return i
        }
        if (myArray[i].nombreDSPL == "SANTIAGO" && nameKey == 'SANTIAGO CENTRO') {
        	return i
        }
        if (myArray[i].nombreDSPL == "TILTIL" && nameKey == 'TIL TIL') {
        	return i
        }
        if (myArray[i].nombreDSPL == "VICUÑA" && nameKey == 'VICUNA') {
        	return i
        }
        if (myArray[i].nombreDSPL == "VIÑA DEL MAR" && nameKey == 'VINA DEL MAR') {
        	return i
        }
    }
}
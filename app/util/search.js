'use strict';

module.exports = {
  communesCDCH: communesCDCH,
  communesCXP: communesCXP,
  regionsCXP: regionsCXP
};

function regionsCXP(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (parseInt(myArray[i].idDSPL) == parseInt(nameKey)) {	
            return i;
        }
        if (parseInt(myArray[i].idDSPL) == 13 && nameKey.trim() == 'M') {
        	return i
        }
    }
}

function communesCDCH(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].nameDSPL == nameKey){
            return i;
        }
        if (myArray[i].nameDSPL == 'PAIHUANO' && nameKey == 'PAIGUANO') {
        	return i
        }
        if (myArray[i].nameDSPL == "O'HIGGINS" && nameKey == 'O"HIGGINS') {
        	return i
        }
    }
}

function communesCXP(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].nameDSPL == nameKey){
            return i;
        }
        if (myArray[i].nameDSPL == 'ÑUÑOA' && nameKey == 'NUNOA') {
        	return i
        }
        if (myArray[i].nameDSPL == "AYSEN" && nameKey == 'AISEN') {
        	return i
        }
        if (myArray[i].nameDSPL == "CAÑETE" && nameKey == 'CANETE') {
        	return i
        }
        if (myArray[i].nameDSPL == "CHAÑARAL" && nameKey == 'CHANARAL') {
        	return i
        }
        if (myArray[i].nameDSPL == "DOÑIHUE" && nameKey == 'DONIHUE') {
        	return i
        }
        if (myArray[i].nameDSPL == "CALERA" && nameKey == 'LA CALERA') {
        	return i
        }
        if (myArray[i].nameDSPL == "LLAILLAY" && nameKey == 'LLAY LLAY') {
        	return i
        }
        if (myArray[i].nameDSPL == "MARCHIHUE" && nameKey == 'MARCHIGUE') {
        	return i
        }
        if (myArray[i].nameDSPL == "PEÑAFLOR" && nameKey == 'PENAFLOR') {
        	return i
        }
        if (myArray[i].nameDSPL == "PEÑALOLEN" && nameKey == 'PENALOLEN') {
        	return i
        }
        if (myArray[i].nameDSPL == "PLACILLA" && nameKey == 'PLACILLA SEXTA REGION') {
        	return i
        }
		if (myArray[i].nameDSPL == "MOSTAZAL" && nameKey == 'SAN FRANCISCO DE MOSTAZAL') {
        	return i
        }
        if (myArray[i].nameDSPL == "SAN VICENTE" && nameKey == 'SAN VICENTE DE TAGUA TAGUA') {
        	return i
        }
        if (myArray[i].nameDSPL == "SANTIAGO" && nameKey == 'SANTIAGO CENTRO') {
        	return i
        }
        if (myArray[i].nameDSPL == "TILTIL" && nameKey == 'TIL TIL') {
        	return i
        }
        if (myArray[i].nameDSPL == "VICUÑA" && nameKey == 'VICUNA') {
        	return i
        }
        if (myArray[i].nameDSPL == "VIÑA DEL MAR" && nameKey == 'VINA DEL MAR') {
        	return i
        }
    }
}
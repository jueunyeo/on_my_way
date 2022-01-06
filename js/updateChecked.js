
exports.hourSelected = function(endTime){
  let hours = ["", "", "", "", "", ""];
  let now = new Date();
  let hour = endTime - now;
  hour = Math.floor((hour % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (hour >= 0){
    switch(hour){
      case 0:
      hours[0] = "selected";
      break;
      case 1:
      hours[1] = "selected";
      break;
      case 2:
      hours[2] = "selected";
      break;
      case 3:
      hours[3] = "selected";
      break;
      case 4:
      hours[4] = "selected";
      break;
      case 5:
      hours[5] = "selected";
      break;
    }
  }else{
    hours[0] = "selected";
  }
  //console.log(hours);
  return hours;
}

exports.minuteSelected = function(endTime){
  let minutes = ["", "", "", "", "", "", "", "", "", "", "", ""]
  let now = new Date();
  let minute = endTime - now;
  minute = Math.floor((minute % (1000 * 60 * 60)) / (1000 * 60));
  //console.log(minute);
  if (minute >= 0){
    switch(true){
      case (minute < 5):
      minutes[0] = "selected";
      break;
      case (minute >= 5 && minute < 10):
      minutes[1] = "selected";
      break;
      case (minute >= 10 && minute < 15):
      minutes[2] = "selected";
      break;
      case (minute >= 15 && minute < 20):
      minutes[3] = "selected";
      break;
      case (minute >= 20 && minute < 25):
      minutes[4] = "selected";
      break;
      case (minute >= 25 && minute < 30):
      minutes[5] = "selected";
      break;
      case (minute >= 30 && minute < 35):
      minutes[6] = "selected";
      break;
      case (minute >= 35 && minute < 40):
      minutes[7] = "selected";
      break;
      case (minute >= 40 && minute < 45):
      minutes[8] = "selected";
      break;
      case (minute >= 45 && minute < 50):
      minutes[9] = "selected";
      break;
      case (minute >= 50 && minute < 55):
      minutes[10] = "selected";
      break;
      case (minute >= 55):
      minutes[11] = "selected";
      break;
    }
  }else{
    minutes[0] = "selected";
  }
  //console.log(minutes);
  return minutes;
}

exports.departChecked = function(Depart) {
  let departs = ["", "", "", "", "", "", "", ""]
  switch(Depart){
    case "departNone" :
    departs[0] = "checked";
    break;
    case "departMyHome" :
    departs[1] = "checked";
    break;
    case "departDorm" :
    departs[2] = "checked";
    break;
    case "departFriend" :
    departs[3] = "checked";
    break;
    case "departWork" :
    departs[4] = "checked";
    break;
    case "departSchool" :
    departs[5] = "checked";
    break;
    case "departAcademy" :
    departs[6] = "checked";
    break;
    case "departGathering" :
    departs[7] = "checked";
    break;
  }
  return departs;
}

exports.transitChecked = function(Transit){
  let transits = ["", "", "", ""]
  if (Transit.includes("taxi")){
    transits[0] = "checked";
  }
  if (Transit.includes("subway")){
    transits[1] = "checked";
  }
  if (Transit.includes("bus")){
    transits[2] = "checked";
  }
  if (Transit.includes("foot")){
    transits[3] = "checked";
  }
  return transits;
}

exports.arriveChecked = function(Arrive){
  let arrives = ["", "", "", "", "", "", ""]
  switch(Arrive){
    case "arriveNone" :
    arrives[0] = "checked";
    break;
    case "arriveMyHome" :
    arrives[1] = "checked";
    break;
    case "arriveDorm" :
    arrives[2] = "checked";
    break;
    case "arriveFriend" :
    arrives[3] = "checked";
    break;
    case "arriveWork" :
    arrives[4] = "checked";
    break;
    case "arriveSchool" :
    arrives[5] = "checked";
    break;
    case "arriveAcademy" :
    arrives[6] = "checked";
    break;
    case "arriveGathering" :
    arrives[7] = "checked";
    break;
  }
  return arrives;
}

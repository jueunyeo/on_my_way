
exports.isRemain = function(endTime){
  let now = new Date();
  if((endTime - now) >= 0){
    return true;
  }else{
    return false;
  }
}

exports.getEndTime = function (hour, minute){
  let end = new Date();
  end.setHours(end.getHours() + hour, end.getMinutes() + minute);
  return end;
}

exports.getFirstMessageTime = function (hour, minute){
  let end = new Date();
  end.setHours(end.getHours() + hour, end.getMinutes() + minute + 10);
  return end;
}

exports.getSecondMessageTime = function (hour, minute){
  let end = new Date();
  end.setHours(end.getHours() + hour, end.getMinutes() + minute + 20);
  return end;
}

exports.getThirdMessageTime = function (hour, minute){
  let end = new Date();
  end.setHours(end.getHours() + hour, end.getMinutes() + minute + 30);
  return end;
}

exports.getForthMessageTime = function (hour, minute){
  let end = new Date();
  end.setHours(end.getHours() + hour, end.getMinutes() + minute + 40);
  return end;
}

exports.getFifthMessageTime = function (hour, minute){
  let end = new Date();
  end.setHours(end.getHours() + hour, end.getMinutes() + minute + 50);
  return end;
}

exports.getFinalMessageTime = function (hour, minute){
  let end = new Date();
  end.setHours(end.getHours() + hour, end.getMinutes() + minute + 60);
  return end;
}

exports.progressColor = function(startTime, endTime) {
  let now = new Date();
  if((endTime - now) >= 0){
    return "bg-success";
  }else{
    let bg = 3600;
    let bar = now - endTime;
    bar = Math.floor(bar / 1000);
    let whichColor = (bar / bg) * 100;
    if(whichColor < 50){
      return "bg-warning"
    }else{
      return "bg-danger"
    }
  }
}

exports.progressIntoPercentage = function(startTime, endTime){
  let now = new Date();
  if((endTime - now) >= 0){
    let bg = endTime - startTime;
    bg = Math.floor(bg / 1000);
    let bar = now - startTime;
    bar = Math.floor(bar / 1000);
    return (bar / bg) * 100;
  }else{
    let bg = 3600;
    let bar = now - endTime;
    bar = Math.floor(bar / 1000);
    return (bar / bg) * 100;
  }
}

exports.hourRemainedOver = function(endTime) {
  let now = new Date();
  let gap = endTime - now;
  gap = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (gap >= 0){
    return gap;
  } else{
    return -(gap + 1);
  }
}

exports.minuteRemainedOver = function(endTime) {
  let now = new Date();
  let gap = endTime - now;
  gap = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
  if (gap >= 0){
    return gap;
  } else{
    return -(gap + 1);
  }
}

export function alarmClockExpirationAgo(time) {
  var difference = Math.abs((new Date(time)) - (new Date()));
  var years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));
  var weeks = Math.floor(difference / (1000 * 60 * 60 * 24 * 7));
  var days = Math.floor(difference / (1000 * 60 * 60 * 24 ));
  var hours = Math.floor(difference / (1000 * 60 * 60));
  var minutes = Math.floor(difference / (1000 * 60 ));
  var seconds = Math.floor(difference / (1000));
  if (years > 1 ) {
    return years + ' years';
  } else if (weeks > 1) {
    return weeks + ' weeks';
  } else if (days > 1) {
    return days + ' days';
  } else if (hours > 1) {
    return hours + ' hours';
  } else if (minutes > 1) {
    return minutes + ' minutes';
  }

  return seconds + ' seconds';
}

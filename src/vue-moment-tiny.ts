export default {

  install(Vue, options) {
    Vue.filter('moment', function () {
      var args = Array.prototype.slice.call(arguments),
        input = args.shift(),
        date;

      let dt = new Date(input);

      let month: any = dt.getMonth() + 1;
      if (month < 10) {
        month = `0${month}`;
      }
      let day: any = dt.getDate();
      if (day < 10) {
        day = `0${day}`;
      }
      let hour: any = dt.getHours();
      if (hour < 10) {
        hour = `0${hour}`;
      }
      let minute: any = dt.getMinutes();
      if (minute < 10) {
        minute = `0${minute}`;
      }

      return `${dt.getFullYear()}-${month}-${day} ${hour}:${minute}`;

    });
  }

}

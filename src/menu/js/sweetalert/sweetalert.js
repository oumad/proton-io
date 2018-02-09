/*
 * This makes sure that we can use the global
 * swal() function, instead of swal.default()
 * See: https://github.com/webpack/webpack/issues/3929
 */

if (typeof window !== 'undefined') {
  require(`${__dirname}/menu/js/sweetalert/sweetalert.css`);
}


require(`${__dirname}/menu/js/sweetalert/polyfills`);

var swal = require('./core').default;

module.exports = swal;

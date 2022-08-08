// ==UserScript==
// @name         Point of Contention - Usability Enhancements for Point of Rental
// @namespace    https://www.github.com/acropup/point-of-contention/
// @version      0.3
// @description  Point of Contention is a collection of Javascript and CSS customizations that improve usability, layout, and features of the "Rental Essentials" rental management software at PointOfRental.com
// @homepageURL  https://www.github.com/acropup/point-of-contention
// @author       Shane Burgess
// @match        https://pointofrentalcloud.com/*
// @grant        none
// @noframes
// @require      https://raw.githubusercontent.com/acropup/point-of-contention/master/js/script_execution_mgr.js
// @require      https://raw.githubusercontent.com/acropup/point-of-contention/master/js/por_common.js
// @require      https://raw.githubusercontent.com/acropup/point-of-contention/master/js/por_safety_cover.js
// @require      https://raw.githubusercontent.com/acropup/point-of-contention/master/js/por_all_pages.js
// @require      https://raw.githubusercontent.com/acropup/point-of-contention/master/js/por_p_inventory.js
// @require      https://raw.githubusercontent.com/acropup/point-of-contention/master/js/por_p_item.js
// @require      https://raw.githubusercontent.com/acropup/point-of-contention/master/js/por_p_contract.js
// @require      https://raw.githubusercontent.com/acropup/point-of-contention/master/js/por_p_printouts.js
// ==/UserScript==

// This is the root Tampermonkey script of Point of Contention. All code is
// included via the @require tags above, to allow for easy development.
// https://stackoverflow.com/questions/49509874/how-to-update-tampermonkey-script-to-a-local-file-programmatically
(function() {
  'use strict';

  // This is the last command to run during the initialization phase of all the above @require scripts.
  // If this does not show in the Developer Console on page load, then one of the above scripts has 
  // probably failed and caused the script to end prematurely. Check the console for any unhandled errors.
  console.log('--- This is a Point of Contention ---');
  // Everything that runs after this is a result of event listeners or setTimeout/setInterval events.
})();

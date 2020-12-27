'use strict';
// This file is for functions and variables that are common to many of the other scripts,
// so the contents are intentionally not wrapped as an IIFE (Immediately Invoked Function Expression)

// ifExists is akin to a null-conditional operator (?.) which js only recently implemented.
Element.prototype.ifExists = function(f) { return this ? f(this) : this };

// Standard headers for fetch() commands to Point of Rental
let standardHeaders = {
  "accept": "*/*",
  "accept-language": "en-US,en;q=0.9",
  "accepts": "application/javascript, application/json",
  "cache-control": "no-cache",
  "content-type": "application/json",
  "expires": "-1",
  "pragma": "no-cache",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "x-cloudversion": APP_CONFIG.version,
  "x-requested-with": "XMLHttpRequest"
  };

(function() {
  function pad0(number) {
    var r = String(number);
    if ( r.length === 1 ) {
      r = '0' + r;
    }
    return r;
  }
  // This date format is required for addStockRecord() and possibly elsewhere
  // Returns a string formatted like "2020-01-16 10:35:41"
  Date.prototype.toYMDhmsString = function() {
    return this.getFullYear()
      + '-' + pad0( this.getMonth() + 1 )
      + '-' + pad0( this.getDate() )
      + ' ' + pad0( this.getHours() )
      + ':' + pad0( this.getMinutes() )
      + ':' + pad0( this.getSeconds() );
  };
})();

function focusElement (elem, selectAll = false, overrideExistingFocus = true) {
  // elem parameter can be a DOM Element or a query selector string.
  // selectAll parameter determines whether a cursor is placed or the text is highlighted.
  // overrideExistingFocus, if false, will not change focus if another element already has focus. 
  // Returns -1 if element was not found
  //          0 if element was not selected (only happens if overrideExistingFocus == false)
  //          1 if element was already in focus
  //          2 if element was put into focus
  if (!(elem instanceof HTMLElement)) {
    elem = document.querySelector(elem);
  }
  if (elem) {
    if (document.activeElement === document.body || overrideExistingFocus) {
      if (document.activeElement !== elem) {
        elem.focus({ preventScroll: true });
        if (selectAll) {
          elem.select();
        }
        return 2;
      }
      return 1;
    }
    return 0;
  }
  return -1;
}

function focusElementPartialOverride (elem, selectAll, partialOverride) {
  // Only override focus if the active element is within the partialOverride element.
  // partialOverride parameter can be a DOM Element or a query selector string for a single element.
  // TODO: Allow for a query selector for multiple partialOverride elements
  if (!(partialOverride instanceof HTMLElement)) {
    partialOverride = document.querySelector(partialOverride);
  }
  let override = (partialOverride.contains(document.activeElement));
  return focusElement(elem, selectAll, override);
}

function isHidden (elem) {
  // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  return elem.offsetParent === null;
}
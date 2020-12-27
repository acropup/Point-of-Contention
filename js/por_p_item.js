(function (PoR) {
  'use strict';

  
  PoR.runOnPage.push({
    testPath: (path) => !!path.match(/^item\/\d+$/),
    runScript: () => applySafetyCovers('.tab-tabs[tab="viewItemEditPricing"]:not(.active)')
  });
  PoR.runOnPage.push({
    testPath: (path) => !!path.match(/^item\/\d+$/),
    runScript: addDefaultDateToStockTransaction
  });
  
  function addDefaultDateToStockTransaction() {
    // Check if the Stock tab is active and abort if not
    let stockTab = document.querySelector(".tab-tabs.active[tab='viewItemInventoryLog']");
    if (!stockTab) return false;
    
    //We need to create and dispatch an 'input' event so the 
    //page will do form validation on the new values.
    var event = new Event('input', { bubbles: true, cancelable: true });
    let transDateField = document.querySelector(".datepicker-input[name='LogDateDate']");
    // If transDateField is hidden, it's because the transaction edit window isn't open.
    if (transDateField && transDateField.value === "" && !isHidden(transDateField)) {
      // Ensure that all present fields are empty before inserting defaults
      let transTimeField = document.querySelector(".time-picker[name='LogDateTime']");
      let priceField = document.querySelector("#Price");
      if (transTimeField && transTimeField.value === ""
           && priceField && priceField.value == 0) {
        // If and only if all the fields are empty, insert default values into them
        transDateField.value = (new Date()).toLocaleDateString();
        transDateField.dispatchEvent(event);
        //TODO: Currently transTimeField gets autopopulated by PoR when transDateField is set.
        //      It chooses 5:30pm for the current day, 9:30am for any weekday, and 12:00am for any weekend.
        //      We should probably override this and just set it to the current time % 30 min
        //transTimeField.value = the time;
        //transTimeField.dispatchEvent(event);
        if (priceField) {
          priceField.value = "0.00";
          priceField.dispatchEvent(event);
        }
      }
    }
    //return !!(transDateField && transTimeField && priceField);
    // Even if we were successful, the user might open another transaction
    // dialog and we'd need to set the default date there as well, so this
    // script needs to run forever.
    return false;
  }


})(window.porMod);
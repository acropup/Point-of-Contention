(function (PoR) {
  'use strict';

  PoR.runOnPage.push({
    testPath: (path) => !!path.match(/^workbench\/\d+$/),
    runScript: customizeContractPage
  });
  PoR.runOnPage.push({
    testPath: (path) => !!path.match(/^workbench\/add(\?CustomerId=\d+)?$/),
    runScript: addDefaultDateToNewContract
  });
  PoR.runOnPage.push({
    testPath: (path) => !!path.match(/^workbench\/\d+$/),
    runScript: improveLineItemEditFields
  });
  PoR.runOnPage.push({
    testPath: (path) => !!path.match(/^workbench$/),
    runScript: autoSearchAllTransactions
  });

  function customizeContractPage() {
    //Highlight any non-BC customer province
    let stateProvince = document.querySelector("div.city-line > span.field-State");
    if (stateProvince && stateProvince.innerText !== "BC") {
      stateProvince.classList.add('highlight-transient');
    }
    return !!stateProvince;
  }

  function addDefaultDateToNewContract() {
    //We need to create and dispatch an 'input' event so the 
    //page will do form validation on the new values.

    //TODO: This doesn't seem to work reliably, and form validation continues to fail because it isn't re-run.
    var event = new Event('input', { bubbles: true, cancelable: true });
    let startTimeElem = document.querySelector(".datepicker-input[name='StartTimeDate']");
    if (startTimeElem && startTimeElem.value === "") {
      startTimeElem.value = (new Date()).toLocaleDateString();
      startTimeElem.dispatchEvent(event);
    }
    let durationElem = document.querySelector("#Duration");
    if (durationElem && ['', '0', '0h', '0d', '0w'].includes(durationElem.value)) {
      durationElem.value = "1d";
      durationElem.dispatchEvent(event);
    }
    return !!(startTimeElem && durationElem);
  }

  function improveLineItemEditFields() {
    // When we click to edit a field in a line item, this function
    // will ensure that focus is put on the input box, and the down,
    // up, enter, and escape keys do sensible things.

    let itemTable = document.querySelector(".existing-lineitems");
    if (!itemTable) return false; // Wait until the item table is loaded

    // MutationObserver watches for new items added to the table and adds keyup and keydown event listeners to them
    let obs = new MutationObserver(function (mutations, observer) {
      let mutationRoot = mutations[0].target;
      let inputBox = mutationRoot.querySelector('#ItemName, #Quantity');
      if (focusElement(inputBox, true) > 0) {
        inputBox.setAttribute("autocomplete", "off");
        inputBox.onkeyup = inputBox.onkeyup || function (e) {
          e = e || window.event;
          switch (e.key) {
            case "Enter":
              mutationRoot.querySelector('.btn-inline-save').click();
              break;
            case "Escape":
              mutationRoot.querySelector('.btn-inline-cancel').click();
              break;
          }
        };
        inputBox.onkeydown = inputBox.onkeydown || function (e) {
          e = e || window.event;
          let curNum = inputBox.value.trim().length ? +inputBox.value : NaN;
          if (!isNaN(curNum)) {
            switch (e.key) {
              // The up/down button click events are slow to validate, but if I just set
              // the value of inputBox, the change is not recognized when I submit it,
              // so I'm sticking with the click events for now.
              case "ArrowUp":
                let upBtn = mutationRoot.querySelector('.fa-caret-up');
                if (upBtn) upBtn.click(); //inputBox.value = Math.max(0, curNum + 1);
                break;
              case "ArrowDown":
                let dnBtn = mutationRoot.querySelector('.fa-caret-down');
                if (dnBtn) dnBtn.click(); //inputBox.value = Math.max(0, curNum - 1);
                break;
            }
          }
        };
      }
    });

    obs.observe(itemTable, { childList: true, subtree: true });
    return true; // Success, no need to run again on this page
  }

  function autoSearchAllTransactions() {
    //Auto-click the "Search all Transactions" when Workbench search
    //returns no active transactions.

    let workbenchTable = document.querySelector(".dgrid-content");
    if (!workbenchTable) return false; // Wait until the workbench table is loaded

    let searchFilterText = () => document.querySelector("#filter-container .searchFilters input")?.value;
    let initialText = searchFilterText();

    // MutationObserver watches for changes to the table and clicks the "Search all Transactions" link if it's available
    let obs = new MutationObserver(function (mutations, observer) {
      //If the browser navigates back to this page, wait for the user to edit the search filter before clicking the link again.
      if (initialText != searchFilterText()) {
        initialText = "";
        let mutationRoot = mutations[0].target;
        mutationRoot.querySelector('.dgrid-extended-search > a')?.click();
      }
    });

    obs.observe(workbenchTable, { childList: true, subtree: true });
    return true;
  }


})(window.porMod);
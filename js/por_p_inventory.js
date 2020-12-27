(function (PoR) {
  'use strict';
  
  PoR.runOnPage.push({
    testPath: (path) => !!path.match(/^item$/),
    runScript: customizeItemPage
  });

  function customizeItemPage() {
    //Add Select All button
    var select_column_header = document.querySelector("th.dgrid-cell.dgrid-cell-padding.dgrid-column-selector.field-selector");
    if (!select_column_header) return false;
    select_column_header.innerHTML = "Select All";
    select_column_header.style.cursor = "pointer";
    select_column_header.onclick = function () {
      //TODO: The page doesn't redraw until after the function is done, so we never get a wait cursor
      //      Maybe some tips here https://stackoverflow.com/questions/16876394/dom-refresh-on-long-running-function
      document.body.style.cursor = 'wait';
      //Go to first page
      var first_page_button = document.querySelector(".dgrid-navigation > .dgrid-pagination-links > .dgrid-page-link:nth-child(1)");
      first_page_button.click();
      while (true) {
        //Click all unchecked checkboxes
        for (var s of document.querySelectorAll(".dgrid-column-selector input[type='checkbox']:not(:checked)")) { s.click(); }
        //Go to next page
        var next_page_button = document.querySelector(".dgrid-navigation > .dgrid-next.dgrid-page-link:not(.dgrid-page-disabled)");
        if (next_page_button) { next_page_button.click(); }
        else { break; }
      }
      //Go back to first page
      first_page_button.click();
      document.body.style.cursor = "";
    };
    return true;
  }

})(window.porMod);
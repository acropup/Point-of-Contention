(function (PoR) {
  'use strict';


  PoR.runOnPage.push({
    testPath: (path) => !!(path.match(/^workbench\/\d+\/(contract|receipt)(\/manual)?$/)
      || path.match(/^invoice\/\d+(\/manual)?$/)),
    runScript: breakdownTaxOnInvoice
  });
  PoR.runOnPage.push({
    testPath: (path) => path.match(/^workbench\/\d+\/picklist(\/manual)?$/),
    runScript: picklistAddBinColumn
  });

  // Point of Rental Printout Tax Breakdown

  // Point of Rental allows the creation of custom Tax Rates by Admins
  // https://pointofrentalcloud.com/taxRate
  // Tax rates can be named, and sub-rates can be defined, such as GST and PST.
  // Various printouts do not include a tax total, and others do not include
  // a tax breakdown. This script adds the missing breakdown or totals to 
  // invoice, contract, and receipt printouts.

  function getSecondaryTaxName(taxTotalName) {
    // Tries to determine the local tax name, whether that's PST, HST, or something else.
    // Defaults to PST.
    // We could probably standardize our naming of the Tax Rates in Point of Rental
    // to make it easier to extract the sub-rate names here.
    if (taxTotalName.startsWith('GST+') && taxTotalName.length > 4) {
      return taxTotalName.slice(4);
    }
    else {
      return "PST";
    }
  }

  function breakdownTaxOnInvoice() {
    //This looks at the rendered document (which is in an iframe) that may
    //be an Invoice, a Quote, or a Receipt. Invoices are currently missing
    //sub-rate tax breakdowns and Quotes and Receipts are missing tax totals.
    //This adds the missing rows, and highlights them on the screen.
    //It also highlights the Print button, because this is the only way to
    //print or save this modified document as a PDF.

    //For breaking down sub-rates, this function assumes 5% GST and the remainder as PST.

    let highlightSelectors = [];
    let print_iframe = document.querySelector("iframe#printf");
    if (print_iframe && print_iframe.contentDocument) {
      let doc = print_iframe.contentDocument;
      let totalTaxField = doc.querySelector("tr > td.field-TotalTax, tr > td.field-RentalTaxDetail, tr > td.field-SaleTaxDetail");
      let subRateRows = doc.querySelectorAll("tr.taxTotal");
      if (subRateRows.length && !totalTaxField) {
        //If we have subtotals but not a total, add a total below the subtotals
        let combinedTax = Array.from(subRateRows, row => row.querySelector("td.field-TotalTaxDetail").innerText.replace(/,/g, ''))
          .reduce((sum, rowVal) => sum + Number(rowVal), 0);
        let tr = doc.createElement("tr");
        let tdName = doc.createElement("td");
        tdName.innerText = "Total Tax";
        let tdVal = doc.createElement("td")
        tdVal.innerText = combinedTax.toFixed(2); //Print with 2 decimal digits
        tdVal.className = "field-TotalTax c-currency symbol-before symbol-length-class-one";
        tdVal.style.textAlign = "right";
        tdVal.dataset.currencySymbol = "$";
        tr.appendChild(tdName);
        tr.appendChild(tdVal);
        subRateRows[subRateRows.length - 1].insertAdjacentElement('afterEnd', tr);
        highlightSelectors.push("tr > td.field-TotalTax");
      }
      else if (totalTaxField && !subRateRows.length) {
        //If we have a tax total but not subtotals, add subtotals above the total
        let preTaxTotalField = doc.querySelector("tr > td.field-PreTaxTotal") || doc.querySelector("tr > td.field-RentalTotal, tr > td.field-SaleTotal");
        if (!preTaxTotalField) console.log("Could not find preTaxTotalField");
        if (preTaxTotalField && !subRateRows.length) {
          let taxTotal = Number(totalTaxField.innerText.replace(/,/g, ''));
          let preTaxTotal = Number(preTaxTotalField.innerText.replace(/,/g, ''));
          let taxTotalRate = taxTotal / preTaxTotal;
          let gstRate = .05; //We are assuming that GST is always 5% and PST is the remainder
          let pstRate = taxTotalRate - gstRate;
          let gstAmt = gstRate * preTaxTotal;
          let pstAmt = pstRate * preTaxTotal;
          let totalCalculatedTax = +(gstAmt + pstAmt).toFixed(2);
          if (totalCalculatedTax === taxTotal) {
            let taxTemplate = function (taxName, taxRate, taxAmt) {
              taxRate = +(taxRate * 100).toFixed(2); //The leading + converts to number and discards unnecessary decimal places
              taxAmt = Intl.NumberFormat(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(taxAmt);
              return `<tr class="taxTotal ${taxName}">
<td><span>${taxName}</span> (<span class="rate">${taxRate}%</span>)</td>
<td class="field-TotalTaxDetail c-currency symbol-before symbol-length-class-one"
style="text-align:right" data-currency-symbol="$">${taxAmt}</td>
</tr>`;
            };
            //On the Invoice printout, label only says "Tax", not the tax name like "GST+HST". In this case we default to "PST".
            let taxNamesLabel = totalTaxField.parentElement.querySelector("td > span");

            //Don't split out tax amounts if the tax is HST
            if (!(taxNamesLabel && taxNamesLabel.innerText.includes("HST"))) {
              let pstName = getSecondaryTaxName(taxNamesLabel ? taxNamesLabel.innerText : "");
              let trGST = doc.createElement("tr");
              let trPST = doc.createElement("tr");
              totalTaxField.parentElement.insertAdjacentElement('beforeBegin', trGST);
              totalTaxField.parentElement.insertAdjacentElement('beforeBegin', trPST);
              trGST.outerHTML = taxTemplate("GST", gstRate, gstAmt);
              trPST.outerHTML = taxTemplate(pstName, pstRate, pstAmt);
              highlightSelectors.push("tr.taxTotal");
            }
          }
          else {
            console.log(`Tax calculation is wrong:
gstAmt + pstAmt === taxTotal
${gstAmt} + ${pstAmt} === ${taxTotal}`);
          }
        }
      }
      if (highlightSelectors.length) {
        doc.querySelectorAll(highlightSelectors.join(',')).forEach(elem => elem.classList.add('highlight-transient'));
        document.querySelector('#invoice-print, #contract-print').classList.add('highlight-transient');
      }
    }
  }

  function picklistAddBinColumn() {
    // For Picklist printouts, take the Bin location info from the row below the item and
    // insert it into a new Bin row. Everything else in the location info row ('.grouped-line-item-extra')
    // is already hidden by CSS.
    let print_iframe = document.querySelector("iframe#printf");
    if (print_iframe && print_iframe.contentDocument) {
      let doc = print_iframe.contentDocument;
      let itemTable = doc.querySelector('table.grouped-line-items');
      if (!itemTable) {
        //Page probably isn't loaded, try again later
        return false;
      }

      //Create column header for Bin info
      let statusHeader = itemTable.querySelector('tbody:first-child > tr > th:last-child');
      let binHeader = doc.createElement('th');
      binHeader.innerText = "Bin";
      statusHeader.insertAdjacentElement('beforeBegin', binHeader);

      //Move Bin info to Bin column
      let itemRows = itemTable.querySelectorAll('tbody.grouped-line-item');
      itemRows.forEach(row => {
        let binCell = doc.createElement('td');
        binCell.className = "field-ItemBin";
        let binInfo = row.querySelector('.grouped-line-item-extra .field-ItemBin');
        if (binInfo) {
          binCell.innerText = binInfo.innerText;
        }
        let statusCell = row.querySelector('.grouped-line-item-main > .field-StatusName');
        statusCell.insertAdjacentElement('beforeBegin', binCell);
      });
    }
    return true;
  }

})(window.porMod);
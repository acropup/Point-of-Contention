
(function (PoR) {
	'use strict';
	showAccessKeyHints();
	window.addEventListener("focus", autoLogin);
	window.onfocus = autoLogin;
	PoR.runAlways.push(autoLogin);
	PoR.runAlways.push(updatePageTitle);
	PoR.runAlways.push(showPoRVersionNumber);
	PoR.runAlways.push(customizeAccessKeys);
	PoR.runAlways.push(addEditLinkToItemKeys);
	PoR.runAlways.push(addEditLinkToItemKeysInIFrame);
	PoR.runOnPage.push({
    testPath: (path) => true,
    runScript: searchBoxAutofocus
	});
	PoR.runOnPage.push({
    testPath: (path) => true,
    runScript: logoutRecovery
	});
	
	function autoLogin() {
		// Attempt to automate an automatic login if presented with the login page.
		// If logging in, returns true, so that other scripts can chill until the page reloads.
		let loginButton = document.querySelector("#submit-login");
		// Check if login button exists and is visible (offsetParent == null implies element is hidden)
		if (loginButton) {
			if (loginButton.offsetParent) { // if loginButton is visible
				let unField = document.querySelector("#loginUsername");
				let pwField = document.querySelector("#loginPassword");
				// The expectation is that a password manager will autofill these fields
				if (unField && unField.value.length > 0 &&
					pwField && pwField.value.length > 0 &&
					document.activeElement != unField &&
					document.activeElement != pwField) {
					loginButton.click();
					return true;
				}
			}
			else { // loginButton is not visible
				// PoR might be warning that too many users are logged in.
				// If so, highlight the login anyway button so the user can press Enter.
				loginButton = document.querySelector('#submit-login-excess-user');
				if (loginButton && loginButton.offsetParent) {
					loginButton.select();
				}
			}
		}
		return false;
	}
	function logoutRecovery() {
		// Point of Rental automatically logs you out after an hour or so.
		// Clicking the Back button and refreshing the page will return you
		// back to where you were, but this script does it automatically
		// the next time the tab is activated.
		if (location.pathname === "/loggedout") {
			if (PoR.lastUrl) {
				window.addEventListener('focus', ()=> location.href = PoR.lastUrl);
			}
		}
		else {
			PoR.lastUrl = location.href;
		}
		return true; //Only needs to run once per page
	}
	function updatePageTitle() {
		// This updates the page title to more accurately represent the page content.
		// This helps users differentiate tabs, and also provides a better default filename
		// for when you print to Save as PDF. (Google Chrome suggests the page
		// title as the default Save As filename)
		let titleHandled = true;
		switch (location.pathname) {
			case '/loggedout':
				if (!document.title.startsWith("[LO]")) {
					document.title = "[LO] " + document.title;
				}
				titleHandled = true;
				break;
			case '/item':	      document.title = 'Inventory';	break;
			case '/customer': 	document.title = 'Customers';	break;
			case '/workbench':	document.title = 'Workbench';	break;
		
			default:
				titleHandled = false;
				break;
		}
		if (!titleHandled) {
			let transId = document.querySelector('span[ng-if="Transaction.TransactionId"]');
			if (!transId) {
				let print_iframe = document.querySelector("iframe#printf");
				if (print_iframe && print_iframe.contentDocument) {
					let doc = print_iframe.contentDocument;
					transId = doc.querySelector('.field-InvoiceNumber, .field-ContractNumber, .field-Contract');
					//Note that invoices also include the contract number,
					//so we could include both in the filename if we wanted.
				}
			}
			if (transId) {
				let newTitle = transId.innerText;
				let ind = newTitle.indexOf(" # ");
				if (ind >= 0) {
					newTitle = newTitle.substr(ind+3);
				}
				document.title = newTitle;
			}
			else {
				document.title = "Point of Rental";
			}
		}
	}
	
	function showPoRVersionNumber() {
		let logoElem = document.querySelector(".the-logo > a");

		if (logoElem && APP_CONFIG) {
			// The CSS takes this data attribute and applies
			logoElem.dataset.porVersion = APP_CONFIG.version;
		}
	}

	function showAccessKeyHints() {
		// If the user holds the Alt key down, show the accesskey values
		// for any element to remind them of the Alt+[accesskey] navigation commands.
		document.body.addEventListener("keydown", event =>
		{
			if (event.key == 'Alt') {
				document.body.classList.add("show-accesskey");
			}
		});
		document.body.addEventListener("keyup", event =>
		{
			if (event.key == 'Alt') {
				document.body.classList.remove("show-accesskey");
				// Prevent Alt key from putting focus onto Google Chrome's main menu button
				event.preventDefault();
			}
			else if (event.key == 'Esc') {
				let clearFilterButton = document.querySelector('#filter-container .por-icon-cancel');
				if (clearFilterButton) {
					clearFilterButton.click();
				}
			}
		});
	}

	function customizeAccessKeys() {
		// Customize accesskey property for elements, which enables
		// custom Alt+Key commands for navigating the website.
		let inventoryMenu = document.querySelector('#menu-state-ItemListState');
		if (inventoryMenu && !inventoryMenu.hasAttribute('accesskey')) {
			let customersMenu = document.querySelector('#menu-state-CustomerListState');
			inventoryMenu.setAttribute('accesskey', 'i');
			customersMenu.setAttribute('accesskey', 'c');
		}
	}

	function searchBoxAutofocus() {
		// If the current page has a search box, try to apply focus to it so the user
		// can start typing immediately.

		// '#ItemSearch'
		//  is in Contract pages, Maintenance, Inventory Suggested Items; anywhere you're adding items to something.
		// '#filter-container .searchFilters input'
		//  is the common rounded search box with the magnifying glass; anywhere you're filtering a table.
		// '#searchFilter'
		//  is on the New Rental page and Missed Rental page
		// '#scanInputValue #LiveInputValue'
		//  is on the Quick Receive page
		// '#searchVal'
		//  is on the reports main page
		let result = focusElementPartialOverride("#ItemSearch, #filter-container .searchFilters input, #searchFilter, #scanInputValue #LiveInputValue, #searchVal", true, 'ul.main-menu');
		if (result === -1) { //Element not found, page might still be loading
			// Not every page will have search boxes, so we shouldn't poll forever.
			// If we still can't find it ~5s after page navigation, fake a success in order to stop trying.
			let giveUp = msSincePageNav() - porMod.pollRateMS > 5000;
			return giveUp;
		}
		// Element was found so we can stop looking
		return true;
		/* TODO: For focusItemSearchBox, allow user to start typing before page is fully loaded.
						 Tried doing this by inserting a scratchpad textbox, but it appears that my code
						 typically doesn't even run until after the search filter box is loaded.
		
			if (result === -1) { // Search filter box not created yet
				let tempSearchBox = document.querySelector('#tempsearchbox');
				if (!tempSearchBox) { // Temporary search filter box not created yet
					//Create a temporary textbox for the user to type into until the actual one appears
					tempSearchBox = document.createElement('input');
					tempSearchBox.id = 'tempsearchbox';
					console.log('done here');
					let pageTitle = document.querySelector(".page-title[translate='Inventory']");
					if (pageTitle) {
						console.log('inserting');
						pageTitle.insertAdjacentElement('afterend', tempSearchBox);
						focusElement('#tempsearchbox');
					}
				}
				return false;
			}
		*/
	}

	function addEditLinkToItemKeysInIFrame() {
		let iFrameElem = document.querySelector('#printf');
		if (iFrameElem)
			return addEditLinkToItemKeys(iFrameElem.contentDocument);
	}

	function addEditLinkToItemKeys(doc = document) {
		var keyQuerySelectors =[/* /workbench/#          */ ".field-ItemKey > span",
                            /* /workbench/# search   */ ".searched-item-main > div[ng-if='$rowObject.ItemKey']",
                            /* /workbench/#/picklist */ ".picklist-default .field-ItemKey",
                            /* /item inventory list  */ ".dgrid-column-ItemKey.field-ItemKey[role='gridcell']",
                            /* /item/#    kits       */ ".field-ReferencedItemKey[role='gridcell']"];
		var keyElems = doc.querySelectorAll(keyQuerySelectors.join(','));

		// Exclude items that already contain an edit icon (the one with a pencil SVG image) applied via CSS
		keyElems = Array.from(keyElems).filter(i => i.innerText && !i.querySelector("a.por-icon-edit"));
		if (keyElems.length === 0) return;
		if (keyElems[0].dataset.itemLinkApplied == "true") return;
		//In case any items queried do not exist, add a custom tag to the first element
		//that doesn't have an edit link so we know not to query the server more than once.
		keyElems[0].dataset.itemLinkApplied = "true";
		//Limit number of keys looked up to protect from accidentally sending a huge query
		keyElems.length = Math.min(keyElems.length, 30);
		let keysOnPage = Array.from(keyElems, i => i.innerText).map(i => i.replace(/[()]/g, "")); //Keys in contract search results are in parentheses
		getKeyTable(keysOnPage).then(table => {
			keyElems.forEach(keyElem => {
				let key = keyElem.innerText.replace(/[()]/g, ""); //Keys in contract search results are in parentheses
				if (key) {
					table.filter(row => row.ItemKey === key)
						.map(row => row.StockItemId)
						.forEach(id => {
							let link = doc.createElement("a");
							link.href = "https://pointofrentalcloud.com/item/" + id;
							link.innerHTML = "";//&#xf040"; //Unicode edit pencil glyph (u+f040 in FontAwesome)
							link.className = "por-icon por-icon-edit por-noprint por-icon-inserted";
							keyElem.insertAdjacentElement('afterbegin', link);
						});
				}
			});
		});
	}

	function getKeyTable(itemKeyList) {
		//itemKeyList should be an array of strings
		var queryParams = {
			"columns": [
				"StockItemId",
				"ItemKey"
			],
			"filter": {
				"ItemKey": { type: "IN", values: itemKeyList }
			},
			"sort": {
				"ItemKey": "ASC"
			}
		};
		return fetch("https://pointofrentalcloud.com/api/items?query=" + JSON.stringify(queryParams),
			{
				"credentials": "include",
				"headers": standardHeaders,
				"referrer": "https://pointofrentalcloud.com/item",
				"referrerPolicy": "no-referrer-when-downgrade",
				"body": null,
				"method": "GET",
				"mode": "cors"
			}).then(res => res.status === 200 ? res.json() : { items: [] }).then(res => {
				console.log("Query key table results:")
				console.log(res);
				let data = res.items.filter((item) => item.ItemKey !== null);
				return data;
			});
	}
})(window.porMod);

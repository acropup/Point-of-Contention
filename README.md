# Point of Contention - Usability Enhancements for Point of Rental

Point of Contention is a collection of Javascript and CSS customizations for the "Rental Essentials" rental management software at PointOfRental.com. It includes features such as auto-login, logout recovery, direct hyperlinking from any inventory item key to its edit page, tax breakdowns on invoices, and numerous formatting and legibility improvements. Since we as paying users don't have control over the code on Point of Rental's servers, all of these changes are "client-side", that is to say, Point of Rental sends the official webpage to your web browser as usual, and then Point of Contention modifies the webpage within your browser tab every time the page is loaded. Check out the [Feature Overview](#Feature-Overview) for the current list of features.

If the Point of Rental developers adopt some of these improvements, I will happily retire those features that are no longer necessary. But the reality is that Point of Rental has been unsuitable for our moderately sized business, and their indifference toward addressing problems has long been a *Point of Contention* for us. So for now, I hope that other customers will find these features and metaphorically smoothed edges as worthwhile as we have.

# How to use

To use these scripts, you will need two generic browser extensions to automatically run the scripts whenever you visit pointofrentalcloud.com. One is responsible for UserScript (Javascript) injection, and the other is responsible for UserStyle (CSS) injection. For Google Chrome, I recommend the [Tampermonkey] extension for the Javascript and the [Stylus] extension for the CSS styling.

[![Stylus for Chrome](https://img.shields.io/badge/Get_Stylus_for-Chrome-blue.svg)][StylusChrome]<br>
[![Stylus for Firefox](https://img.shields.io/badge/Get_Stylus_for-Firefox-orange.svg)][StylusFirefox]<br>
[![Stylus for Opera](https://img.shields.io/badge/Get_Stylus_for-Opera-red.svg)][StylusOpera]

[![Tampermonkey for Chrome](https://img.shields.io/badge/Get_Tampermonkey_for-Chrome-blue.svg)][TampermonkeyChrome]<br>
[![Tampermonkey for Firefox](https://img.shields.io/badge/Get_Tampermonkey_for-Firefox-orange.svg)][TampermonkeyFirefox]<br>
[![Tampermonkey for Opera](https://img.shields.io/badge/Get_Tampermonkey_for-Opera-red.svg)][TampermonkeyOpera]

## Visual stying with CSS UserStyles
After installing the Stylus browser extension, click the two user.css links below and choose `Install Style` when prompted.

[pointofrental_styles.user.css](../../raw/master/css/pointofrental_styles.user.css) includes styles that directly improve the look and structure of Rental Essentials, and is useful even without Tampermonkey and our custom Javascript.  
[pointofcontention_styles.user.css](../../raw/master/css/pointofcontention_styles.user.css) includes styles that are required by the Tampermonkey script. It is expected that `pointofrental_styles.css` is included in addition to `pointofcontention_styles.css`.

## Functionality improvements with Javascript UserScripts
After installing the Tampermonkey browser extension, go to the [PointOfContention.user.js direct link](../../raw/master/PointOfContention.user.js) and click the `Install` button.

## How to verify that the scripts are running
![Rental Essentials logo with flower and version number](img/RE_flower.png "Rental Essentials logo with flower and version number")

If the **CSS** is running properly, you will see a **flower icon** superimposed over the RE logo, which rotates when you hover over it.  
If the **Javascript** is running properly, you will see a **version number** superimposed over the RE logo. Note that this is Point of Rental's version number, not Point of Contention's version number.  
You may also press `F12` to open the Chrome Developer Console to see if any exceptions in the scripts are being thrown. On a **full page refresh**, the last initialization script to run writes ***--- This is a Point of Contention ---*** to the console. If you do not see this, it may be that the scripts aren't running, or that an error interrupted the script before it could finish.

# Development Setup

If you'd like to edit these scripts, to fix problems or add new features, you'll want to temporarily disable the online scripts in Tampermonkey and Stylus, and create copies for yourself to edit.

CSS is very convenient to edit directly in the [Stylus] editor, as the target pages will update automatically with new styles as soon as you save them in the web browser.

To run and edit a local copy of the Tampermonkey scripts, see this StackOverflow post on [How to make a Tampermonkey script @require local files](https://stackoverflow.com/questions/49509874/how-to-update-tampermonkey-script-to-a-local-file-programmatically). With your system properly configured, you should be able to edit any Tampermonkey script (aside from the root one in the Tampermonkey web interface) in your editor of choice, save your changes, and refresh the webpage to have them applied.

You will have to make a copy of the root Tampermonkey script ([PointOfContention.user.js](PointOfContention.user.js)) in the Tampermonkey web interface, and change all of the @require tags to point at the files on your local machine. If you add a new .js file, make sure to add a new @require tag for it in both your private copy of the root script and the repository copy of the root script [PointOfContention.user.js](PointOfContention.user.js).

For users to receive updates to the Tampermonkey script, the @version tag in the root script must be updated.

# Feature Overview

Here is a short feature list of the **`pointofrental_styles.user.css`** script. This standalone set of styles improves the Point of Rental interface without the need for any Javascript.

- Table columns are resized to fit much more data on a screen while also improving the visual structure and legibility of the table. See Dashboard, search pages (for Inventory, Customers, etc.), as well as a Contract's line items.
- Eyeball icon on the Inventory list (for showing upcoming booked dates) is replaced with a Calendar icon.
- For editable table cells, the line item edit popup is now the size of the entire cell, not arbitrarily small.
- When searching for items to add to a Contract, the Add to Cart buttons for Rental and Sale items are coloured differently for easier identification.
- In a Contract, the "Search" button is renamed to "Change Customer," because that's what it is for.
- In Pick List view, the "Location *Warehouse location*" is often just visual clutter, so it has been removed.
- On Invoice previews, Contract # and Notes section are enlarged to stand out.

Here is a short feature list of the **Point of Contention (PoC)** scripts. This includes both the CSS visual style script `pointofcontention_styles.user.css` as well as the Javascript file `PointOfContention.user.js`.

- Auto-login - If a password manager autofills your username and password, PoC will automatically click the Login button for you.
- Logout Recovery - Point of Rental automatically logs you out after an hour or so. PoC will return you to your last page the next time the tab is activated.
- Adds an Edit link (pencil icon) next to all inventory item keys, giving you quick access to an inventory item page from any page that references it.
- The Page Title (Tab name) shows the active Contract #, Invoice #, or page name, making it easier to differentiate between tabs. This also provides a better default filename for when you print to Safe as PDF, as Google Chrome suggests the page title as the default Save As filename.
- Autofocuses cursor into search textbox when navigating to pages such as Workbench, Inventory, Customers.
- Inline edit boxes for editable line item fields now respond to Enter (Submit), Escape (Cancel), Up Arrow (increase number value), and Down Arrow (decrease number value).
- AccessKeys are customized for keyboard navigation between pages, and hints are shown when the Alt key is pressed. Use AccessKeys by typing Alt+&lt;Key&gt; where &lt;Key&gt; is the displayed option. Alt+C for Customers, Alt+I for Inventory.
- Adds a Select All button to the Inventory Search page (on pointofrental.<span></span>com/item/). Due to how this is implemented, it can take a while if you have many pages of items.
- In the Stock Transaction form, defaults to the current date and price of $0.
- A cheerful flower is displayed over the RE logo to brighten your day.
- On Picklist printouts, item Bin location information is moved into its own column, rather than being in a row below each item.
- Adds a "safety cover" to the Pricing tab on item pages. Click it repeatedly to bypass it. For businesses with complex pricing structures, the Pricing tab can takes 20-30 seconds to load, which is especially annoying if you've clicked it by accident.
- On Quotes and Invoices, a best effort is made to break down Total Tax into its constituent parts whenever necessary (ex. GST and PST in most Canadian provinces). This is customized for Canadian businesses, so non-Canadian businesses may want to edit or remove this functionality. The Invoice can be printed this way, or saved as PDF (by choosing Save as PDF, an option in the Print dialog box). The added tax rows, along with the Print button, are highlighted orange to remind the user to use the Print button (as opposed to Send Email or Download), as this is the only way to keep those extra tax rows.


[Stylus]: https://add0n.com/stylus.html
[StylusChrome]: https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne
[StylusFirefox]: https://addons.mozilla.org/en-US/firefox/addon/styl-us/
[StylusOpera]: https://addons.opera.com/en/extensions/details/stylus/

[Tampermonkey]: https://www.tampermonkey.net/
[TampermonkeyChrome]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
[TampermonkeyFirefox]: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
[TampermonkeyOpera]: https://addons.opera.com/en/extensions/details/tampermonkey-beta/
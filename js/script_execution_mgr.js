'use strict';
// window.porMod is where Poise saves any shared global context
window.porMod = {};
porMod.runAlways = [];
porMod.runOnPage = [];
porMod.pollRateMS = 1000; //TODO: changing this live doesn't adjust poll rate. Will need to use setTimeout rather than setInterval
porMod.navTimestamp = 0;

(function (runAlways, runOnPage) {
  'use strict';
  let oldScriptCount = runOnPage.length;
  // Since pointofrental.com acts as a single-page application, we need to make
  // an extra effort to apply javascript to new pages as we navigate to them.
  let oldLocation = "";
  let pageScripts = runOnPage;
  let runningPageScripts = true;
    setInterval(function() {
      // Run all runAlways functions in order. If any one of them returns true,
      // all subsequent scripts are skipped (including the remainder of runAlways).
      let shortCircuit = runAlways.some((item)=>item());
      if (shortCircuit) return;

      // Run all runOnPage scripts that match the current URL path.
      // If a script was successful and need not run again, runScript() returns true.
      let resetScripts = (location.href != oldLocation);
      if (runOnPage.length !== oldScriptCount) {
        // Rerun all scripts if new ones are added. Only happens as the page and scripts are loading.
        oldScriptCount = runOnPage.length;
        resetScripts = true;
      }
      if (resetScripts) {
        oldLocation = location.href;
        porMod.navTimestamp = Date.now();
        let path = location.pathname.slice(1) + location.search; //Remove the leading slash
        pageScripts = runOnPage.filter(script => script.testPath(path));
        runningPageScripts = true;
      }
      
      if (runningPageScripts) {
        if (pageScripts.length) {
          console.log('Running ' + pageScripts.length + ' active page scripts');
        }
        else {
          console.log('All page scripts completed');
        }
      }

      if (pageScripts.length) {
        // Run all scripts and keep the ones that are not finished (return false)
        pageScripts = pageScripts.filter(script => !script.runScript());
      }
      else {
        runningPageScripts = false;
      }
    }, porMod.pollRateMS);
  })(porMod.runAlways, porMod.runOnPage);

  function msSincePageNav() {
    return Date.now() - porMod.navTimestamp;
  }
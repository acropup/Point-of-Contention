// applySafetyCovers is used for the item page (por_p_item.js) and may also be used elsewhere in future
function applySafetyCovers(querySelectorString = '.tab-tabs[tab="viewItemEditPricing"]:not(.active)', numberOfClicks = 3) {
  //Prevents accidental clicks by placing a protective div over
  //any rectangular element, which must be clicked [numberOfClicks] 
  //times before the underlying element can be clicked.
  //Returns true if at least one element was found to exist.
  let btns = document.querySelectorAll(querySelectorString);
  if (btns.length) {
    btns.forEach((btn) => {
      console.log('safetying');
      btn.applySafetyCover(numberOfClicks);
    });
    return true;
  }
  return false;
}

Element.prototype.applySafetyCover = function (numberOfClicks = 3) {
  //Prevents accidental clicks by placing a protective div over
  //any rectangular element, which must be clicked [numberOfClicks] 
  //times before the underlying element can be clicked.
  let btn = this;
  //Exit early if there's already a safety cover on this element
  if (btn.querySelector('.safety-cover')) return;

  let cover = document.createElement('div');
  cover.className = "safety-cover";
  cover.addEventListener("click", (
    () => {
      let clicks = 0;
      return (evt) => {
        if (++clicks < numberOfClicks) {
          evt.stopPropagation();
          let op = Math.max(0.2, cover.style.opacity || window.getComputedStyle(cover).opacity);
          cover.style.opacity = op - .1;
          return false;
        }
        else {
          cover.remove();
        }
      };
    })());
  btn.appendChild(cover);
};
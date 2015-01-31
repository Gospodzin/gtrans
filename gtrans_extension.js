// The onClicked callback function.
function onClickHandler(info, tab) {
	chrome.tabs.executeScript({code: 'window.dispatchEvent(new CustomEvent("TRANSLATE", {detail: {selectionText:"'+info.selectionText+'"}}))'});
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({"title": "Translate", "contexts":["selection"], "id": "selection-context"});
});

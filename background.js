// Handle extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  // Only proceed if we're on a Google sign-in page
  if (tab.url.includes("accounts.google.com/v3/signin")) {
    // Execute content script if it's not already injected
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    }, () => {
      // After script is injected, send a message to extract and redirect
      chrome.tabs.sendMessage(tab.id, { action: "extractAndRedirect" });
    });
  }
}); 
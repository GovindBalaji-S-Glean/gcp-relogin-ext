// This content script is injected into Google sign-in pages

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractAndRedirect') {
    const result = extractContinueUrl();
    sendResponse(result);
    
    // If a URL was successfully extracted, navigate to it
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      // Show alert if extraction failed
      alert(result.message);
    }
  } else if (message.action === 'extractOnly') {
    const result = extractContinueUrl();
    sendResponse(result);
  } else if (message.action === 'showAlert') {
    // Display alert message
    alert(message.message);
  }
  
  // Return true to indicate we'll respond asynchronously
  return true;
});

// Function to extract the continue URL
function extractContinueUrl() {
  try {
    const url = new URL(window.location.href);
    // Get the raw continue parameter without built-in decoding
    const rawParamValue = url.searchParams.toString()
      .split('&')
      .find(param => param.startsWith('continue='));
    
    if (rawParamValue) {
      // Extract just the value part after 'continue='
      const continueParam = rawParamValue.substring('continue='.length);
      
      // Custom decoding function that maintains encoded query parameters
      function customDecode(encodedUrl) {
        // First decode only the basic URL structure
        const firstDecode = decodeURIComponent(encodedUrl);
        
        // Parse the firstDecode to get the base URL and query string
        let baseUrl, queryString;
        const questionMarkIndex = firstDecode.indexOf('?');
        
        if (questionMarkIndex !== -1) {
          baseUrl = firstDecode.substring(0, questionMarkIndex);
          queryString = firstDecode.substring(questionMarkIndex + 1);
        } else {
          // Handle URLs with semicolons or other separators
          const semiColonIndex = firstDecode.indexOf(';');
          if (semiColonIndex !== -1) {
            // For URLs like console.cloud.google.com/logs/query;query=...
            // Keep the structure intact
            return firstDecode;
          } else {
            return firstDecode;
          }
        }
        
        // Create the final URL, preserving the query structure
        return baseUrl + (questionMarkIndex !== -1 ? '?' + queryString : '');
      }
      
      const decodedUrl = customDecode(continueParam);
      
      return {
        success: true,
        url: decodedUrl,
        message: 'URL extracted successfully'
      };
    } else {
      return {
        success: false,
        url: null,
        message: 'No continue parameter found in the URL'
      };
    }
  } catch (error) {
    return {
      success: false,
      url: null,
      message: 'Error processing URL: ' + error.message
    };
  }
} 
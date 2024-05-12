// Call the function when the extension is loaded
storeSettings();
function storeMultipleSettings() {
    // Your code to store multiple settings goes here
    // You can use the Chrome Storage API to store each setting individually
    // Here's an example of storing multiple settings using the Chrome Storage API:
    chrome.storage.sync.set({
        setting1: value1,
        setting2: value2,
        setting3: value3
    }, function() {
        console.log('Multiple settings stored successfully!');
    });
}

// Call the function when the extension is loaded
storeMultipleSettings();
// Chrome Extension Service Worker
// This handles background tasks and extension lifecycle

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Bookmark Manager extension installed');
    
    // Set up initial storage or configurations
    chrome.storage.local.set({
      'bookmarkManagerSettings': {
        defaultView: 'folders',
        sortBy: 'title',
        showRecentCount: 20,
        theme: 'light'
      }
    });
    
    // Open the bookmark manager on first install
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    });
  } else if (details.reason === 'update') {
    console.log('Bookmark Manager extension updated');
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open bookmark manager in new tab
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});

// Listen for bookmark changes to update any open bookmark manager tabs
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  notifyBookmarkManagerTabs('bookmark-created', { id, bookmark });
});

chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
  notifyBookmarkManagerTabs('bookmark-removed', { id, removeInfo });
});

chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
  notifyBookmarkManagerTabs('bookmark-changed', { id, changeInfo });
});

chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
  notifyBookmarkManagerTabs('bookmark-moved', { id, moveInfo });
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case '_execute_action':
      // This is handled by onClicked listener above
      break;
    case 'search-bookmarks':
      // Open bookmark manager and focus search
      chrome.tabs.create({
        url: chrome.runtime.getURL('index.html#search')
      });
      break;
  }
});

// Context menu items
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'add-bookmark':
      if (tab && tab.url) {
        chrome.bookmarks.create({
          title: tab.title,
          url: tab.url
        }, (bookmark) => {
          if (chrome.runtime.lastError) {
            console.error('Error creating bookmark:', chrome.runtime.lastError);
          } else {
            // Show notification
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'assets/icon48.png',
              title: 'Bookmark Added',
              message: `"${bookmark.title}" has been bookmarked.`
            });
          }
        });
      }
      break;
      
    case 'organize-bookmarks':
      chrome.tabs.create({
        url: chrome.runtime.getURL('index.html')
      });
      break;
  }
});

// Set up context menus
chrome.runtime.onStartup.addListener(() => {
  setupContextMenus();
});

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'add-bookmark',
      title: 'Bookmark this page',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'organize-bookmarks',
      title: 'Organize bookmarks',
      contexts: ['page']
    });
  });
}

// Message handling for communication with content script/popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'get-current-tab':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendResponse({ tab: tabs[0] });
      });
      return true; // Keep message channel open for async response
      
    case 'bookmark-current-tab':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab && tab.url) {
          chrome.bookmarks.create({
            title: tab.title,
            url: tab.url,
            parentId: request.folderId || '1'
          }, (bookmark) => {
            sendResponse({ 
              success: !chrome.runtime.lastError,
              bookmark: bookmark,
              error: chrome.runtime.lastError
            });
          });
        } else {
          sendResponse({ success: false, error: 'No active tab found' });
        }
      });
      return true;
      
    case 'get-settings':
      chrome.storage.local.get(['bookmarkManagerSettings'], (result) => {
        sendResponse({ 
          settings: result.bookmarkManagerSettings || {
            defaultView: 'folders',
            sortBy: 'title',
            showRecentCount: 20,
            theme: 'light'
          }
        });
      });
      return true;
      
    case 'save-settings':
      chrome.storage.local.set({
        'bookmarkManagerSettings': request.settings
      }, () => {
        sendResponse({ success: !chrome.runtime.lastError });
      });
      return true;
  }
});

// Helper function to notify all bookmark manager tabs of changes
function notifyBookmarkManagerTabs(eventType, data) {
  chrome.tabs.query({ url: chrome.runtime.getURL('index.html') }, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: eventType,
          data: data
        }).catch(() => {
          // Ignore errors if content script isn't loaded
        });
      }
    });
  });
}

// Handle extension unload
chrome.runtime.onSuspend.addListener(() => {
  console.log('Bookmark Manager extension suspended');
});

// Periodic cleanup or maintenance tasks
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'bookmark-cleanup') {
    // Perform any periodic maintenance
    console.log('Running bookmark cleanup tasks');
  }
});

// Set up periodic tasks
chrome.alarms.create('bookmark-cleanup', {
  periodInMinutes: 60 // Run every hour
});
# Arc Site Search

A Raycast extension to search the current website open in Arc browser using Google's site search.

## Features

- **Automatic Domain Detection:** Automatically detects the domain of the current website open in Arc browser
- **Smart Search Term Suggestions:** Pre-populates the search field with clipboard content
- **Simple Interface:** Clean search interface with search history tracking
- **Quick Search:** Just press Return to execute your search
- **Search History:** Keeps track of your previous searches for easy access
- **Flexible Actions:** Repeat previous searches or use previous search terms
- **Multiple Search Engines:** Choose between Google, DuckDuckGo, Bing, Yahoo, and Baidu

## Requirements

- [Arc Browser](https://arc.net/) must be installed and running
- [Raycast](https://raycast.com/)

## Usage

1. Open a website in Arc browser
2. Trigger the "Search Current Site" command in Raycast
3. Enter your search term (or use the pre-populated clipboard content)
4. Press Return to execute the search
5. Alternatively, select from your previous searches

### Search Engine Options

#### Changing the Default Search Engine (Permanent)

1. Open Raycast
2. Type "Extensions" and select "Manage Extensions"
3. Find "Arc Site Search" in your installed extensions
4. Click the gear icon (⚙️) or select "Preferences"
5. In the preferences panel, you'll see a dropdown for "Search Engine"
6. Select your preferred default search engine
7. Close the preferences panel - your selection is automatically saved

#### Changing the Search Engine for a Single Search (Temporary)

1. When using the extension, press ⌘+K or right-click to open the Action Panel
2. Select "Change Search Engine" from the menu
3. Choose your preferred engine for this search only
4. Your default preference will remain unchanged for future searches

#### Using Different Engines with History Items

- Each history item remembers which search engine was used
- When repeating a search from history, it will use the same engine by default
- Use the "Search With Different Engine" submenu to use a different engine with a history item

### Search History Features

- **View Previous Searches:** All your previous searches are displayed below the search bar
- **Repeat Search:** Click on a previous search to repeat it
- **Reuse Terms:** Use the "Use This Term" action to populate the search field with a previous term
- **Change Engine:** Use a different search engine for any saved search
- **Manage History:** Remove items from history with the "Remove from History" action

## How It Works

This extension uses AppleScript to communicate with Arc browser and get the URL of the currently active tab. It then extracts the domain from that URL and constructs a site search query with your provided search term using your preferred search engine. Your search history is saved locally for convenience.

## Troubleshooting

If you encounter issues:
- Make sure Arc browser is running
- Ensure you have an active tab open in Arc
- Check that you've granted necessary permissions to Raycast
- If search history isn't loading, try restarting Raycast 
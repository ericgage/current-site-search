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
- **Advanced Search Filters:** Refine searches by time, file type, and exact matching

## Requirements

- [Arc Browser](https://arc.net/) must be installed and running
- [Raycast](https://raycast.com/)

## Usage

1. Open a website in Arc browser
2. Trigger the "Search Current Site" command in Raycast
3. Enter your search term (or use the pre-populated clipboard content)
4. Optionally, apply search filters through the Action Panel (⌘K)
5. Press Return to execute the search
6. Alternatively, select from your previous searches

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

1. When using the extension, press ⌘K to open the Action Panel
2. Select "Change Search Engine" from the menu
3. Choose your preferred engine for this search only
4. Your default preference will remain unchanged for future searches

#### Using Different Engines with History Items

- Each history item remembers which search engine was used
- When repeating a search from history, it will use the same engine by default
- Use the "Search With Different Engine" submenu to use a different engine with a history item

### Search Filters

#### Available Filters

- **Time Filters:** Limit results to a specific time period (past day, week, month, or year)
- **File Type Filters:** Search for specific file types (PDF, Word, Excel, PowerPoint, images, etc.)
- **Exact Match:** Put quotes around your search term to match it exactly

#### How to Apply Filters

1. Press ⌘K to open the Action Panel
2. Select one of the filter options:
   - "Time Filter" - Choose a time range
   - "File Type" - Select a specific file type
   - "Turn On/Off Exact Match" - Toggle exact phrase matching
3. The active filters will be displayed alongside your search term
4. Use "Clear All Filters" to reset all filters at once

#### Working with Filters in History

- Each search history item remembers its filters
- Use "Repeat Search" to perform the same search with the same filters
- Use "Use These Filters" to apply a history item's filters to your current search

### Search History Features

- **View Previous Searches:** All your previous searches are displayed below the search bar
- **Repeat Search:** Click on a previous search to repeat it with all its filters
- **Reuse Terms:** Use the "Use This Term" action to populate the search field with a previous term
- **Reuse Filters:** Apply filters from a previous search to your current search
- **Change Engine:** Use a different search engine for any saved search
- **Manage History:** Remove items from history with the "Remove from History" action

## How It Works

This extension uses AppleScript to communicate with Arc browser and get the URL of the currently active tab. It then extracts the domain from that URL and constructs a site search query with your provided search term using your preferred search engine and any applied filters. Your search history is saved locally for convenience.

## Troubleshooting

If you encounter issues:
- Make sure Arc browser is running
- Ensure you have an active tab open in Arc
- Check that you've granted necessary permissions to Raycast
- If search history isn't loading, try restarting Raycast
- If filters don't work as expected, try a different search engine (Google has the best filter support)

### Extension Preferences

Arc Site Search can be customized through the following preferences:

#### Search Engine
Choose your default search engine from the following options:
- Google
- DuckDuckGo
- Bing
- Yahoo
- Baidu

#### Auto-populate from Clipboard
When enabled, the search field will automatically be populated with the current clipboard content when you open the extension. This can be useful for quickly searching for text you've just copied.

You can configure these preferences by:
1. Opening Raycast
2. Typing "Extensions" and selecting "Manage Extensions"
3. Finding "Arc Site Search" in your installed extensions
4. Clicking the gear icon (⚙️) or selecting "Preferences" 
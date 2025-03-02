# Arc Site Search

A Raycast extension to search the current website open in Arc browser using Google's site search.

## Features

- **Automatic Domain Detection:** Automatically detects the domain of the current website open in Arc browser
- **Smart Search Term Suggestions:** Pre-populates the search field with clipboard content
- **Simple Interface:** Clean search interface with search history tracking
- **Quick Search:** Just press Return to execute your search
- **Search History:** Keeps track of your previous searches for easy access
- **Flexible Actions:** Repeat previous searches or use previous search terms

## Requirements

- [Arc Browser](https://arc.net/) must be installed and running
- [Raycast](https://raycast.com/)

## Usage

1. Open a website in Arc browser
2. Trigger the "Search Current Site" command in Raycast
3. Enter your search term (or use the pre-populated clipboard content)
4. Press Return to execute the search
5. Alternatively, select from your previous searches

### Search History Features

- **View Previous Searches:** All your previous searches are displayed below the search bar
- **Repeat Search:** Click on a previous search to repeat it
- **Reuse Terms:** Use the "Use This Term" action to populate the search field with a previous term
- **Manage History:** Remove items from history with the "Remove from History" action

## How It Works

This extension uses AppleScript to communicate with Arc browser and get the URL of the currently active tab. It then extracts the domain from that URL and constructs a Google site search query with your provided search term. Your search history is saved locally for convenience.

## Troubleshooting

If you encounter issues:
- Make sure Arc browser is running
- Ensure you have an active tab open in Arc
- Check that you've granted necessary permissions to Raycast
- If search history isn't loading, try restarting Raycast 
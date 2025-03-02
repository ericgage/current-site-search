# Arc Site Search

A Raycast extension to search the current website open in Arc browser using Google's site search.

## Features

- Automatically detects the domain of the current website open in Arc browser
- Prompts for a search term
- Uses Google site search to search the current domain with your search term

## Requirements

- [Arc Browser](https://arc.net/) must be installed and running
- [Raycast](https://raycast.com/)

## Usage

1. Open a website in Arc browser
2. Trigger the "Search Current Site" command in Raycast
3. Enter your search term
4. Press Enter (or click "Search Site") to execute the search

## How It Works

This extension uses AppleScript to communicate with Arc browser and get the URL of the currently active tab. It then extracts the domain from that URL and constructs a Google site search query with your provided search term.

## Troubleshooting

If you encounter issues:
- Make sure Arc browser is running
- Ensure you have an active tab open in Arc
- Check that you've granted necessary permissions to Raycast 
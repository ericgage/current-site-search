import { useState, useEffect } from "react";
import { ActionPanel, Action, List, showToast, Toast, open, Clipboard, Icon, Color, LocalStorage } from "@raycast/api";
import { runAppleScript } from "run-applescript";

interface SearchHistoryItem {
  domain: string;
  searchTerm: string;
  timestamp: number;
}

export default function Command() {
  const [domain, setDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        
        // Get current domain from Arc browser
        const url = await getArcCurrentUrl();
        
        if (!url) {
          showToast({
            style: Toast.Style.Failure,
            title: "Failed to get current URL",
            message: "Make sure Arc browser is running with an active tab"
          });
          setError("Could not detect Arc browser or active tab");
          return;
        }
        
        const domain = extractDomain(url);
        setDomain(domain);
        
        // Get clipboard text and set as initial search term
        const clipboardText = await Clipboard.readText();
        if (clipboardText) {
          setSearchTerm(clipboardText.trim());
        }
        
        // Load search history
        const historyData = await LocalStorage.getItem<string>("searchHistory");
        if (historyData) {
          setSearchHistory(JSON.parse(historyData));
        }
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: String(error)
        });
        setError(String(error));
      } finally {
        setIsLoading(false);
      }
    }
    
    initialize();
  }, []);

  async function getArcCurrentUrl(): Promise<string | null> {
    try {
      const script = `
        tell application "Arc"
          set currentURL to URL of active tab of front window
          return currentURL
        end tell
      `;
      const url = await runAppleScript(script);
      return url;
    } catch (error) {
      console.error("Error getting URL from Arc:", error);
      return null;
    }
  }

  function extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      console.error("Error extracting domain:", e);
      return url;
    }
  }

  async function performSearch(term?: string, targetDomain?: string) {
    const searchDomain = targetDomain || domain;
    const searchQuery = term || searchTerm;
    
    if (!searchDomain) {
      showToast({
        style: Toast.Style.Failure,
        title: "No domain detected",
        message: "Make sure Arc browser is running with an active tab"
      });
      return;
    }

    if (!searchQuery.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "Empty search",
        message: "Please enter a search term"
      });
      return;
    }

    // Save to search history
    const newHistoryItem: SearchHistoryItem = {
      domain: searchDomain,
      searchTerm: searchQuery,
      timestamp: Date.now()
    };

    // Add to history and remove duplicates
    const updatedHistory = [
      newHistoryItem,
      ...searchHistory.filter(
        item => !(item.domain === searchDomain && item.searchTerm === searchQuery)
      )
    ].slice(0, 20); // Keep only the most recent 20 items

    setSearchHistory(updatedHistory);
    await LocalStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

    // Perform the search
    const encodedTerm = encodeURIComponent(searchQuery);
    const searchUrl = `https://www.google.com/search?q=${encodedTerm}+site%3A${searchDomain}`;
    
    open(searchUrl);
  }

  // Format timestamp for display
  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Enter search term..."
      searchText={searchTerm}
      onSearchTextChange={setSearchTerm}
      navigationTitle="Site Search"
      actions={
        <ActionPanel>
          <Action
            title="Search Site"
            icon={Icon.MagnifyingGlass}
            shortcut={{ modifiers: [], key: "return" }}
            onAction={() => performSearch()}
          />
        </ActionPanel>
      }
    >
      {domain && (
        <List.Section title={`Searching on: ${domain}`}>
          <List.Item
            title={searchTerm ? `Search for "${searchTerm}"` : "Enter a search term"}
            icon={Icon.MagnifyingGlass}
            accessories={[
              { icon: Icon.Return, tooltip: "Press Return to search" }
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Search Site"
                  icon={Icon.MagnifyingGlass}
                  onAction={() => performSearch()}
                  shortcut={{ modifiers: [], key: "return" }}
                />
              </ActionPanel>
            }
          />
        </List.Section>
      )}

      {searchHistory.length > 0 && (
        <List.Section title="Previous Searches">
          {searchHistory.map((item, index) => (
            <List.Item
              key={index}
              title={item.searchTerm}
              subtitle={item.domain}
              icon={Icon.Clock}
              accessories={[
                { text: formatDate(item.timestamp), tooltip: "Search date" }
              ]}
              actions={
                <ActionPanel>
                  <Action
                    title="Repeat Search"
                    icon={Icon.MagnifyingGlass}
                    onAction={() => performSearch(item.searchTerm, item.domain)}
                  />
                  <Action
                    title="Use This Term"
                    icon={Icon.TextCursor}
                    onAction={() => {
                      setSearchTerm(item.searchTerm);
                    }}
                  />
                  <Action
                    title="Remove from History"
                    icon={Icon.Trash}
                    onAction={async () => {
                      const updatedHistory = searchHistory.filter((_, i) => i !== index);
                      setSearchHistory(updatedHistory);
                      await LocalStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}

      {error && (
        <List.EmptyView
          icon={{ source: Icon.ExclamationMark, tintColor: Color.Red }}
          title="Error"
          description={error}
        />
      )}
    </List>
  );
} 
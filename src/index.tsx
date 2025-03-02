import { useState, useEffect } from "react";
import { ActionPanel, Action, List, showToast, Toast, open, Clipboard, Icon, Color, LocalStorage, getPreferenceValues } from "@raycast/api";
import { runAppleScript } from "run-applescript";

interface SearchHistoryItem {
  domain: string;
  searchTerm: string;
  timestamp: number;
  searchEngine?: string;
  timeFilter?: string;
  fileType?: string;
  exactMatch?: boolean;
}

interface Preferences {
  searchEngine: string;
  populateFromClipboard: boolean;
}

// File type options
const fileTypes = {
  pdf: { name: "PDF Files", value: "pdf" },
  doc: { name: "Word Documents", value: "doc" },
  xls: { name: "Excel Spreadsheets", value: "xls" },
  ppt: { name: "PowerPoint", value: "ppt" },
  img: { name: "Images", value: "img" },
  html: { name: "HTML Pages", value: "html" },
};

// Time filter options
const timeFilters = {
  day: { name: "Past 24 Hours", value: "d" },
  week: { name: "Past Week", value: "w" },
  month: { name: "Past Month", value: "m" },
  year: { name: "Past Year", value: "y" },
};

// Search engine configurations
const searchEngines = {
  google: {
    name: "Google",
    icon: "google",
    buildUrl: (query: string, domain: string, timeFilter?: string, fileType?: string, exactMatch?: boolean) => {
      let finalQuery = query;
      
      // Handle exact match
      if (exactMatch && query.trim()) {
        finalQuery = `"${query.trim()}"`;
      }
      
      // Handle file type
      let fileTypeParam = "";
      if (fileType) {
        switch(fileType) {
          case "pdf":
            fileTypeParam = " filetype:pdf";
            break;
          case "doc":
            fileTypeParam = " (filetype:doc OR filetype:docx)";
            break;
          case "xls":
            fileTypeParam = " (filetype:xls OR filetype:xlsx)";
            break;
          case "ppt":
            fileTypeParam = " (filetype:ppt OR filetype:pptx)";
            break;
          case "img":
            fileTypeParam = " (filetype:jpg OR filetype:jpeg OR filetype:png OR filetype:gif)";
            break;
          case "html":
            fileTypeParam = " (filetype:html OR filetype:htm)";
            break;
        }
      }
      
      // Build base URL with query and domain restriction
      let url = `https://www.google.com/search?q=${encodeURIComponent(finalQuery + ' site:' + domain + fileTypeParam)}`;
      
      // Add time filter parameter if specified
      if (timeFilter) {
        url += `&tbs=qdr:${timeFilter}`;
      }
      
      return url;
    },
  },
  duckduckgo: {
    name: "DuckDuckGo",
    icon: "duckduckgo",
    buildUrl: (query: string, domain: string, timeFilter?: string, fileType?: string, exactMatch?: boolean) => {
      let finalQuery = query;
      
      // Handle exact match
      if (exactMatch && query.trim()) {
        finalQuery = `"${query.trim()}"`;
      }
      
      // Handle file type (DuckDuckGo has limited file type support)
      let fileTypeParam = "";
      if (fileType) {
        fileTypeParam = ` filetype:${fileType}`;
      }
      
      let url = `https://duckduckgo.com/?q=${encodeURIComponent(finalQuery)}+site%3A${domain}${fileTypeParam}`;
      
      // Add time filter (DuckDuckGo format)
      if (timeFilter) {
        switch(timeFilter) {
          case "d":
            url += "&df=d";
            break;
          case "w":
            url += "&df=w";
            break;
          case "m":
            url += "&df=m";
            break;
          case "y":
            url += "&df=y";
            break;
        }
      }
      
      return url;
    },
  },
  bing: {
    name: "Bing",
    icon: "bing",
    buildUrl: (query: string, domain: string, timeFilter?: string, fileType?: string, exactMatch?: boolean) => {
      let finalQuery = query;
      
      // Handle exact match
      if (exactMatch && query.trim()) {
        finalQuery = `"${query.trim()}"`;
      }
      
      // Handle file type
      let fileTypeParam = "";
      if (fileType) {
        fileTypeParam = ` filetype:${fileType}`;
      }
      
      let url = `https://www.bing.com/search?q=${encodeURIComponent(finalQuery)}+site%3A${domain}${fileTypeParam}`;
      
      // Add time filter (Bing format)
      if (timeFilter) {
        switch(timeFilter) {
          case "d":
            url += "&filters=ex1%3a%22ez1%22"; // Past 24 hours
            break;
          case "w":
            url += "&filters=ex1%3a%22ez2%22"; // Past week
            break;
          case "m":
            url += "&filters=ex1%3a%22ez3%22"; // Past month
            break;
          case "y":
            url += "&filters=ex1%3a%22ez4%22"; // Past year
            break;
        }
      }
      
      return url;
    },
  },
  yahoo: {
    name: "Yahoo",
    icon: "yahoo",
    buildUrl: (query: string, domain: string, timeFilter?: string, fileType?: string, exactMatch?: boolean) => {
      let finalQuery = query;
      
      // Handle exact match
      if (exactMatch && query.trim()) {
        finalQuery = `"${query.trim()}"`;
      }
      
      // Handle file type (Yahoo has limited filetype support)
      let fileTypeParam = "";
      if (fileType) {
        fileTypeParam = ` filetype:${fileType}`;
      }
      
      let url = `https://search.yahoo.com/search?p=${encodeURIComponent(finalQuery)}+site%3A${domain}${fileTypeParam}`;
      
      // Add time filter (Yahoo format)
      if (timeFilter) {
        switch(timeFilter) {
          case "d":
            url += "&age=1d";
            break;
          case "w":
            url += "&age=1w";
            break;
          case "m":
            url += "&age=1m";
            break;
          case "y":
            url += "&age=1y";
            break;
        }
      }
      
      return url;
    },
  },
  baidu: {
    name: "Baidu",
    icon: "baidu",
    buildUrl: (query: string, domain: string, timeFilter?: string, fileType?: string, exactMatch?: boolean) => {
      let finalQuery = query;
      
      // Handle exact match
      if (exactMatch && query.trim()) {
        finalQuery = `"${query.trim()}"`;
      }
      
      // Baidu doesn't support most filters but we can at least add the site: operator
      return `https://www.baidu.com/s?wd=${encodeURIComponent(finalQuery)}+site%3A${domain}`;
    },
  },
};

export default function Command() {
  // Get user preferences
  const preferences = getPreferenceValues<Preferences>();
  const searchEngine = preferences.searchEngine || "google";
  
  const [domain, setDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [exactMatch, setExactMatch] = useState<boolean>(false);

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
        
        // Get clipboard text and set as initial search term if preference is enabled
        if (preferences.populateFromClipboard) {
          const clipboardText = await Clipboard.readText();
          if (clipboardText) {
            setSearchTerm(clipboardText.trim());
          }
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

  async function performSearch(term?: string, targetDomain?: string, engine?: string, time?: string, file?: string, exact?: boolean) {
    const searchDomain = targetDomain || domain;
    const searchQuery = term || searchTerm;
    const selectedEngine = engine || searchEngine;
    const selectedTimeFilter = time !== undefined ? time : timeFilter;
    const selectedFileType = file !== undefined ? file : fileType;
    const isExactMatch = exact !== undefined ? exact : exactMatch;
    
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

    // Save to search history with all filters
    const newHistoryItem: SearchHistoryItem = {
      domain: searchDomain,
      searchTerm: searchQuery,
      timestamp: Date.now(),
      searchEngine: selectedEngine,
      timeFilter: selectedTimeFilter || undefined,
      fileType: selectedFileType || undefined,
      exactMatch: isExactMatch || undefined
    };

    // Add to history and remove duplicates
    const updatedHistory = [
      newHistoryItem,
      ...searchHistory.filter(
        item => !(
          item.domain === searchDomain && 
          item.searchTerm === searchQuery &&
          item.searchEngine === selectedEngine &&
          item.timeFilter === selectedTimeFilter &&
          item.fileType === selectedFileType &&
          item.exactMatch === isExactMatch
        )
      )
    ].slice(0, 20); // Keep only the most recent 20 items

    setSearchHistory(updatedHistory);
    await LocalStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

    // Perform the search with selected engine and filters
    const engineConfig = searchEngines[selectedEngine as keyof typeof searchEngines] || searchEngines.google;
    const searchUrl = engineConfig.buildUrl(
      searchQuery, 
      searchDomain, 
      selectedTimeFilter, 
      selectedFileType, 
      isExactMatch
    );
    
    open(searchUrl);
  }

  // Helper functions for display
  function getSearchEngineName(engineKey: string): string {
    const engine = searchEngines[engineKey as keyof typeof searchEngines];
    return engine ? engine.name : "Search Engine";
  }

  function getTimeFilterName(value: string): string {
    return timeFilters[value as keyof typeof timeFilters]?.name || "Any Time";
  }

  function getFileTypeName(value: string): string {
    return fileTypes[value as keyof typeof fileTypes]?.name || "Any File Type";
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  // Helper function to clear all filters
  function clearFilters() {
    setTimeFilter("");
    setFileType("");
    setExactMatch(false);
    showToast({
      style: Toast.Style.Success,
      title: "Filters cleared",
    });
  }

  // Helper function to use filters from history
  function applyFiltersFromHistory(item: SearchHistoryItem) {
    if (item.timeFilter) setTimeFilter(item.timeFilter);
    if (item.fileType) setFileType(item.fileType);
    if (item.exactMatch) setExactMatch(item.exactMatch);
    showToast({
      style: Toast.Style.Success,
      title: "Filters applied",
    });
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
            title={`Search with ${getSearchEngineName(searchEngine)}`}
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
              { text: `Using ${getSearchEngineName(searchEngine)}` },
              ...(timeFilter ? [{ text: getTimeFilterName(timeFilter), icon: Icon.Clock }] : []),
              ...(fileType ? [{ text: getFileTypeName(fileType), icon: Icon.Document }] : []),
              ...(exactMatch ? [{ text: "Exact Match", icon: Icon.Quote }] : []),
              { icon: Icon.Return, tooltip: "Press Return to search" }
            ]}
            actions={
              <ActionPanel>
                <Action
                  title={`Search with ${getSearchEngineName(searchEngine)}`}
                  icon={Icon.MagnifyingGlass}
                  onAction={() => performSearch()}
                  shortcut={{ modifiers: [], key: "return" }}
                />
                <ActionPanel.Submenu title="Change Search Engine">
                  {Object.entries(searchEngines).map(([key, engine]) => (
                    <Action
                      key={key}
                      title={engine.name}
                      onAction={() => performSearch(undefined, undefined, key)}
                    />
                  ))}
                </ActionPanel.Submenu>
                
                <ActionPanel.Submenu title="Time Filter">
                  <Action
                    title="Any Time"
                    icon={timeFilter === "" ? Icon.Checkmark : undefined}
                    onAction={() => {
                      setTimeFilter("");
                      showToast({ style: Toast.Style.Success, title: "Time filter removed" });
                    }}
                  />
                  {Object.entries(timeFilters).map(([key, filter]) => (
                    <Action
                      key={key}
                      title={filter.name}
                      icon={timeFilter === filter.value ? Icon.Checkmark : undefined}
                      onAction={() => {
                        setTimeFilter(filter.value);
                        showToast({ style: Toast.Style.Success, title: `Time filter: ${filter.name}` });
                      }}
                    />
                  ))}
                </ActionPanel.Submenu>
                
                <ActionPanel.Submenu title="File Type">
                  <Action
                    title="Any File Type"
                    icon={fileType === "" ? Icon.Checkmark : undefined}
                    onAction={() => {
                      setFileType("");
                      showToast({ style: Toast.Style.Success, title: "File type filter removed" });
                    }}
                  />
                  {Object.entries(fileTypes).map(([key, type]) => (
                    <Action
                      key={key}
                      title={type.name}
                      icon={fileType === type.value ? Icon.Checkmark : undefined}
                      onAction={() => {
                        setFileType(type.value);
                        showToast({ style: Toast.Style.Success, title: `File type: ${type.name}` });
                      }}
                    />
                  ))}
                </ActionPanel.Submenu>
                
                <Action
                  title={exactMatch ? "Turn Off Exact Match" : "Turn On Exact Match"}
                  icon={exactMatch ? Icon.Checkmark : Icon.Quote}
                  onAction={() => {
                    setExactMatch(!exactMatch);
                    showToast({ 
                      style: Toast.Style.Success, 
                      title: exactMatch ? "Exact match disabled" : "Exact match enabled" 
                    });
                  }}
                />
                
                <Action
                  title="Clear All Filters"
                  icon={Icon.Trash}
                  shortcut={{ modifiers: ["cmd", "opt"], key: "c" }}
                  onAction={clearFilters}
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
                { text: item.searchEngine ? getSearchEngineName(item.searchEngine) : getSearchEngineName(searchEngine) },
                ...(item.timeFilter ? [{ icon: Icon.Clock, tooltip: getTimeFilterName(item.timeFilter) }] : []),
                ...(item.fileType ? [{ icon: Icon.Document, tooltip: getFileTypeName(item.fileType) }] : []),
                ...(item.exactMatch ? [{ icon: Icon.Quote, tooltip: "Exact Match" }] : []),
                { text: formatDate(item.timestamp), tooltip: "Search date" }
              ]}
              actions={
                <ActionPanel>
                  <Action
                    title="Repeat Search"
                    icon={Icon.MagnifyingGlass}
                    onAction={() => performSearch(
                      item.searchTerm, 
                      item.domain, 
                      item.searchEngine,
                      item.timeFilter,
                      item.fileType,
                      item.exactMatch
                    )}
                  />
                  <Action
                    title="Use This Term"
                    icon={Icon.TextCursor}
                    onAction={() => {
                      setSearchTerm(item.searchTerm);
                    }}
                  />
                  <Action
                    title="Use These Filters"
                    icon={Icon.Filter}
                    onAction={() => applyFiltersFromHistory(item)}
                  />
                  <ActionPanel.Submenu title="Search With Different Engine">
                    {Object.entries(searchEngines).map(([key, engine]) => (
                      <Action
                        key={key}
                        title={engine.name}
                        onAction={() => performSearch(item.searchTerm, item.domain, key, item.timeFilter, item.fileType, item.exactMatch)}
                      />
                    ))}
                  </ActionPanel.Submenu>
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
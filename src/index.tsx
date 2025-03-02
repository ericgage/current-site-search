import { useState, useEffect } from "react";
import { ActionPanel, Action, Form, showToast, Toast, open, Clipboard, KeyboardShortcut } from "@raycast/api";
import { runAppleScript } from "run-applescript";

interface FormValues {
  searchTerm: string;
}

export default function Command() {
  const [domain, setDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  function handleSubmit(values: FormValues) {
    if (!domain) {
      showToast({
        style: Toast.Style.Failure,
        title: "No domain detected",
        message: "Make sure Arc browser is running with an active tab"
      });
      return;
    }

    // Use the current state value to ensure latest input
    const termToSearch = values.searchTerm || searchTerm;
    const encodedTerm = encodeURIComponent(termToSearch);
    const searchUrl = `https://www.google.com/search?q=${encodedTerm}+site%3A${domain}`;
    
    open(searchUrl);
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm 
            title="Search Site" 
            onSubmit={handleSubmit} 
            shortcut={{ modifiers: [], key: "return" }} 
          />
        </ActionPanel>
      }
    >
      {domain && (
        <Form.Description text={`Searching on: ${domain}`} />
      )}
      {error && (
        <Form.Description text={`Error: ${error}`} />
      )}
      <Form.TextField
        id="searchTerm"
        title="Search Term"
        placeholder="Enter search term..."
        autoFocus
        value={searchTerm}
        onChange={setSearchTerm}
      />
    </Form>
  );
} 
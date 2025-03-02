/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `index` command */
  export type Index = ExtensionPreferences & {
  /** Search Engine - The search engine to use for site searches */
  "searchEngine": "google" | "duckduckgo" | "bing" | "yahoo" | "baidu",
  /** Auto-populate from Clipboard - Automatically populate the search field with clipboard content */
  "populateFromClipboard": boolean
}
}

declare namespace Arguments {
  /** Arguments passed to the `index` command */
  export type Index = {}
}


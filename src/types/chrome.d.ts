// Place this in src/types/chrome.d.ts

declare namespace chrome {
  export namespace bookmarks {
    export interface BookmarkTreeNode {
      id: string;
      parentId?: string;
      index?: number;
      url?: string;
      title: string;
      dateAdded?: number;
      dateGroupModified?: number;
      children?: BookmarkTreeNode[];
    }

    export function getTree(callback: (results: BookmarkTreeNode[]) => void): void;
    export function getRecent(numberOfItems: number, callback: (results: BookmarkTreeNode[]) => void): void;
    export function search(query: string, callback: (results: BookmarkTreeNode[]) => void): void;
    export function create(bookmark: { parentId?: string; index?: number; title?: string; url?: string }, callback?: (result: BookmarkTreeNode) => void): void;
    export function remove(id: string, callback?: () => void): void;
    export function update(id: string, changes: { title?: string; url?: string }, callback?: (result: BookmarkTreeNode) => void): void;
  }

  export namespace tabs {
    export interface Tab {
      id?: number;
      url?: string;
      title?: string;
      active: boolean;
    }

    export function create(createProperties: { url?: string; active?: boolean }, callback?: (tab: Tab) => void): void;
    export function query(queryInfo: { active?: boolean; currentWindow?: boolean }, callback: (result: Tab[]) => void): void;
  }

  export namespace runtime {
    export const lastError: { message?: string } | undefined;
  }
}
"use client";

import React, { useState, useEffect } from "react";
import { Search, Send, Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@repo/ui";

interface UserType {
  id: string;
  name: string;
  number: string;
}

export const SearchUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const fetchUsers = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery === "") {
      setUsers([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(false);

    const timer = setTimeout(() => {
      fetchUsers(trimmedQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="relative max-w-[480px] w-full font-sans">
      <div className="h-10 bg-surface rounded-[8px] border border-border flex items-center gap-2.5 px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <Search className="w-4 h-4 text-text-muted shrink-0" />
        <input
          type="text"
          placeholder="Search contacts by name or phone..."
          className="w-full bg-transparent outline-none text-text placeholder-text-faint text-xs py-1"
          value={searchQuery}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {loading && (
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
        )}
      </div>

      {/* Results Dropdown Menu */}
      {isFocused && searchQuery.trim() !== "" && (
        <div className="absolute left-0 right-0 mt-2 bg-surface rounded-[8px] shadow-lg border border-border overflow-hidden z-50 max-h-80 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center text-xs text-text-muted flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Searching user directory...</span>
            </div>
          )}

          {/* No Results Found State */}
          {!loading && hasSearched && users.length === 0 && (
            <div className="p-4 text-center text-text-muted text-xs">
              No registered user found matching "<span className="font-semibold text-text">{searchQuery}</span>"
            </div>
          )}

          {/* Results List */}
          {!loading && users.length > 0 && (
            <div className="divide-y divide-border">
              <div className="px-3.5 py-2 bg-surface-subtle text-xs font-medium text-text-muted flex justify-between items-center">
                <span>Matching contacts</span>
                <span className="font-mono text-text-faint text-xs">({users.length})</span>
              </div>

              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => router.push(`/dashboard/transfer?id=${user.id}`)}
                  className="px-3.5 py-2.5 hover:bg-surface-subtle transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name || "Contact"} size="sm" />
                    <div>
                      <h4 className="text-xs font-medium text-text group-hover:text-primary transition-colors">
                        {user.name || "PayPulse User"}
                      </h4>
                      <p className="text-xs text-text-muted font-mono">
                        +91 {user.number}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/transfer?id=${user.id}`);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-surface hover:bg-primary hover:text-primary-fg hover:border-primary text-text border border-border rounded-[6px] text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { Search, Send, Loader2, User } from "lucide-react";

interface UserType {
  id: string;
  name: string;
  number: string;
}

export const SearchUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Tracks if a request actually completed
  const [isFocused, setIsFocused] = useState(false);

  // 1. Fetch function
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
      setHasSearched(true); // Mark that the API has responded
    }
  };

  // 2. Debounce Effect
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    // Reset everything when query is empty
    if (trimmedQuery === "") {
      setUsers([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    // While waiting for timer, mark as loading so it doesn't prematurely trigger "No users found"
    setLoading(true);
    setHasSearched(false);

    const timer = setTimeout(() => {
      fetchUsers(trimmedQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="relative w-full">
      {/* Search Input Bar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 px-4 focus-within:border-[#00baf2] focus-within:ring-2 focus-within:ring-[#00baf2]/20 transition-all">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or phone number..."
          className="w-full bg-transparent outline-none text-slate-700 placeholder-slate-400 text-sm py-2"
          value={searchQuery}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {loading ? (
          <Loader2 className="w-5 h-5 text-[#00baf2] animate-spin" />
        ) : (
          <button className="bg-[#00baf2] hover:bg-[#00a3d9] text-white text-xs px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 shadow-sm">
            Search
          </button>
        )}
      </div>

      {/* Results Dropdown Menu */}
      {isFocused && searchQuery.trim() !== "" && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
          
          {/* 1. Loading State (Shows during the 400ms debounce AND while API is fetching) */}
          {loading && (
            <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#00baf2]" /> Searching users...
            </div>
          )}

          {/* 2. No Results Found State (ONLY shows AFTER api call completes and users array is empty) */}
          {!loading && hasSearched && users.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm">
              No users found matching "<span className="font-semibold text-slate-700">{searchQuery}</span>"
            </div>
          )}

          {/* 3. Results Found State */}
          {!loading && users.length > 0 && (
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-2 bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Search Results ({users.length})
              </div>
              
              {users.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#002e6e] font-bold text-sm uppercase">
                      {user.name ? user.name[0] : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-[#002e6e] transition-colors">
                        {user.name || "Paytm User"}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        +91 {user.number}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => console.log("Send money to:", user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#002e6e] hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-sm"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
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
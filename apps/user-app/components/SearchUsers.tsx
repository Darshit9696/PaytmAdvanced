"use client";

import React, { useState, useEffect } from "react";
import { Search, Send, Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";

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
      setHasSearched(true);
    }
  };

  // 2. Debounce Effect
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
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="relative w-full">
      <div className="bg-[#0f172a] p-2 rounded-2xl border border-slate-800 flex items-center gap-3 px-4 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search registered users by name or phone number..."
          className="w-full bg-transparent outline-none text-slate-100 placeholder-slate-400 text-sm py-2"
          value={searchQuery}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {loading ? (
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        ) : (
          <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-sm">
            Search
          </button>
        )}
      </div>

      {/* Results Dropdown Menu */}
      {isFocused && searchQuery.trim() !== "" && (
        <div className="absolute left-0 right-0 mt-2 bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-50 max-h-80 overflow-y-auto">

          {/* 1. Loading State */}
          {loading && (
            <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Searching user directory...
            </div>
          )}

          {/* 2. No Results Found State */}
          {!loading && hasSearched && users.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">
              No registered user found matching "<span className="font-semibold text-slate-200">{searchQuery}</span>"
            </div>
          )}

          {/* 3. Results Found State */}
          {!loading && users.length > 0 && (
            <div className="divide-y divide-slate-800/80">
              <div className="px-4 py-2 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Contacts ({users.length})
              </div>

              {users.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-slate-800/60 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-300 font-bold text-sm uppercase">
                      {user.name ? user.name[0] : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {user.name || "PayPulse User"}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        +91 {user.number}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      router.push(`/dashboard/transfer?id=${user.id}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-cyan-300 hover:text-white border border-blue-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm"
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
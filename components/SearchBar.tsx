import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      onSearch(term);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative group">
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-gray-400 w-5 h-5 group-focus-within:text-science-500 transition-colors" />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search proteins..."
          className="w-full bg-white border border-gray-200 text-gray-900 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-science-100 focus:border-science-500 outline-none transition-all shadow-sm placeholder-gray-400"
        />
        {/* Helper text or loading spinner could go here */}
      </div>
    </form>
  );
};

export default SearchBar;
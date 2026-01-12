import { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface StacksFilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedGoal: string;
  onGoalChange: (goal: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function StacksFilterBar({
  searchTerm,
  onSearchChange,
  selectedGoal,
  onGoalChange,
  sortBy,
  onSortChange,
}: StacksFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const goalTags = [
    { value: 'all', label: 'All Stacks' },
    { value: 'recovery', label: 'Recovery' },
    { value: 'metabolic', label: 'Fat Loss' },
    { value: 'cognitive', label: 'Cognitive' },
    { value: 'sleep', label: 'Sleep & Longevity' },
    { value: 'cosmetic', label: 'Cosmetic' },
  ];

  const sortOptions = [
    { value: 'best-value', label: 'Best Value' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
  ];

  return (
    <div className={`w-full mb-8 ${prefersReducedMotion ? '' : 'animate-fade-up'}`}>
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search stacks..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A0E0]/50 focus:border-[#00A0E0]/50 transition-all text-sm"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-sm"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-3 md:gap-4`}>
            <div className="relative min-w-[160px]">
              <select
                value={selectedGoal}
                onChange={(e) => onGoalChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00A0E0]/50 focus:border-[#00A0E0]/50 transition-all appearance-none text-sm cursor-pointer"
              >
                {goalTags.map((tag) => (
                  <option key={tag.value} value={tag.value} className="bg-[#0B0D12]">
                    {tag.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[180px]">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00A0E0]/50 focus:border-[#00A0E0]/50 transition-all appearance-none text-sm cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#0B0D12]">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
          {goalTags.map((tag) => (
            <button
              key={tag.value}
              onClick={() => onGoalChange(tag.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedGoal === tag.value
                  ? 'bg-[#00A0E0] text-white shadow-lg shadow-[#00A0E0]/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

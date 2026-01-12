import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface CatalogueFilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  productCount: number;
}

export default function CatalogueFilterBar({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  productCount,
}: CatalogueFilterBarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'in-stock', label: 'In Stock First' },
  ];

  return (
    <div className="mb-6 md:mb-8">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center">
          <div className="flex items-center gap-2 flex-shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-[#00A0E0]" />
            <span className="text-sm font-semibold text-white hidden md:inline">Filter & Sort</span>
          </div>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A0E0]/50 focus:border-[#00A0E0]/50 transition-all text-sm"
            />
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors text-sm w-full"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Sort Options</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className={`${showMobileFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto`}>
            <div className="relative min-w-[180px]">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00A0E0]/50 focus:border-[#00A0E0]/50 transition-all appearance-none text-sm cursor-pointer pr-10"
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

        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400">
            Showing <span className="text-white font-semibold">{productCount}</span> {productCount === 1 ? 'product' : 'products'}
          </p>
        </div>
      </div>
    </div>
  );
}

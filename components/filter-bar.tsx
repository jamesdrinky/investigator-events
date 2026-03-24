'use client';

import { motion } from 'framer-motion';

interface FilterBarProps {
  countries: string[];
  regions: string[];
  months: string[];
  categories: string[];
  associations: string[];
  scope: 'main' | 'all';
  view: 'calendar' | 'list';
  values: {
    search: string;
    country: string;
    region: string;
    month: string;
    category: string;
    association: string;
  };
  hasActiveFilters: boolean;
  onChange: (next: FilterBarProps['values']) => void;
  onChangeScope: (scope: 'main' | 'all') => void;
  onChangeView: (view: 'calendar' | 'list') => void;
  onReset: () => void;
}

function selectClasses() {
  return 'h-11 min-w-[9rem] rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100';
}

export function FilterBar({
  countries,
  regions,
  months,
  categories,
  associations,
  scope,
  view,
  values,
  hasActiveFilters,
  onChange,
  onChangeScope,
  onChangeView,
  onReset
}: FilterBarProps) {
  return (
    <motion.section
      className="relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_20px_36px_-30px_rgba(15,23,42,0.18)]"
      aria-label="Event filters"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_32%,rgba(34,197,94,0.03))]" />
      <div className="relative flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => onChangeScope('main')}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  scope === 'main' ? 'bg-[linear-gradient(135deg,#2a9bff,#22c55e)] text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Main
              </button>
              <button
                type="button"
                onClick={() => onChangeScope('all')}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  scope === 'all' ? 'bg-[linear-gradient(135deg,#2a9bff,#22c55e)] text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </div>

            <label className="sr-only" htmlFor="search-filter">
              Search events
            </label>
            <input
              id="search-filter"
              type="search"
              placeholder="Search events, cities, associations"
              className="h-11 min-w-[16rem] flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              value={values.search}
              onChange={(e) => onChange({ ...values, search: e.target.value })}
            />

            <label className="sr-only" htmlFor="association-filter">
              Association / organiser
            </label>
            <select
              id="association-filter"
              className={selectClasses()}
              value={values.association}
              onChange={(e) => onChange({ ...values, association: e.target.value })}
            >
              <option value="All">Association</option>
              {associations.map((association) => (
                <option key={association}>{association}</option>
              ))}
            </select>

            <label className="sr-only" htmlFor="region-filter">
              Region
            </label>
            <select
              id="region-filter"
              className={selectClasses()}
              value={values.region}
              onChange={(e) => onChange({ ...values, region: e.target.value })}
            >
              <option value="All">Region</option>
              {regions.map((region) => (
                <option key={region}>{region}</option>
              ))}
            </select>

            <label className="sr-only" htmlFor="category-filter">
              Category
            </label>
            <select
              id="category-filter"
              className={selectClasses()}
              value={values.category}
              onChange={(e) => onChange({ ...values, category: e.target.value })}
            >
              <option value="All">Category</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <label className="sr-only" htmlFor="country-filter">
              Country
            </label>
            <select
              id="country-filter"
              className={selectClasses()}
              value={values.country}
              onChange={(e) => onChange({ ...values, country: e.target.value, region: 'All' })}
            >
              <option value="All">Country</option>
              {countries.map((country) => (
                <option key={country}>{country}</option>
              ))}
            </select>

            <label className="sr-only" htmlFor="month-filter">
              Month
            </label>
            <select
              id="month-filter"
              className={selectClasses()}
              value={values.month}
              onChange={(e) => onChange({ ...values, month: e.target.value })}
            >
              <option value="All">Month</option>
              {months.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={onReset}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Reset
              </button>
            ) : null}

            <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => onChangeView('list')}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition ${
                  view === 'list' ? 'bg-[linear-gradient(135deg,#2a9bff,#22c55e)] text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Timeline
              </button>
              <button
                type="button"
                onClick={() => onChangeView('calendar')}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition ${
                  view === 'calendar' ? 'bg-[linear-gradient(135deg,#2a9bff,#22c55e)] text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
          <span>Search</span>
          <span>Filters</span>
          <span>Association</span>
          <span>Region</span>
          <span>Category</span>
          <span>Country</span>
          <span>Month</span>
        </div>
      </div>
    </motion.section>
  );
}

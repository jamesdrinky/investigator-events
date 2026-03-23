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
  return 'h-10 min-w-[9rem] rounded-full border border-white/12 bg-[linear-gradient(180deg,rgba(12,19,30,0.96),rgba(7,12,21,0.98))] px-4 text-sm text-slate-100 outline-none transition duration-200 focus:border-signal';
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
      className="global-panel relative overflow-hidden p-4"
      aria-label="Event filters"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_32%,rgba(255,255,255,0.02))]" />
      <div className="relative flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center overflow-hidden rounded-full border border-white/12 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => onChangeScope('main')}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  scope === 'main' ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Main
              </button>
              <button
                type="button"
                onClick={() => onChangeScope('all')}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  scope === 'all' ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                All
              </button>
            </div>

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
                className="rounded-full border border-white/14 px-4 py-2 text-sm text-slate-200 transition hover:border-white/24 hover:bg-white/[0.04]"
              >
                Reset
              </button>
            ) : null}

            <div className="inline-flex items-center overflow-hidden rounded-full border border-white/12 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => onChangeView('list')}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition ${
                  view === 'list' ? 'bg-signal text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Timeline
              </button>
              <button
                type="button"
                onClick={() => onChangeView('calendar')}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition ${
                  view === 'calendar' ? 'bg-signal text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
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

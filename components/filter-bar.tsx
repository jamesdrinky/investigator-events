'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

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
  resultCount: number;
  upcomingCount: number;
  hasActiveFilters: boolean;
  onChange: (next: FilterBarProps['values']) => void;
  onChangeScope: (scope: 'main' | 'all') => void;
  onChangeView: (view: 'calendar' | 'list') => void;
  onReset: () => void;
}

function selectClasses() {
  return 'h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100';
}

function FilterFields({
  countries,
  regions,
  months,
  categories,
  associations,
  values,
  onChange,
  mobile = false
}: Pick<FilterBarProps, 'countries' | 'regions' | 'months' | 'categories' | 'associations' | 'values' | 'onChange'> & { mobile?: boolean }) {
  return (
    <div className={`grid gap-2.5 ${mobile ? 'grid-cols-1' : 'lg:grid-cols-[minmax(0,1.1fr)_repeat(5,minmax(0,0.8fr))]'}`}>
      <div>
        <label className="sr-only" htmlFor={mobile ? 'search-filter-mobile-drawer' : 'search-filter'}>
          Search events
        </label>
        <input
          id={mobile ? 'search-filter-mobile-drawer' : 'search-filter'}
          type="search"
          placeholder="Search event, city, host, or country"
          className={selectClasses()}
          value={values.search}
          onChange={(e) => onChange({ ...values, search: e.target.value })}
        />
      </div>

      <div>
        <label className="sr-only" htmlFor={mobile ? 'association-filter-mobile' : 'association-filter'}>
          Association / organiser
        </label>
        <select
          id={mobile ? 'association-filter-mobile' : 'association-filter'}
          className={selectClasses()}
          value={values.association}
          onChange={(e) => onChange({ ...values, association: e.target.value })}
        >
          <option value="All">Association</option>
          {associations.map((association) => (
            <option key={association}>{association}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="sr-only" htmlFor={mobile ? 'region-filter-mobile' : 'region-filter'}>
          Region
        </label>
        <select
          id={mobile ? 'region-filter-mobile' : 'region-filter'}
          className={selectClasses()}
          value={values.region}
          onChange={(e) => onChange({ ...values, region: e.target.value })}
        >
          <option value="All">Region</option>
          {regions.map((region) => (
            <option key={region}>{region}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="sr-only" htmlFor={mobile ? 'country-filter-mobile' : 'country-filter'}>
          Country
        </label>
        <select
          id={mobile ? 'country-filter-mobile' : 'country-filter'}
          className={selectClasses()}
          value={values.country}
          onChange={(e) => onChange({ ...values, country: e.target.value, region: 'All' })}
        >
          <option value="All">Country</option>
          {countries.map((country) => (
            <option key={country}>{country}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="sr-only" htmlFor={mobile ? 'category-filter-mobile' : 'category-filter'}>
          Category
        </label>
        <select
          id={mobile ? 'category-filter-mobile' : 'category-filter'}
          className={selectClasses()}
          value={values.category}
          onChange={(e) => onChange({ ...values, category: e.target.value })}
        >
          <option value="All">Category</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="sr-only" htmlFor={mobile ? 'month-filter-mobile' : 'month-filter'}>
          Month
        </label>
        <select
          id={mobile ? 'month-filter-mobile' : 'month-filter'}
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
    </div>
  );
}

function ToggleGroup({
  value,
  options,
  onChange
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            value === option.value ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
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
  resultCount,
  upcomingCount,
  hasActiveFilters,
  onChange,
  onChangeScope,
  onChangeView,
  onReset
}: FilterBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <section aria-label="Event controls" className="border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup
                value={scope}
                onChange={(next) => onChangeScope(next as 'main' | 'all')}
                options={[
                  { value: 'main', label: 'Major' },
                  { value: 'all', label: 'All' }
                ]}
              />
              <ToggleGroup
                value={view}
                onChange={(next) => onChangeView(next as 'calendar' | 'list')}
                options={[
                  { value: 'list', label: 'List' },
                  { value: 'calendar', label: 'Calendar' }
                ]}
              />
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex h-10 items-center rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-950"
                >
                  Reset
                </button>
              ) : null}
            </div>

            <div className="hidden min-w-0 flex-1 lg:block lg:pl-4">
              <FilterFields
                countries={countries}
                regions={regions}
                months={months}
                categories={categories}
                associations={associations}
                values={values}
                onChange={onChange}
              />
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor="search-filter-mobile">
                  Search events
                </label>
                <input
                  id="search-filter-mobile"
                  type="search"
                  placeholder="Search events"
                  className={selectClasses()}
                  value={values.search}
                  onChange={(e) => onChange({ ...values, search: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700"
              >
                Filters
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-slate-600">
              <span>{resultCount} matching events</span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span>{upcomingCount} upcoming</span>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Search, filter, scan, act
            </p>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/30"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-t-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_-24px_60px_-34px_rgba(15,23,42,0.24)]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Filters</p>
                  <h3 className="text-lg font-semibold text-slate-950">Refine events</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600"
                >
                  Done
                </button>
              </div>

              <FilterFields
                countries={countries}
                regions={regions}
                months={months}
                categories={categories}
                associations={associations}
                values={values}
                onChange={onChange}
                mobile
              />

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                    setDrawerOpen(false);
                  }}
                  className="inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-600"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex h-10 items-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

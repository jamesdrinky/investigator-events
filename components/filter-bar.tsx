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

function inputClasses() {
  return 'h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12)]';
}

function FieldGroup({
  countries,
  regions,
  months,
  categories,
  associations,
  values,
  onChange
}: Pick<FilterBarProps, 'countries' | 'regions' | 'months' | 'categories' | 'associations' | 'values' | 'onChange'>) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <select className={inputClasses()} value={values.association} onChange={(e) => onChange({ ...values, association: e.target.value })}>
        <option value="All">Association</option>
        {associations.map((association) => (
          <option key={association}>{association}</option>
        ))}
      </select>
      <select className={inputClasses()} value={values.region} onChange={(e) => onChange({ ...values, region: e.target.value })}>
        <option value="All">Region</option>
        {regions.map((region) => (
          <option key={region}>{region}</option>
        ))}
      </select>
      <select
        className={inputClasses()}
        value={values.country}
        onChange={(e) => onChange({ ...values, country: e.target.value, region: 'All' })}
      >
        <option value="All">Country</option>
        {countries.map((country) => (
          <option key={country}>{country}</option>
        ))}
      </select>
      <select className={inputClasses()} value={values.category} onChange={(e) => onChange({ ...values, category: e.target.value })}>
        <option value="All">Category</option>
        {categories.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
      <select className={inputClasses()} value={values.month} onChange={(e) => onChange({ ...values, month: e.target.value })}>
        <option value="All">Month</option>
        {months.map((month) => (
          <option key={month}>{month}</option>
        ))}
      </select>
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-[0.9rem] px-3 py-2 text-sm font-medium transition ${
            value === option.value
              ? 'bg-slate-950 text-white shadow-[0_14px_28px_-20px_rgba(15,23,42,0.45),0_0_18px_rgba(56,189,248,0.14)]'
              : 'text-slate-600 hover:text-slate-950'
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
      <section className="relative overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.16)] sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.08),transparent_22%),radial-gradient(circle_at_90%_0%,rgba(37,99,235,0.08),transparent_20%)]" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor="event-search">Search events</label>
              <input
                id="event-search"
                type="search"
                placeholder="Search events, cities, or associations"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                value={values.search}
                onChange={(e) => onChange({ ...values, search: e.target.value })}
              />
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <Segmented
                value={scope}
                onChange={(next) => onChangeScope(next as 'main' | 'all')}
                options={[
                  { value: 'main', label: 'Major' },
                  { value: 'all', label: 'All' }
                ]}
              />
              <Segmented
                value={view}
                onChange={(next) => onChangeView(next as 'calendar' | 'list')}
                options={[
                  { value: 'list', label: 'Feed' },
                  { value: 'calendar', label: 'Calendar' }
                ]}
              />
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex h-11 items-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600"
                >
                  Reset
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2 lg:hidden">
              <Segmented
                value={view}
                onChange={(next) => onChangeView(next as 'calendar' | 'list')}
                options={[
                  { value: 'list', label: 'Feed' },
                  { value: 'calendar', label: 'Calendar' }
                ]}
              />
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
              >
                Filters
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <FieldGroup
              countries={countries}
              regions={regions}
              months={months}
              categories={categories}
              associations={associations}
              values={values}
              onChange={onChange}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <span>{resultCount} events</span>
              <span className="text-slate-300">/</span>
              <span>{upcomingCount} upcoming</span>
            </div>
            <div className="flex items-center gap-2 max-lg:hidden">
              <Segmented
                value={scope}
                onChange={(next) => onChangeScope(next as 'main' | 'all')}
                options={[
                  { value: 'main', label: 'Major' },
                  { value: 'all', label: 'All' }
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0 bg-slate-950/35" onClick={() => setDrawerOpen(false)} />
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-t-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_-24px_60px_-34px_rgba(15,23,42,0.24)]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-950">Filter events</h3>
                <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">
                  Done
                </button>
              </div>

              <div className="mb-3">
                <Segmented
                  value={scope}
                  onChange={(next) => onChangeScope(next as 'main' | 'all')}
                  options={[
                    { value: 'main', label: 'Major' },
                    { value: 'all', label: 'All' }
                  ]}
                />
              </div>

              <FieldGroup
                countries={countries}
                regions={regions}
                months={months}
                categories={categories}
                associations={associations}
                values={values}
                onChange={onChange}
              />

              <div className="mt-4 flex items-center justify-between gap-3">
                <button type="button" onClick={onReset} className="inline-flex h-11 items-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600">
                  Reset
                </button>
                <button type="button" onClick={() => setDrawerOpen(false)} className="inline-flex h-11 items-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white">
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

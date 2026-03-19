'use client';

import { motion } from 'framer-motion';

interface FilterBarProps {
  countries: string[];
  regions: string[];
  months: string[];
  categories: string[];
  values: {
    country: string;
    region: string;
    month: string;
    category: string;
  };
  onChange: (next: FilterBarProps['values']) => void;
}

function selectClasses() {
  return 'mt-1.5 w-full rounded-xl border border-white/15 bg-[linear-gradient(180deg,rgba(7,33,58,0.64),rgba(4,16,24,0.84))] px-3 py-2 text-sm text-slate-100 outline-none transition duration-300 focus:border-signal focus:bg-white/[0.08]';
}

export function FilterBar({ countries, regions, months, categories, values, onChange }: FilterBarProps) {
  return (
    <motion.section
      className="global-panel p-4 sm:p-5"
      aria-label="Event filters"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55 }}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs uppercase tracking-[0.12em] text-slate-300">
          Country
          <select
            className={selectClasses()}
            value={values.country}
            onChange={(e) => onChange({ ...values, country: e.target.value, region: 'All' })}
          >
            <option>All</option>
            {countries.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </label>

        <label className="text-xs uppercase tracking-[0.12em] text-slate-300">
          Region / State
          <select
            className={selectClasses()}
            value={values.region}
            onChange={(e) => onChange({ ...values, region: e.target.value })}
          >
            <option>All</option>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </label>

        <label className="text-xs uppercase tracking-[0.12em] text-slate-300">
          Month
          <select
            className={selectClasses()}
            value={values.month}
            onChange={(e) => onChange({ ...values, month: e.target.value })}
          >
            <option>All</option>
            {months.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>
        </label>

        <label className="text-xs uppercase tracking-[0.12em] text-slate-300">
          Category
          <select
            className={selectClasses()}
            value={values.category}
            onChange={(e) => onChange({ ...values, category: e.target.value })}
          >
            <option>All</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>
    </motion.section>
  );
}

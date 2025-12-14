import React from "react";

const categories = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Beauty & Health",
  "Toys & Games",
  "Sports & Outdoors",
  "Books & Media",
  "Food & Drink",
  "Hobbies & Crafts",
  "Others",
];

const discounts = [
  "10% and above",
  "20% and above",
  "30% and above",
  "40% and above",
  "50% and above",
  "60% and above",
  "70% and above",
  "80% and above",
  "90% and above",
];


export default function ProductFilter({
  filters,
  setFilters,
  minPrice = 100,
  maxPrice = 10100,
}) {
  return (
    <aside
      className="bg-white border border-green-600 rounded-lg p-4 w-full max-w-xs md:mb-0 md:mr-4 text-black"
      style={{ minWidth: 220 }}
    >
      <h2 className="font-bold text-lg mb-4">Filters</h2>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-3 py-1 rounded border border-green-600 text-sm transition-all ${
                filters.category === cat
                  ? "bg-green-600 text-white"
                  : "bg-white text-black"
              }`}
              onClick={() => setFilters((f) => ({ ...f, category: cat }))}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Price</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={minPrice}
            max={filters.price[1]}
            value={filters.price[0]}
            onChange={(e) =>
              setFilters((f) => ({ ...f, price: [Number(e.target.value), f.price[1]] }))
            }
            className="w-20 border border-green-600 rounded px-2 py-1"
          />
          <span>-</span>
          <input
            type="number"
            min={filters.price[0]}
            max={maxPrice}
            value={filters.price[1]}
            onChange={(e) =>
              setFilters((f) => ({ ...f, price: [f.price[0], Number(e.target.value)] }))
            }
            className="w-20 border border-green-600 rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Discount Filter */}
      <div className="mb-2">
        <h3 className="font-semibold mb-2">Discount Range</h3>
        <div className="flex flex-col gap-1">
          {discounts.map((d, i) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="discount"
                checked={filters.discount === d}
                onChange={() => setFilters((f) => ({ ...f, discount: d }))}
                className="accent-green-600"
              />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

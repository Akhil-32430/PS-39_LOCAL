import React from "react";

const SearchBar = ({ value, onChange, placeholder = "Search projects..." }) => {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
      <input
        className="input-search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search projects"
      />
      {value && (
        <button className="btn btn-outline btn-sm" onClick={() => onChange("")}>Clear</button>
      )}
    </div>
  );
};

export default SearchBar;

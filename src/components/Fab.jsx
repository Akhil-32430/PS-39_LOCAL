import React from "react";

const Fab = ({ title = "Add", onClick }) => {
  return (
    <button
      className="fab"
      title={title}
      onClick={onClick}
      aria-label={title}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};

export default Fab;

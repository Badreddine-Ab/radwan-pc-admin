import React, { useState } from "react";

export default function InputSearch({
  input,
  propvalue,
  setSelectedValue,
  isDisabled = false,
}: InputSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newQuery, setNewQuery] = useState("");
  const [value, setValue] = useState(propvalue);

  const clearValue = () => {
    setValue(null);
    setIsOpen(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsOpen(false);
      setValue(newQuery);
      setSelectedValue(newQuery);
    }
  };
  return (
    <div className="relative w-full">
      <button
        id="dropdown-button"
        className={`inline-flex justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
      >
        <span className="mr-2">
          {propvalue ? propvalue : "Click ici pour choisir"}
        </span>
        {value ? (
          <svg
            onClick={clearValue}
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
      {isOpen && (
        <div
          id="dropdown-menu"
          className="z-999 absolute w-full right-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-1 space-y-1"
        >
          <div className="relative">
            <input
              id="search-input"
              className={`block w-full pl-10 pr-4 py-2 text-gray-800 border rounded-md border-gray-300 focus:outline-none ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              type="text"
              placeholder="Chercher..."
              autoComplete="off"
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          {input
            .filter((item) =>
              item.toLowerCase().includes(newQuery.toLowerCase()),
            )
            .map((item, index) => (
              <button
                key={index}
                onMouseDown={() => {
                  setIsOpen(false);
                  setValue(item);
                  setSelectedValue(item);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 active:bg-blue-100 cursor-pointer rounded-md"
                disabled={isDisabled}
              >
                {item}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

interface InputSearchProps {
  input: Array<any>;
  propvalue: any;
  setSelectedValue: (value: any) => void;
  isDisabled?: boolean;
}

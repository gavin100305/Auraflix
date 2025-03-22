import React from "react";

const InputField = ({
  label,
  id,
  type,
  placeholder,
  value,
  onChange,
  required,
  noMargin = false,
}) => {
  return (
    <div className={`${noMargin ? "mt-2" : "space-y-1"}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-300"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-colors"
      />
    </div>
  );
};

export default InputField;

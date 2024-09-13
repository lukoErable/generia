import { FC } from 'react';

interface ModelSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export const ModelSelect: FC<ModelSelectProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  return (
    <div className="w-full">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select select-bordered w-full"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

"use client";
import { CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

type SelectInputProps = {
  label?: string;
  items?: SelectOption[];
  placeholder?: string;
  name?: string;
  required?: boolean;
};
const SelectInput: React.FC<SelectInputProps> = ({ name, required, items = [], placeholder = "Select item", label }) => {
  const context = useFormContext();
  const value = context.watch(name as string);
  const errors = context?.formState.errors ?? {};
  const error = name ? (errors?.[name as keyof typeof errors]?.message as string) : "";

  return (
    <label className="flex flex-col gap-2">
      {label && (
        <CardTitle className="text-black dark:text-white">
          {label} {required && <span className="text-red-600">*</span>}
        </CardTitle>
      )}
      <Select value={value} onValueChange={(value) => value && context.setValue(name as string, value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select</SelectLabel>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500 select-none">{error}</p>}
    </label>
  );
};

export default SelectInput;

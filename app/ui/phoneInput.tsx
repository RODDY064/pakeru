"use client";

import React, { useEffect, useState } from "react";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { CircleFlag } from "react-circle-flags";
import { countries } from "country-data-list";

type PhoneInputProps = {
  register: any;
  setValue: any;
  name: string;
  label?: string;
  defaultCountry?: CountryCode;
  error?: any;
  disabled?: boolean;
  className?: string;
  slim?: boolean;
  placeholder?: string;
  defaultValue?: string;
};

export interface Country {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  currencies: string[];
  emoji?: string;
  ioc: string;
  languages: string[];
  name: string;
  status: string;
}

export default function PhoneInput({
  register,
  setValue,
  name,
  label,
  defaultCountry = "GH",
  error,
  disabled = false,
  className,
  slim = false,
  placeholder = "Select country",
  defaultValue,
}: PhoneInputProps) {
  const [localNumber, setLocalNumber] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setValue("countryCode", "GH");
  }, [setValue]);

  const options = countries.all.filter(
    (country: Country) =>
      country.emoji &&
      country.status !== "deleted" &&
      country.countryCallingCodes.length > 0
  );

  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    options.find((c) => c.alpha2 === defaultCountry)
  );

  // 🧠 Sync default value if provided
  useEffect(() => {
    if (defaultValue) {
      const parsed = parsePhoneNumberFromString(defaultValue);
      if (parsed) {
        const found = options.find((c) => c.alpha2 === parsed.country);
        if (found) {
          setSelectedCountry(found);
          // Set local number without country code
          setLocalNumber(parsed.nationalNumber);
        }
      }
    }
  }, [defaultValue, options]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setLocalNumber(digits);

    const code = selectedCountry?.countryCallingCodes[0] || "";
    const cleanLocal = digits.replace(/^0+/, "");
    const fullNumber = `${code}${cleanLocal}`;
    console.log(fullNumber, "number");
    setValue(name, fullNumber, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // 🧠 Country select
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);

    setValue("countryCode", country.alpha2);
    const code = country.countryCallingCodes[0];
    const fullNumber = `${code}${localNumber}`;

    setValue(name, fullNumber, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // 🧠 Validation with country code
  const validatePhoneNumber = (value: string) => {
    const code = selectedCountry?.alpha2 as CountryCode;
    return (
      isValidPhoneNumber(value, code) ||
      `Invalid ${selectedCountry?.name || "country"} phone number`
    );
  };

  const filteredCountries = options.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.countryCallingCodes.some((c) => c.includes(searchQuery))
  );

  return (
    <div className={className}>
      {label && (
        <label className="font-avenir text-md md:text-lg font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`mt-1 w-full h-10 md:h-11 border border-black/30 rounded flex items-center focus-within:border-blue-600 ${
            error && error[name] ? "border-red-500" : ""
          }`}
        >
          {/* Country selector */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center px-2 h-full gap-2 hover:bg-gray-50"
          >
            {selectedCountry ? (
              <>
                <div className="w-5 h-5 rounded-full overflow-hidden relative">
                  <CircleFlag
                    countryCode={selectedCountry.alpha2.toLowerCase()}
                    height={20}
                  />
                </div>
                {!slim && (
                  <span className="hidden md:inline  font-avenir">
                    {selectedCountry.countryCallingCodes[0]}
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            )}
          </button>

          <div className="w-[1px] h-[70%] bg-black/30" />

          {/* Input for local number only */}
          <input
            {...register(name, { validate: validatePhoneNumber })}
            value={localNumber}
            onChange={handleChange}
            disabled={disabled}
            inputMode="tel"
            type="tel"
            className="w-full h-full px-2 focus:outline-none font-avenir"
            placeholder="551 234 567"
          />
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-72 max-h-60 bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto">
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search country..."
                className="w-full p-2 border rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ul>
              {filteredCountries.map((country) => (
                <li
                  key={country.alpha2}
                  onClick={() => handleCountrySelect(country)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                    <CircleFlag
                      countryCode={country.alpha2.toLowerCase()}
                      height={20}
                    />
                  </div>
                  <span className="font-avenir">{country.name}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {country.countryCallingCodes[0]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && error[name] && (
        <p className="text-sm text-red-500 my-1 font-avenir">
          {error[name].message}
        </p>
      )}
    </div>
  );
}

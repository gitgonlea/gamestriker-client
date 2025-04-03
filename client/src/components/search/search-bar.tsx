// components/search/search-bar.tsx
'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { SERVER_VARIABLES } from '@/lib/constants/server-variables';

interface SearchBarProps {
  initialSelectedValue?: string;
  initialSearchValue?: string;
  isVariable?: string;
  onVariableChange?: (value: string) => void;
  onSearch?: (value: string, type: string) => void;
}

export default function SearchBar({
  initialSelectedValue = '0',
  initialSearchValue = '',
  isVariable = 'admanager_version',
  onVariableChange,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [selectedValue, setSelectedValue] = useState(initialSelectedValue);
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [selectedVar, setSelectedVar] = useState(isVariable);

  useEffect(() => {
    if (isVariable) {
      setSelectedVar(isVariable);
    }
  }, [isVariable]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleClickSearch();
    }
  };

  const handleChangeVar = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedVar(newValue);
    if (onVariableChange) {
      onVariableChange(newValue);
    }
  };

  const handleClickSearch = () => {
    if (onSearch) {
      onSearch(searchValue, selectedValue);
      return;
    }

    const query = ['name', 'map', 'ip', '', '', 'variable'];
    const selValue = parseInt(selectedValue);

    if (selValue === 5) {
      router.push(`/search/variable/${selectedVar}/${searchValue}`);
    } else if (selValue === 4) {
      router.push(`/jugadores?online=true`);
    } else if (selValue === 3) {
      router.push(`/jugadores?name=${searchValue}`);
    } else if (selValue < 3) {
      router.push(`/search/${query[selValue]}/${searchValue}`);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col md:flex-row justify-center items-center bg-sky-500 mt-2 mb-10 p-4 rounded opacity-90 z-10 w-[95%] md:w-auto">
        <div className="flex flex-col mb-4 md:mb-0 md:mr-6 w-full md:w-auto">
          <label className="text-white text-shadow text-sm mb-1">
            {t('searchBy')}
          </label>
          <select
            className="w-full h-8 rounded border-none outline-none px-2"
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
          >
            <option value="0">{t('serverName')}</option>
            <option value="1">{t('mapName')}</option>
            <option value="2">{t('ipAddress')}</option>
            <option value="3">{t('player')}</option>
            <option value="4">{t('onlinePlayers')}</option>
            <option value="5">{t('serverVariables')}</option>
          </select>
        </div>

        {parseInt(selectedValue) === 5 && (
          <div className="flex flex-col mb-4 md:mb-0 md:mr-6 w-full md:w-48">
            <label className="text-white text-shadow text-sm mb-1">
              {t('variable')}...
            </label>
            <select
              className="w-full h-8 rounded border-none outline-none px-2"
              value={selectedVar}
              onChange={handleChangeVar}
            >
              {SERVER_VARIABLES.map((value, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col mb-4 md:mb-0 md:mr-6 w-full md:w-64">
          <label className="text-white text-shadow text-sm mb-1 opacity-0 md:opacity-100">
            {t('searchPlaceholder')}
          </label>
          <input
            type="text"
            className="w-full h-8 rounded border-none outline-none px-2 bg-gray-50"
            placeholder={t('searchPlaceholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          onClick={handleClickSearch}
          className="h-8 mt-6 px-4 rounded bg-amber-400 text-black font-bold text-xs uppercase shadow-md hover:bg-amber-500 transition-colors flex items-center justify-center"
        >
          <MagnifyingGlassIcon className="mr-1" />
        </button>
      </div>
    </div>
  );
}
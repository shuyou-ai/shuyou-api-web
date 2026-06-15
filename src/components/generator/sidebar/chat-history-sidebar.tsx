'use client';

import { SearchIcon } from '../../../icons/icons';
import { NewChat } from './new-chat';

type PropsType = {
  isOpen: boolean;
  toggleIsOpen: () => void;
};

export default function RightSidebar({ isOpen, toggleIsOpen }: PropsType) {
  return (
    <aside
      className={`max-xl:absolute inset-y-0 right-0 z-50 min-w-[288px] max-w-[288px] bg-white dark:bg-dark-primary border-l border-gray-100 dark:border-gray-800 transform transition-transform duration-300 ease-in-out xl:translate-x-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6 flex flex-col gap-6 h-full">
        <div className="space-y-4">
          <NewChat toggleSidebar={toggleIsOpen} />

          <div className="relative">
            <input
              type="search"
              placeholder="Search"
              className="w-full py-2.5 px-4 pr-12 dark:text-white dark:focus:border-gray-600 border border-gray-200 rounded-full dark:bg-dark-primary bg-white focus:outline-none focus:border focus:border-gray-300 text-sm placeholder:text-sm placeholder:text-gray-500 dark:border-gray-700 dark:placeholder:text-white/30 shadow-xs"
            />

            <SearchIcon className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </aside>
  );
}

'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface NavigationTabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPageBlocked: boolean;
  selectedTheme?: string;
  highlightedTabs?: string[];
}

function NavigationTabs({
  tabs = [],
  activeTab = '',
  setActiveTab,
  isPageBlocked = false,
  selectedTheme = 'claro',
  highlightedTabs = [],
}: NavigationTabsProps) {
  const handleTabClick = (tabId: string): void => {
    if (!isPageBlocked && typeof setActiveTab === 'function') {
      setActiveTab(tabId);
    }
  };

  const safeTabs = Array.isArray(tabs) ? tabs : [];

  const isHighlighted = (tabId: string) => {
    return highlightedTabs.includes(tabId);
  };

  const getTabStyle = (tab: Tab, isActive: boolean, isBlocked: boolean) => {
    const highlighted = isHighlighted(tab.id);

    if (isBlocked) {
      return selectedTheme === 'oscuro'
        ? 'text-gray-600 cursor-not-allowed'
        : 'text-gray-400 cursor-not-allowed';
    }

    if (isActive) {
      return 'bg-blue-600 text-white shadow-md';
    }

    if (highlighted) {
      return selectedTheme === 'oscuro'
        ? 'text-white bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg border-2 border-yellow-400 animate-pulse hover:from-yellow-600 hover:to-orange-600'
        : 'text-gray-800 bg-gradient-to-r from-yellow-100 to-orange-100 shadow-lg border-2 border-yellow-400 animate-pulse hover:bg-gradient-to-r hover:from-yellow-200 hover:to-orange-200';
    }

    return selectedTheme === 'oscuro'
      ? 'text-gray-300 hover:bg-gray-700 cursor-pointer hover:shadow-sm'
      : 'text-gray-700 hover:bg-gray-100 cursor-pointer hover:shadow-sm';
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0">
        <div
          className={`${
            selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          } rounded-xl border p-3 sm:p-4 sticky top-24`}
        >
          <nav className="space-y-1 sm:space-y-2">
            {safeTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const highlighted = isHighlighted(tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  disabled={isPageBlocked}
                  className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-all whitespace-nowrap text-sm sm:text-base relative ${getTabStyle(
                    tab,
                    isActive,
                    isPageBlocked
                  )}`}
                >
                  <i
                    className={`${tab.icon || 'ri-home-line'} text-base sm:text-lg flex-shrink-0`}
                  ></i>
                  <span className="font-medium truncate">{tab.label || 'Sin título'}</span>
                  {highlighted && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile/Tablet Horizontal Navigation */}
      <div className="lg:hidden w-full mb-4">
        <div
          className={`${
            selectedTheme === 'oscuro' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          } rounded-xl border p-2 overflow-x-auto`}
        >
          <nav className="flex space-x-1 min-w-max">
            {safeTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const highlighted = isHighlighted(tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  disabled={isPageBlocked}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg text-center transition-all whitespace-nowrap min-w-[80px] relative ${getTabStyle(
                    tab,
                    isActive,
                    isPageBlocked
                  )}`}
                >
                  <i className={`${tab.icon || 'ri-home-line'} text-lg mb-1`}></i>
                  <span className="text-xs font-medium">{tab.label || 'Sin título'}</span>
                  {highlighted && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}

export default NavigationTabs;

import React, { createContext, useContext, useState } from 'react';

const AdminModeContext = createContext();

export const AdminModeProvider = ({ children }) => {
  const [adminMode, setAdminMode] = useState('shop'); // 'shop' or 'website'

  const toggleAdminMode = () => {
    setAdminMode(prev => prev === 'shop' ? 'website' : 'shop');
  };

  return (
    <AdminModeContext.Provider value={{ adminMode, setAdminMode, toggleAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  );
};

export const useAdminMode = () => {
  const context = useContext(AdminModeContext);
  if (!context) {
    throw new Error('useAdminMode must be used within AdminModeProvider');
  }
  return context;
};

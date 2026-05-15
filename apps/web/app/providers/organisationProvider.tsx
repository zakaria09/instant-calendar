'use client'
import useUserOrganisation from '@/hooks/getUserOrganisation/getUserOrganisation';
import {createContext, useContext} from 'react';

type Organisation = {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  createdAt: string;
};

type OrganisationContextType = {
  organisation: Organisation | null;
  isLoading: boolean;
  error: Error | null;
};

const OrganisationContext = createContext<OrganisationContextType | null>(null);

export function OrganisationProvider({children}: {children: React.ReactNode}) {
  const {organisation, isLoadingOrganisation, error} = useUserOrganisation();

  return (
    <OrganisationContext.Provider
      value={{
        organisation,
        isLoading: isLoadingOrganisation,
        error: error as Error | null,
      }}
    >
      {children}
    </OrganisationContext.Provider>
  );
}

export function useOrganisation() {
  const context = useContext(OrganisationContext);
  if (!context) {
    throw new Error('useOrganisation must be used within an OrganisationProvider');
  }
  return context;
}
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  type: 'Individual' | 'Company';
  address: string;
  contactNumber: string;
  bankDetails: BankDetails;
}

interface BeneficiaryContextType {
  beneficiaries: Beneficiary[];
  addBeneficiary: (beneficiary: Omit<Beneficiary, 'id'>) => void;
  updateBeneficiary: (beneficiary: Beneficiary) => void;
  deleteBeneficiary: (id: string) => void;
  getBeneficiary: (id: string) => Beneficiary | undefined;
}

const BeneficiaryContext = createContext<BeneficiaryContextType | undefined>(undefined);

interface BeneficiaryProviderProps {
  children: ReactNode;
}

export const BeneficiaryProvider: React.FC<BeneficiaryProviderProps> = ({ children }) => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      type: 'Individual',
      address: '123 Main St, City',
      contactNumber: '1234567890',
      bankDetails: {
        bankName: 'Sample Bank',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0123456'
      }
    }
  ]);

  const addBeneficiary = (beneficiaryData: Omit<Beneficiary, 'id'>) => {
    const newBeneficiary = {
      ...beneficiaryData,
      id: String(Date.now()),
    };
    setBeneficiaries(prev => [...prev, newBeneficiary]);
  };

  const updateBeneficiary = (updatedBeneficiary: Beneficiary) => {
    setBeneficiaries(prev =>
      prev.map(beneficiary => 
        beneficiary.id === updatedBeneficiary.id ? updatedBeneficiary : beneficiary
      )
    );
  };

  const deleteBeneficiary = (id: string) => {
    setBeneficiaries(prev => prev.filter(beneficiary => beneficiary.id !== id));
  };

  const getBeneficiary = (id: string) => {
    return beneficiaries.find(beneficiary => beneficiary.id === id);
  };

  return (
    <BeneficiaryContext.Provider 
      value={{ 
        beneficiaries, 
        addBeneficiary, 
        updateBeneficiary, 
        deleteBeneficiary,
        getBeneficiary 
      }}
    >
      {children}
    </BeneficiaryContext.Provider>
  );
};

export const useBeneficiaries = () => {
  const context = useContext(BeneficiaryContext);
  if (context === undefined) {
    throw new Error('useBeneficiaries must be used within a BeneficiaryProvider');
  }
  return context;
};

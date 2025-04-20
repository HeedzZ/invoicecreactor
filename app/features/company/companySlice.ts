import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Company } from "../../../types/invoice";

export interface CompanyState {
  company: Company | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CompanyState = {
  company: {
    name: "",
    address: {
      street: "",
      postalCode: "",
      city: "",
      country: "",
    },
    siret: "",
    rcs: "",
    legalForm: "",
    capital: "",
    vatNumber: "",
    isVatExempt: false,
    email: "",
    phone: "",
    website: "",
    logo: "",
  },
  status: "idle",
  error: null,
};

export const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompanyField: (state, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload;
      if (state.company) {
        if (field.startsWith("address.")) {
          const addressField = field.split(".")[1];
          (state.company.address as any)[addressField] = value;
        } else {
          (state.company as any)[field] = value;
        }
      }
    },
  },
});

export const { setCompanyField } = companySlice.actions;

export default companySlice.reducer; 
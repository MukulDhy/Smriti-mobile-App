import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchPatientDetails,
  updatePatientDetails,
  deletePatient,
} from "../../services/patientService";

export const getPatientDetails = createAsyncThunk(
  "patient/getDetails",
  async ({ token, patientId }, { rejectWithValue }) => {
    try {
      console.log("Dispatching getPatientDetails with:", { token, patientId });
      const data = await fetchPatientDetails(token, patientId);
      console.log("Patient data in thunk:", data);

      // Return empty object if data is null/undefined to avoid reducer errors
      return data || {};
    } catch (error) {
      console.error("Error in getPatientDetails thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

export const updatePatient = createAsyncThunk(
  "patient/update",
  async ({ token, patientId, data }, { rejectWithValue }) => {
    try {
      console.log("Dispatching updatePatient with:", {
        token,
        patientId,
        data,
      });
      const response = await updatePatientDetails(token, patientId, data);
      console.log("Update response in thunk:", response);

      return response || {};
    } catch (error) {
      console.error("Error in updatePatient thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

export const removePatient = createAsyncThunk(
  "patient/delete",
  async ({ token, patientId }, { rejectWithValue }) => {
    try {
      console.log("Dispatching removePatient with:", { token, patientId });
      await deletePatient(token, patientId);
      console.log("Patient successfully deleted, returning ID:", patientId);

      // Always return patientId for state updates
      return patientId;
    } catch (error) {
      console.error("Error in removePatient thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

const patientSlice = createSlice({
  name: "patient",
  initialState: {
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    clearPatient: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get patient details
      .addCase(getPatientDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPatientDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure we're not setting undefined data
        state.data = action.payload || null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getPatientDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Keep existing data if available for fallback
        if (!state.data) {
          state.data = null;
        }
      })
      // Update patient
      .addCase(updatePatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure we're not setting undefined data
        state.data = action.payload || state.data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update patient details";
        // Keep previous data on error
      })

      // Remove patient
      .addCase(removePatient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removePatient.fulfilled, (state) => {
        state.isLoading = false;
        state.data = null; // Clear data after successful deletion
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(removePatient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete patient";
        // Keep previous data on error
      });
  },
});

export const { clearPatient } = patientSlice.actions;
export default patientSlice.reducer;

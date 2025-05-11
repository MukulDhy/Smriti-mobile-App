import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCaregiverDetails,
  updateCaregiverDetails,
  deleteCaregiver,
  createCaregiver,
} from "../../services/caregiverService";

export const getCaregiverDetails = createAsyncThunk(
  "caregiver/getDetails",
  async ({ token, patientId }, { rejectWithValue }) => {
    try {
      console.log("Dispatching getCaregiverDetails with:", {
        token,
        patientId,
      });
      const data = await fetchCaregiverDetails(token, patientId);
      console.log("Caregiver data in thunk:", data);

      return data || null;
    } catch (error) {
      console.error("Error in getCaregiverDetails thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

export const updateCaregiver = createAsyncThunk(
  "caregiver/update",
  async ({ token, caregiverId, data }, { rejectWithValue }) => {
    try {
      console.log("Dispatching updateCaregiver with:", {
        token,
        caregiverId,
        data,
      });
      const response = await updateCaregiverDetails(token, caregiverId, data);
      console.log("Update response in thunk:", response);

      return response || {};
    } catch (error) {
      console.error("Error in updateCaregiver thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

export const removeCaregiver = createAsyncThunk(
  "caregiver/delete",
  async ({ token, caregiverId }, { rejectWithValue }) => {
    try {
      console.log("Dispatching removeCaregiver with:", { token, caregiverId });
      await deleteCaregiver(token, caregiverId);
      console.log("Caregiver successfully deleted, returning ID:", caregiverId);

      return caregiverId;
    } catch (error) {
      console.error("Error in removeCaregiver thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

export const addCaregiver = createAsyncThunk(
  "caregiver/create",
  async ({ token, patientId, data }, { rejectWithValue }) => {
    try {
      console.log("Dispatching addCaregiver with:", { token, patientId, data });
      const response = await createCaregiver(token, patientId, data);
      console.log("Create response in thunk:", response);

      return response || {};
    } catch (error) {
      console.error("Error in addCaregiver thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

const caregiverSlice = createSlice({
  name: "caregiver",
  initialState: {
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    clearCaregiver: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get caregiver details
      .addCase(getCaregiverDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCaregiverDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload || null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getCaregiverDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch caregiver details";
        // Consider setting data to null or some default value
        state.data = null;
        state.lastUpdated = new Date().toISOString();
      })

      // Update caregiver
      .addCase(updateCaregiver.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCaregiver.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload || state.data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateCaregiver.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update caregiver details";
      })

      // Remove caregiver
      .addCase(removeCaregiver.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeCaregiver.fulfilled, (state) => {
        state.isLoading = false;
        state.data = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(removeCaregiver.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete caregiver";
      })

      // Add caregiver
      .addCase(addCaregiver.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCaregiver.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addCaregiver.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create caregiver";
      });
  },
});

export const { clearCaregiver } = caregiverSlice.actions;
export default caregiverSlice.reducer;

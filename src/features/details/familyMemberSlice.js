import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchFamilyMembers,
  fetchFamilyMemberById,
  updateFamilyMember,
  deleteFamilyMember,
  createFamilyMember,
} from "../../services/familyMemberService";

// Fetch all family members for a patient
export const getFamilyMembers = createAsyncThunk(
  "familyMembers/getAll",
  async ({ token, patientId }, { rejectWithValue }) => {
    try {
      console.log("Dispatching getFamilyMembers with:", { token, patientId });
      const data = await fetchFamilyMembers(token, patientId);
      console.log("Family members data in thunk:", data);
      return data || [];
    } catch (error) {
      console.error("Error in getFamilyMembers thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

// Fetch single family member by ID
export const getFamilyMemberById = createAsyncThunk(
  "familyMembers/getById",
  async ({ token, familyMemberId }, { rejectWithValue }) => {
    try {
      console.log("Dispatching getFamilyMemberById with:", {
        token,
        familyMemberId,
      });
      const data = await fetchFamilyMemberById(token, familyMemberId);
      console.log("Family member details in thunk:", data);
      return data || null;
    } catch (error) {
      console.error("Error in getFamilyMemberById thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

export const updateExistingFamilyMember = createAsyncThunk(
  "familyMembers/update",
  async ({ token, familyMemberId, data }, { rejectWithValue }) => {
    try {
      console.log("Dispatching updateExistingFamilyMember with:", {
        token,
        familyMemberId,
        data,
      });
      const response = await updateFamilyMember(token, familyMemberId, data);
      console.log("Update response in thunk:", response);
      return response || null;
    } catch (error) {
      console.error("Error in updateExistingFamilyMember thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

export const removeFamilyMember = createAsyncThunk(
  "familyMembers/delete",
  async ({ token, familyMemberId }, { rejectWithValue }) => {
    try {
      console.log("Dispatching removeFamilyMember with:", {
        token,
        familyMemberId,
      });
      await deleteFamilyMember(token, familyMemberId);
      console.log(
        "Family member successfully deleted, returning ID:",
        familyMemberId
      );
      return familyMemberId;
    } catch (error) {
      console.error("Error in removeFamilyMember thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

export const addFamilyMember = createAsyncThunk(
  "familyMembers/create",
  async ({ token, patientId, data }, { rejectWithValue }) => {
    try {
      console.log("Dispatching addFamilyMember with:", {
        token,
        patientId,
        data,
      });
      const response = await createFamilyMember(token, patientId, data);
      console.log("Create response in thunk:", response);
      return response || null;
    } catch (error) {
      console.error("Error in addFamilyMember thunk:", error);
      return rejectWithValue(error.toString());
    }
  }
);

const familyMemberSlice = createSlice({
  name: "familyMembers",
  initialState: {
    list: [], // Array of all family members
    current: null, // Currently selected family member
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    setCurrentFamilyMember: (state, action) => {
      state.current = action.payload;
    },
    clearCurrentFamilyMember: (state) => {
      state.current = null;
    },
    clearFamilyMembers: (state) => {
      state.list = [];
      state.current = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all family members
      .addCase(getFamilyMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFamilyMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload; // payload will always be an array
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getFamilyMembers.rejected, (state, action) => {
        state.isLoading = false;
        // Only set error if not a 500 error
        if (!action.payload?.includes("500")) {
          state.error = action.payload;
        }
        // Keep previous list if available
        if (state.list.length === 0) {
          state.list = [];
        }
      })
      // Get single family member by ID
      .addCase(getFamilyMemberById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFamilyMemberById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.current = action.payload;
      })
      .addCase(getFamilyMemberById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch family member details";
        // Don't clear current on error
      })

      // Update family member
      .addCase(updateExistingFamilyMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExistingFamilyMember.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in list
        state.list = state.list.map((member) =>
          member.id === action.payload.id ? action.payload : member
        );
        // Update current if it's the one being edited
        if (state.current && state.current.id === action.payload.id) {
          state.current = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateExistingFamilyMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update family member";
        // Keep previous data
      })

      // Delete family member
      .addCase(removeFamilyMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFamilyMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter(
          (member) => member.id !== action.payload
        );
        // Clear current if it's the one being deleted
        if (state.current && state.current.id === action.payload) {
          state.current = null;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(removeFamilyMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete family member";
        // Keep previous data
      })

      // Create family member
      .addCase(addFamilyMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFamilyMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = [...state.list, action.payload];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addFamilyMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create family member";
      });
  },
});

export const {
  setCurrentFamilyMember,
  clearCurrentFamilyMember,
  clearFamilyMembers,
} = familyMemberSlice.actions;

export default familyMemberSlice.reducer;

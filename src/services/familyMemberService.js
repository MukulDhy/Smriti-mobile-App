import axios from "axios";
import API_BASE_URL from "../config";

export const fetchFamilyMembers = async (token, patientId) => {
  try {
    console.log("Token and patientId:", token, patientId);
    console.log("API_BASE_URL:", API_BASE_URL);

    const response = await axios.post(
      `${API_BASE_URL}/api/basic/family`,
      { patientId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // Add timeout to prevent hanging
      }
    );

    console.log("API Response:", response.data);

    if (response.data?.data?.familyMembers) {
      console.log(
        "Extracted family members:",
        response.data.data.familyMembers
      );
      return response.data.data.familyMembers;
    }
    return []; // Always return array even if empty
  } catch (error) {
    console.error("Error fetching family members:", error);

    // Handle 500 specifically
    if (error.response?.status === 500) {
      console.warn("Server error, returning empty array");
      return []; // Return empty array instead of throwing for 500
    }

    // For other errors, maintain existing behavior
    // throw (
    //   error.response?.data?.message ||
    //   error.message ||
    //   "Failed to fetch family members"
    // );
  }
};

export const fetchFamilyMemberById = async (token, familyMemberId) => {
  try {
    console.log("Fetching family member with ID:", familyMemberId);

    const response = await axios.get(
      `${API_BASE_URL}/family-members/${familyMemberId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching family member details:", error);
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch family member details"
    );
  }
};

export const updateFamilyMember = async (token, familyMemberId, data) => {
  try {
    console.log("Updating family member:", familyMemberId, data);

    const response = await axios.put(
      `${API_BASE_URL}/family-members/${familyMemberId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating family member:", error);
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to update family member"
    );
  }
};

export const deleteFamilyMember = async (token, familyMemberId) => {
  try {
    console.log("Deleting family member:", familyMemberId);

    const response = await axios.delete(
      `${API_BASE_URL}/family-members/${familyMemberId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Delete response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting family member:", error);
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to delete family member"
    );
  }
};

export const createFamilyMember = async (token, patientId, data) => {
  try {
    console.log("Creating family member for patient:", patientId, data);

    const response = await axios.post(
      `${API_BASE_URL}/patients/${patientId}/family-members`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Create response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating family member:", error);
    // throw (
    //   error.response?.data?.message ||
    //   error.message ||
    //   "Failed to create family member"
    // );
  }
};






import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';
// Thunk: Fetch all team members (e.g., all employees)
const fetchTeamMembers = createAsyncThunk(
  'teamMembers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/hrms/employees');
      // console.log('Fetch all team members API response:', response.data);
      return response.data;
    } catch (error) {
      // console.error('Fetch all team members error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team members');
    }
  }
);

// Thunk: Create a new team
const createTeam = createAsyncThunk(
  'teamMembers/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      // console.log('Creating team with data:', teamData);
      const response = await axiosInstance.post('/team/createteam', {
        projectId: teamData.projectId,
        projectName: teamData.projectName,
        teamLeadId: teamData.teamLeadId,
        teamLeadName: teamData.teamLeadName,
        teamMembers: teamData.teamMembers.map((member) => ({
          memberId: member.memberId,
          memberName: member.memberName,
          role: member.role,
          email: member.email,
        })),
      });

      if (response.data) {
        // console.log('Create team API response:', response.data);
        return response.data;
      } else {
        return rejectWithValue('No data received from server');
      }
    } catch (error) {
      // console.error('Team creation error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create team'
      );
    }
  }
);

// Thunk: Fetch team members by specific team ID (includes team lead)
const fetchTeamMembersByTeamId = createAsyncThunk(
  'teamMembers/fetchByTeamId',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/team/teammembers/${teamId}`);
      // console.log(`Fetch team members for team ${teamId} API response:`, response.data);
      return response.data;
    } catch (error) {
      // console.error(`Fetch team members for team ${teamId} error:`, error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch team members by team ID'
      );
    }
  }
);

// Thunk: Fetch team members EXCLUDING team lead
const fetchTeamMembersExcludingLead = createAsyncThunk(
  'teamMembers/fetchExcludingLead',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/team/teamlead/${teamId}`);
      // console.log(`Fetch team members excluding lead for team ${teamId}:`, response.data);
      return response.data;
    } catch (error) {
      // console.error(`Error fetching team members excluding lead for ${teamId}:`, error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch members excluding team lead'
      );
    }
  }
);

// Thunk: Update a team by team ID
const updateTeam = createAsyncThunk(
  'teamMembers/updateTeam',
  async ({ teamId, teamData }, { rejectWithValue }) => {
    try {
      // console.log(`Updating tea/m ${teamId} with data:`, teamData);
      const response = await axiosInstance.put(`/team/updateteam/${teamId}`, {
        projectId: teamData.projectId,
        teamName: teamData.teamName,
        projectName: teamData.projectName,
        teamLeadId: teamData.teamLeadId,
        teamLeadName: teamData.teamLeadName,
        teamMembers: teamData.teamMembers.map((member) => ({
          memberId: member.memberId,
          memberName: member.memberName,
          role: member.role,
          email: member.email,
        })),
      });

      if (response.data) {
        // console.log(`Update team ${teamId} API response:`, response.data);
        return response.data;
      } else {
        return rejectWithValue('No data received from server');
      }
    } catch (error) {
      // console.error(`Update team ///${teamId} error:`, error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update team'
      );
    }
  }
);

// Slice
const teamMembersSlice = createSlice({
  name: 'teamMembers',
  initialState: {
    members: [],
    teamMembersByTeamId: [],
    teamMembersExcludingLead: [],
    status: 'idle',
    createTeamStatus: 'idle',
    fetchByTeamIdStatus: 'idle',
    fetchExcludingLeadStatus: 'idle',
    updateTeamStatus: 'idle', // Added for update team status
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all team members
      .addCase(fetchTeamMembers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const responseData = action.payload?.data || action.payload;
        if (Array.isArray(responseData)) {
          state.members = responseData.map((member) => ({
            employeeID: member.employeeID || member.id,
            firstName: member.firstName || member.name?.split(' ')[0] || '',
            lastName: member.lastName || member.name?.split(' ')[1] || '',
            email: member.email || '',
          }));
        } else {
          state.members = [];
        }
        // console.log('Processed all team members:', state.members);
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create team
      .addCase(createTeam.pending, (state) => {
        state.createTeamStatus = 'loading';
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state) => {
        state.createTeamStatus = 'succeeded';
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.createTeamStatus = 'failed';
        state.error = action.payload;
      })

      // Fetch team members by team ID (includes team lead)
      .addCase(fetchTeamMembersByTeamId.pending, (state) => {
        state.fetchByTeamIdStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchTeamMembersByTeamId.fulfilled, (state, action) => {
        state.fetchByTeamIdStatus = 'succeeded';
        const responseData = action.payload?.data || action.payload;
        if (Array.isArray(responseData)) {
          state.teamMembersByTeamId = responseData.map((member) => ({
            memberId: member.memberId,
            memberName: member.memberName,
            role: member.role,
            email: member.email,
          }));
        } else {
          state.teamMembersByTeamId = [];
        }
        // console.log('Processed team members by team ID:', state.teamMembersByTeamId);
      })
      .addCase(fetchTeamMembersByTeamId.rejected, (state, action) => {
        state.fetchByTeamIdStatus = 'failed';
        state.error = action.payload;
      })

      // Fetch team members excluding team lead
      .addCase(fetchTeamMembersExcludingLead.pending, (state) => {
        state.fetchExcludingLeadStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchTeamMembersExcludingLead.fulfilled, (state, action) => {
        state.fetchExcludingLeadStatus = 'succeeded';
        const responseData = action.payload?.data || action.payload;
        if (Array.isArray(responseData)) {
          state.teamMembersExcludingLead = responseData.map((member) => ({
            memberId: member.memberId,
            memberName: member.memberName,
            role: member.role,
            email: member.email,
          }));
        } else {
          state.teamMembersExcludingLead = [];
        }
        // console.log('Processed members excluding team lead:', state.teamMembersExcludingLead);
      })
      .addCase(fetchTeamMembersExcludingLead.rejected, (state, action) => {
        state.fetchExcludingLeadStatus = 'failed';
        state.error = action.payload;
      })

      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.updateTeamStatus = 'loading';
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.updateTeamStatus = 'succeeded';
        const responseData = action.payload?.data || action.payload;
        // Optionally update teamMembersByTeamId if the updated team data is returned
        if (responseData && Array.isArray(responseData.teamMembers)) {
          state.teamMembersByTeamId = responseData.teamMembers.map((member) => ({
            memberId: member.memberId,
            memberName: member.memberName,
            role: member.role,
            email: member.email,
          }));
        }
        // console.log('Team updated successfully:', responseData);
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.updateTeamStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export default teamMembersSlice.reducer;

// Export all thunks
export {
  fetchTeamMembers,
  createTeam,
  fetchTeamMembersByTeamId,
  fetchTeamMembersExcludingLead,
  updateTeam, // Added export for updateTeam
};
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/shared/authSlice';
import notificationReducer from '@/features/shared/notificationSlice';
import userReducer from '@/features/shared/userSlice';
import sidebarReducer from '@/features/shared/sidebarSlice';


import teamMembersReducer from '@/features/teamMembersSlice';
import viewTeamByProjectIdReducer from '@/features/viewTeamByProjectIdSlice';
//dashbaord & reports
import dashboardReducer from '@/features/dashboard/dashboardSlice';
import dashReducer from '@/features/dashboard/dashSlice';


import projectReducer from '@/features/projectSlice';
import teamReducer from '@/features/teamSlice';
import taskReducer from '@/features/taskSlice';
import bugReducer from '@/features/bugSlice';

// module reducer
import contactReducer from '@/features/contactSlice';
import meetingReducer from '@/features/meetingSlice';
import teammeetingMomReducer from '@/features/calender/teammeetingMomSlice';
import meetingCalendarReducer from '@/features/calender/meetingCalendarSlice';
import teamMeetingsReducer from '@/features/calender/teammeetingCalenderSlice';
import momReducer from '@/features/momSlice';
import quotationReducer from '@/features/quotationSlice';
import clientReducer from '@/features/clientSlice';
import paymentReducer from '@/features/meeting/paymentSlice'
import causeReducer from '@/features/causeSlice';

//master table
import slotReducer from '@/features/master/slotMasterSlice';
import serviceReducer from '@/features/master/serviceMasterSlice';
import industriesReducer from '@/features/master/industriesMasterSlice';



//meetings

import projectTeamMeetingReducer from "@/features/projectteammeetingSlice"
import projectMeetingsReducer from "@/features/projetMeetingSlice"


import projectMeetReducer from "@/features/projectmeetSlice"


import projectMeetingMomReducer from '@/features/projectmeetingmomSlice'; // Adjust path as needed
import projectShowCauseReducer from '@/features/projectShowCauseSlice';
const store = configureStore({
  reducer: {
    sidebar:sidebarReducer,
  //shared reducers
  auth: authReducer,
  notifications: notificationReducer,
  user: userReducer,

    //dashboard
  dash: dashReducer,
  dashboard:dashboardReducer,
  

  // module reducer
 contact: contactReducer,
  meetings: meetingReducer,
  meetingCalendar: meetingCalendarReducer,
  mom: momReducer,
  quotation : quotationReducer,
  client:clientReducer,
  project:projectReducer,
  task:taskReducer,
  team: teamReducer,
  bugs: bugReducer,
  cause: causeReducer,

  payment: paymentReducer,

  //master
  slots: slotReducer,
  services: serviceReducer,
  industries:industriesReducer,


  teamMeetings:teamMeetingsReducer,
teammeetingMom:teammeetingMomReducer,
    teamMembers: teamMembersReducer,
  projectTeam: viewTeamByProjectIdReducer,

  projectTeamMeeting: projectTeamMeetingReducer,
  projectMeetings:projectMeetingsReducer,




  //project meeting
  projectMeet:projectMeetReducer,
     projectMeetingMom: projectMeetingMomReducer,
  

     //
     projectShowCause: projectShowCauseReducer
  },
})
export default store;
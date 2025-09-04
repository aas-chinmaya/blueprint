

'use client';

import FetchAllProjects from "@/modules/project/FetchAllProjects";
import MyWorkedProject from "@/modules/project/MyWorkedProject";
// import { useLoggedinUser } from "@/hooks/useLoggedinUser";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Page() {
  const { currentUser, loading } = useCurrentUser();
  // console.log("currentUser", currentUser?.id);
  return (
    <div className="px-4 lg:px-6">
      {currentUser?.role === "cpc" ? <FetchAllProjects /> : <MyWorkedProject employeeId={currentUser?.id} />}
    </div>
  );
}



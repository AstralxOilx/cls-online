"use client";

import { useRouter } from "next/navigation";

import { AlertTriangle, LoaderCircle, RefreshCcw } from "lucide-react";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useGetAssignmentStatusStudent } from "@/features/assignments/api/use-get-assignment-student";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { Button } from "@/components/ui/button";
import { usePanel } from "@/hooks/use-panel";

const NAssignment = () => {
  const router = useRouter();
  const classroomId = useClassroomId();
  const { data: user, isLoading: userLoading } = useCurrentUser();


  const { onSubmitAssignment } = usePanel();
  const { data: assignment, isLoading: loadingAssignment } = useGetAssignmentStatusStudent({
    classroomId
  });


  if (loadingAssignment || userLoading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center flex-col gap-2 ">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-y-2 h-full items-center justify-center">
        <AlertTriangle className="size-8 text-red-700" />
        <p className="text-red-700 text-sm">
          ไม่พบข้อมูล ลองใหม่อีกครั้ง!
        </p>
        <Button
          variant={"outline"}
          onClick={() => router.replace("/")}
          className="cursor-pointer"
        >
          <RefreshCcw />
          Refresh Data
        </Button>
      </div>
    )
  }

 
  const notSubmittedAssignments = assignment?.notSubmitted ?? [];
  return (
    <>
      <div className="p-4 h-screen flex flex-col items-center py-4 overflow-y-auto messages-scrollbar">
        <div className="w-full space-y-2">
          <div>
            <h2 className="text-lg font-bold mb-2">การบ้านที่ยังไม่ส่ง</h2>
            <div className="w-full space-y-2">
              {/* ตรวจสอบว่ามีการบ้านที่ยังไม่ส่ง */}
              {notSubmittedAssignments.length > 0 ? (
                notSubmittedAssignments.map((item) => (
                  <div
                  onClick={()=>{onSubmitAssignment(item.assignmentId)}}
                    key={item.assignmentId}
                    className="flex items-center justify-between border p-4 rounded-sm shadow-lg mb-4 hover:bg-accent transition duration-300"
                  >
                    <div>
                      <p>{item.name}</p>
                      <p className="text-xs text-muted-foreground">คะแนนเต็ม:{item.fullScore}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.status}</p> 
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">ไม่มีการบ้านที่ยังไม่ส่ง</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NAssignment;

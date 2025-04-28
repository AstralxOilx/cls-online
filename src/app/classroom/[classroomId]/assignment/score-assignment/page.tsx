"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, LoaderCircle, RefreshCcw } from "lucide-react";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useGetScoreAssignment } from "@/features/assignments/api/use-get-score-assignment";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { Button } from "@/components/ui/button";
import React from "react";

const ScoreAssignment = () => {
  const router = useRouter();
  const classroomId = useClassroomId();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  const { data: scoreAssign, isLoading: loadingScoreAssign } = useGetScoreAssignment({
    classroomId,
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const recordsPerPage = 30;

  if (loadingScoreAssign || userLoading) {
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
        <p className="text-red-700 text-sm">ไม่พบข้อมูล ลองใหม่อีกครั้ง!</p>
        <Button
          variant={"outline"}
          onClick={() => router.replace("/")}
          className="cursor-pointer"
        >
          <RefreshCcw />
          Refresh Data
        </Button>
      </div>
    );
  }

  // Filter students by search query
  const filteredSubmissions = scoreAssign?.[0]?.submissions.filter(submit =>
    submit.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSubmissions.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(filteredSubmissions.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-gradient-to-r from-blue-50/90 to-purple-50/50 rounded-sm shadow-lg">
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="ค้นหาชื่อนักเรียน"
          className="border-2 border-primary rounded-lg p-2 w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-sm shadow-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-primary">
            <tr>
              <th className="py-4 px-6 text-left text-sm font-medium text-white border-b">ชื่อ-นามสกุล</th>
              {scoreAssign?.map((assignment) => (
                <th key={assignment.assignmentId} className="py-4 px-6 text-left text-sm font-medium text-white border-b">
                  {assignment.assignmentName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((submit, index) => (
              <tr key={index} className="hover:bg-indigo-50">
                <td className="py-3 px-6 text-sm text-gray-700 border-b">{submit.studentName}</td>
                {scoreAssign?.map((assignment) => {
                  const submission = assignment.submissions.find(
                    (s) => s.userId === submit.userId
                  );
                  return (
                    <td key={assignment.assignmentId} className="py-3 px-6 text-sm text-gray-700 border-b">
                      {submission ? submission.score : "ยังไม่ส่ง"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          variant="outline"
          className="text-primary border-primary hover:bg-indigo-100"
        >
          ย้อนกลับ
        </Button>
        <span className="text-lg text-primary">หน้า {currentPage} จาก {totalPages}</span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          variant="outline"
          className="text-primary border-primary hover:bg-indigo-100"
        >
          ถัดไป
        </Button>
      </div>
    </div>
  );
};

export default ScoreAssignment;

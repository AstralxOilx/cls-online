
"use client"

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@/features/auth/components/user-button";
import { LoaderCircle } from "lucide-react";
import { useCurrentUser } from "@/features/auth/api/use-current-user";
import { useGetClassrooms } from "@/features/classrooms/api/user-get-classrooms";

export default function Home() {

  const router = useRouter();

  const { data: classrooms, isLoading: classroomsLoading } = useGetClassrooms();

  const classroomId = useMemo(() => classrooms?.[0]?._id, [classrooms]);

  useEffect(() => {
    if (classroomsLoading) return;

    if (classroomId) {
      router.replace(`/classroom/${classroomId}`)
    } else {
      router.replace(`/classroom`)
    }

  }, [classroomId, classroomsLoading])






  return (
    <div className="h-screen flex justify-center items-center">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

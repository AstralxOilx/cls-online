"use client"
 
import { Button } from "@/components/ui/button";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; 
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";  
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useJoinLink } from "@/features/classrooms/api/use-join-link";
import { useGetClassroomInfo } from "@/features/classrooms/api/user-get-classroom-info";
import VerificationInput from "react-verification-input";


const JoinPage = () => {

    const router = useRouter();

    const { mutate, isPending } = useJoinLink();
    const classroomId = useClassroomId();
    const { data, isLoading } = useGetClassroomInfo({ id: classroomId });

    const isMember = useMemo(()=> data?.isMember,[data?.isMember]);

    useEffect(()=>{
        if(isMember){
            router.push(`/classroom/${classroomId}`); 
        }
    },[isMember,router,classroomId])

    const handleComplete = (value: string) => {
        mutate({ classroomId, joinCode: value, },
            {
                onSuccess: (id) => {
                    router.replace(`/classroom/${id}`)
                    toast.success("เข้าร่วมห้องเรียนสำเร็จ!");
                },
                onError: (e) => {
                    toast.error("เข้าร่วมห้องเรียนไม่สำเร็จ!")
                }
            }
        )
    }


    if (isLoading) {
        return (
            <div className=" h-full flex items-center justify-center">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }


    return (
        <>
            <div className="h-screen flex flex-col gap-y-8 items-center justify-center bg-background p-8 rounded-lg shadow-md">
                <Image src="/logo.svg" width={100} height={100} alt="logo" />
                <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
                    <div className=" flex flex-col gap-y-2 items-center justify-center">
                        <h1 className="text-2xl font-bold">
                            เข้าร่วมห้องเรียน {data?.name} 
                        </h1>
                        <p className="text-md text-muted-foreground">
                            กรอกรหัสห้องเพื่อเข้าร่วมห้องเรียน
                        </p>
                    </div>
                    <VerificationInput
                        onComplete={handleComplete}
                        length={6}
                        classNames={{
                            container: cn("flex gap-x-2",isPending && "opacity-50 cursor-not-allowed"),
                            character: "uppercase h-auto rounded-sm border border-gray-30 flex items-center justify-center text-2xl font-medium text-gray-500",
                            characterInactive: "bg-muted",
                            characterSelected: "bg-background",
                            characterFilled: "bg-background",
                        }}
                        autoFocus
                    />
                </div>
                <div className="flex gap-x-4">
                    <Button
                        size={"lg"}
                        variant={"secondary"}
                        asChild
                    >
                        <Link href={"/"}>
                            <ChevronLeft />กลับไปหน้าแรก
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

export default JoinPage;
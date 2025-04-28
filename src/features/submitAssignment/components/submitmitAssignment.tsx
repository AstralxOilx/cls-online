import { AlertCircle, Check, LoaderCircle, Paperclip, X, XIcon } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useChannelId } from "@/hooks/use-channel-Id";
import { toast } from "sonner";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { th } from 'date-fns/locale';
import { useGetSubmitMemberAssignmentById } from "../api/use-get-submit-assignment-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { useClassroomId } from "@/hooks/use-classroom-id";
import { useCreateSubmitAssignmentWithFiles } from "../api/use-crate-submitAssignment";
import { useGetSubmitMemberAssignment } from "../api/use-get-submit-assignment";
import { useGetAssignment } from "@/features/assignments/api/use-get-assignment";
import { useReSubmitAssignment } from "../api/use-resubmit-assignment";

interface ThreadProps {
    assignmentId: Id<"assignments">;
    onClose: () => void;
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("th-TH", {
        weekday: "short",  // วันในสัปดาห์ (เช่น จ., อา.)
        year: "numeric",   // ปี (เช่น 2025)
        month: "long",     // เดือน (เช่น มกราคม)
        day: "numeric"     // วันที่ (เช่น 5)
    });
};



export const SubmitAssignmentById = ({
    assignmentId,
    onClose,
}: ThreadProps) => {

    const classroomId = useClassroomId();

    const [SendAssignmentDialog, confirmSendAssignment] = useConfirm(
        "ส่งงานที่หมอบหมายนี้?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const [ResubmitDialog, confirmResubmit] = useConfirm(
        "อัปเดต?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const [files, setFiles] = useState<File[]>([]);

    const { mutate: submitAssignmentFile, isPending: isSubmitAssignmentFile } = useCreateSubmitAssignmentWithFiles();

    const { data: isAssignment, isLoading: loadingIsAssignment } = useGetSubmitMemberAssignment({ assignmentId });

    const { data: assignmentData, isLoading: loadingAssignmentData } = useGetAssignment({ id: assignmentId });


    const { mutate: reSubmitAssignment, isPending: isReSubmitAssignment } = useReSubmitAssignment();

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    };

    const handleSubmitAssignment = async () => {

        const ok = await confirmSendAssignment();
        if (!ok) return;

        if (files.length <= 0) {
            toast.error("เกิดข้อผิดพลาด กรุณาเพิ่มไฟล์!");
            return;
        }

        await submitAssignmentFile({
            assignmentId,
            classroomId,
            fileObjects: files,
        }, {
            onSuccess: () => {
                toast.success("สร้างการบ้านสำเร็จ!");
                setFiles([]);
                onClose();
            },
            onError: (error) => {
                const message = error?.message || "";

                if (message.includes("[ALREADY_SUBMITTED]")) {
                    toast.error("คุณได้ส่งการบ้านนี้ไปแล้ว");
                } else {
                    toast.error("เกิดข้อผิดพลาด! " + message);
                }
            },

        });
    };


    const downloadFile = async (file: { url: string; name: string }) => {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleResubmission = async (id: string) => {
        // console.log(submitMemberAssignment?.submitAssignment?._id);
        const ok = await confirmResubmit();
        if (!ok) return; // ถ้าไม่ยืนยันก็จะไม่ทำอะไร 

        if (files.length <= 0) {
            toast.error("เกิดข้อผิดพลาด กรุณาเพิ่มไฟล์!");
            return;
        }

        await reSubmitAssignment({
            submitAssignmentId: id as Id<"submitAssignments">,
            fileObjects: files,
        }, {
            onSuccess: () => {
                toast.success("อัปโหลดไฟล์สำเร็จแล้ว!");
                setFiles([]);
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด อัปโหลดไฟล์ไม่สำเร็จแล้ว!");
            }
        })
    }

    if (loadingAssignmentData || loadingIsAssignment) {
        return (
            <div className="h-full w-full flex-col">
                <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                    <p className="text-lg font-bold">งานที่หมอบหมาย</p>
                    <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="h-full flex justify-center items-center flex-col gap-2 ">
                    <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <>
            <SendAssignmentDialog />
            <ResubmitDialog />
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                    <div className="flex gap-1 items-center rounded-sm">
                        <p className="text-md font-semibold p-2 rounded-sm">งานที่หมอบหมาย</p>
                    </div>
                    <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                        <XIcon className="size-5 stroke-[1.5]" />
                    </Button>
                </div>
                <div className="space-y-2 p-2 overflow-y-auto messages-scrollbar">
                    <div className="border p-2 rounded-sm">
                        <div className="w-full border p-2 rounded-sm space-y-2">
                            <p className="text-md font-semibold bg-accent p-2 rounded-sm">ส่งการบ้าน</p>
                            <div className="w-full flex flex-col gap-1 mt-2">
                                <p className="text-lg">{assignmentData?.name}</p>
                                <p className="text-muted-foreground">กำหนดส่ง:{formatDate(assignmentData?.dueDate + '')}</p>
                                <p className="text-muted-foreground">คะแนนเต็ม:{assignmentData?.score}</p>
                                <p className="text-muted-foreground">คำอธิบาย:{assignmentData?.description}</p>
                                <div className="mt-4">
                                    <p>ไฟล์ที่แนบมา:</p>
                                    {assignmentData?.files && assignmentData.files.length > 0 ? (
                                        <ul>
                                            {assignmentData.files.map((file, index) => (
                                                <li key={index} className="mt-2">
                                                    <a
                                                        href={file.url ?? undefined}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500"
                                                    >
                                                        {file.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>ไม่มีไฟล์ที่แนบมา</p>
                                    )}
                                </div>
                            </div>
                            {
                                !isAssignment?.submitted ? (
                                    <>
                                        <Input disabled={isSubmitAssignmentFile} type="file" multiple onChange={handleFileChange} />
                                        {files.length > 0 && (
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                {files.map((file, index) => (
                                                    <li key={index} className="flex justify-between items-center bg-muted/30 p-1 px-2 rounded">
                                                        <span className="flex gap-1"> <Paperclip className="size-4" /> {file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(index)}
                                                            className="flex items-center gap-1 cursor-pointer hover:text-red-600"
                                                        >
                                                            <XIcon className="size-4" />
                                                            ลบ
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <Button className="w-full cursor-pointer" disabled={isSubmitAssignmentFile} onClick={handleSubmitAssignment}>ส่งการบ้าน</Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="mt-4">
                                            <p>ไฟล์ที่ส่ง:</p>
                                            {isAssignment?.submitFiles && isAssignment?.submitFiles.length > 0 ? (
                                                <ul>
                                                    {isAssignment.submitFiles.map((file, index) => (
                                                        <li key={index} className="mt-2">
                                                            <a
                                                                href={file.file}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500"
                                                            >
                                                                {file.name}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p></p>
                                            )}

                                            {
                                                isAssignment.submitAssignment?.canResubmit ? (
                                                    <div>
                                                        <p className="text-muted-foreground">สามารถส่งใหม่ได้</p>
                                                        <Input disabled={isReSubmitAssignment} type="file" multiple onChange={handleFileChange} />
                                                        {files.length > 0 && (
                                                            <ul className="text-sm text-gray-600 space-y-1">
                                                                {files.map((file, index) => (
                                                                    <li key={index} className="flex justify-between items-center bg-muted/30 p-1 px-2 rounded">
                                                                        <span className="flex gap-1"> <Paperclip className="size-4" /> {file.name}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveFile(index)}
                                                                            className="flex items-center gap-1 cursor-pointer hover:text-red-600"
                                                                        >
                                                                            <XIcon className="size-4" />
                                                                            ลบ
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        <Button className="w-full cursor-pointer" disabled={isReSubmitAssignment} onClick={() => handleResubmission(isAssignment.submitAssignment._id)}>ส่งการบ้านใหม่</Button>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">ไม่สามารถส่งใหม่ได้</p>
                                                )
                                            }
                                        </div>
                                    </>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
"use client"

import { Backpack, ChartNoAxesGantt, Check, Divide, LoaderCircle, Paperclip, X, XIcon } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { format, isToday, isYesterday } from "date-fns";
import { th } from 'date-fns/locale';
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useGetAssignment } from "../api/use-get-assignment";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useUpdateAssignmentText } from "../api/use-update-assignment-text";
import { useRemoveFile } from "../api/use-remove-file";
import { useUpdateAssignmentFile } from "../api/use-update-assignment-file";
import { useCreateSubmitAssignmentWithFiles } from "@/features/submitAssignment/api/use-crate-submitAssignment";
import { useGetSubmitAssignments } from "../api/use-get-submitassignments";
import { usePanel } from "@/hooks/use-panel";
import { useGetExistingSubmissionByUserId } from "../api/use-get-existing-submission-by-user-id";
import { useRemoveAssignment } from "../api/use-remove-assignment";
import { useGetSubmitMemberAssignment } from "@/features/submitAssignment/api/use-get-submit-assignment";
import { useReSubmitAssignment } from "@/features/submitAssignment/api/use-resubmit-assignment";


const Editor = dynamic(() => import("@/components/editor"), { ssr: false })

interface ThreadProps {
    assignmentId: Id<"assignments">;
    onClose: () => void;
}

type CreateMessageValues = {
    channelId: Id<"channels">;
    workspaceId: Id<"workspaces">;
    parentMessageId: Id<"messages">;
    body: string;
    image: Id<"_storage"> | undefined;
}
const TIME_THRESHOLD = 5;

const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "วันนี้";
    if (isYesterday(date)) return "เมื่อวาน";

    return format(date, "d MMMM yyyy", { locale: th });
}

export const Assignment = ({
    assignmentId,
    onClose,
}: ThreadProps) => {

    const router = useRouter();
    const workspaceId = useWorkspaceId();

    const [files, setFiles] = useState<File[]>([]);

    // const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [score, setScore] = useState(0);
    const [publishDate, setPublishDate] = useState('');
    const [dueDate, setDueDate] = useState('');

    const [UpdateDataTextDialog, confirmUpdateDataText] = useConfirm(
        "อัปเดต?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );
    const [RemoveFileDialog, confirmRemoveFile] = useConfirm(
        "ลบไฟลนี้?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const [RemoveAssignmentDialog, confirmRemoveAssignment] = useConfirm(
        "ลบงานที่หมอบหมายนี้?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );


    const [SendAssignmentDialog, confirmSendAssignment] = useConfirm(
        "ส่งงานที่หมอบหมายนี้?",
        "การกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    const { data: currentMember, isLoading: isLoadingCurrentMember } = useCurrentMember({
        workspaceId
    });


    const { mutate: updateAssignmentText, isPending: isUpdatingAssignmentText } = useUpdateAssignmentText();
    const { mutate: updateAssignmentFile, isPending: isUpdatingAssignmentFile } = useUpdateAssignmentFile();
    const { mutate: submitAssignmentFile, isPending: isSubmitAssignmentFile } = useCreateSubmitAssignmentWithFiles();
    const { mutate: reSubmitAssignment, isPending: isReSubmitAssignment } = useReSubmitAssignment();


    const { data: Assignment, isLoading: loadingAssignment } = useGetAssignment({ id: assignmentId });
    const { data: submitAssignment, status, loadMore } = useGetSubmitAssignments({ assignmentId });
    const { data: ExistingSubmission, isLoading: isLoadingExistingSubmission } = useGetExistingSubmissionByUserId({ assignmentId, workspaceId });
    const { data: submitMemberAssignment, isLoading: loadingSubmitMemberAssignment } = useGetSubmitMemberAssignment({ assignmentId });



    const { mutate: removeFile, isPending: isRemovingFile } = useRemoveFile();
    const { mutate: removeAssignment, isPending: isRemoveAssignment } = useRemoveAssignment();

    const { onSubmitAssignment, onClose: submissionClose } = usePanel();

    const formatDateForInput = (isoString: string): string => {
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset(); // จำนวนนาทีที่ต้อง offset จาก UTC
      
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
      };
      
    useEffect(() => {
        if (Assignment) {
            setName(Assignment.name);
            setDescription(Assignment.description);
            setScore(Assignment.score);
            setDueDate(formatDateForInput(Assignment.dueDate));
            setPublishDate(formatDateForInput(Assignment.publishDate));
        }

    }, [Assignment]);


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

    const handleDeleteFile = async (id: string) => {
        const ok = await confirmRemoveFile();

        if (!ok) return;

        // ใช้ id เป็น string ตรงๆ โดยไม่ต้องแปลง
        removeFile({ id: id as Id<"files">, assignmentId }, {
            onSuccess: () => {
                toast.success("ลบไฟล์สำเร็จ!");
                // onClose();
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด ลบไฟล์ไม่สำเร็จ!");
            }
        });
    };


    const onUpdateDataText = async () => {

        const ok = await confirmUpdateDataText();
        if (!ok) return;

        updateAssignmentText({
            id: assignmentId as Id<"assignments">,
            name,
            description,
            publishDate: new Date(publishDate).toISOString(),
            dueDate: new Date(dueDate).toISOString(),
            score,
        }, {
            onSuccess: () => {
                toast.success("แก้ไขข้อความสำเร็จแล้ว!");
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด แก้ไขข้อความไม่สำเร็จ!");
            }
        });

    }

    const onUpdateDataFile = async () => {
        // 1. ทำการยืนยันก่อนทำการอัปเดตข้อมูล
        const ok = await confirmUpdateDataText();
        if (!ok) return; // ถ้าไม่ยืนยันก็จะไม่ทำอะไร 

        if (files.length <= 0) {
            toast.error("เกิดข้อผิดพลาด กรุณาเพิ่มไฟล์!");
            return;
        }

        await updateAssignmentFile({
            assignmentId: assignmentId as Id<"assignments">,
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

    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    };

   
    const handleDeleteAssignment = async () => {
        // 1. ทำการยืนยันก่อนทำการอัปเดตข้อมูล
        const ok = await confirmRemoveAssignment();
        if (!ok) return; // ถ้าไม่ยืนยันก็จะไม่ทำอะไร 

        removeAssignment({ assignmentId, workspaceId }, {
            onSuccess: () => {
                toast.success("ลบงานที่หมอบหมายสำเร็จ!");
                submissionClose();
            },
            onError: () => {
                toast.error("เกิดข้อผิดพลาด ลบงานที่หมอบหมายไม่สำเร็จ!");
            }
        });

    };

    const handleResubmission = async () => {
        // console.log(submitMemberAssignment?.submitAssignment?._id);
        const ok = await confirmUpdateDataText();
        if (!ok) return; // ถ้าไม่ยืนยันก็จะไม่ทำอะไร 

        if (files.length <= 0) {
            toast.error("เกิดข้อผิดพลาด กรุณาเพิ่มไฟล์!");
            return;
        }

        await reSubmitAssignment({
            submitAssignmentId: submitMemberAssignment?.submitAssignment?._id as Id<"submitAssignments">,
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

    if (loadingAssignment || status === "LoadingFirstPage") {
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
            <UpdateDataTextDialog />
            <RemoveFileDialog />
            <RemoveAssignmentDialog />
            <SendAssignmentDialog />
            <div className="flex flex-col h-full overflow-y-auto messages-scrollbar mb-16">
                <div className="h-full w-full flex justify-start items-center flex-col gap-y-2 p-1">
                    <div className=" w-full border p-2 rounded-sm grid gap-1">
                        <div className="flex justify-between items-center bg-secondary/50 h-[45px] overflow-hidden px-4">
                            <p className="text-lg font-bold">งานที่หมอบหมาย</p>
                            <Button className="cursor-pointer" onClick={onClose} size={"sm"} variant={"ghost"}>
                                <XIcon className="size-5 stroke-[1.5]" />
                            </Button>
                        </div>
                        <div className="grid gap-1 p-2">
                            <div className="flex gap-1 text-sm">
                                <p className="">ชื่องานที่หมอบหมาย</p>
                            </div>
                            <Input
                                disabled={isUpdatingAssignmentText}
                                type="text"
                                name="name"
                                placeholder="ชื่อการบ้าน"
                                maxLength={50}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                readOnly={currentMember?.role === "teacher" ? false : true}
                                className="border-none"
                            />

                        </div>
                        <div className="grid gap-1">
                            <div className="flex gap-1 text-sm">
                                <p className="">คะแนนเต็ม</p>
                            </div>
                            <Input
                                disabled={isUpdatingAssignmentText}
                                type="number"
                                name="score"
                                placeholder="คะแนน"
                                maxLength={50}
                                value={score}
                                onChange={(e) => setScore(Number(e.target.value))}
                                readOnly={currentMember?.role === "teacher" ? false : true}
                                className="border-none"
                            />

                        </div>
                        <div className="grid gap-1">
                            <div className="flex gap-1 text-sm">
                                <p className="">คำอธิบาย</p>
                            </div>
                            <textarea
                                disabled={isUpdatingAssignmentText}
                                name="description"
                                placeholder="คำอธิบาย"
                                maxLength={255}
                                className="h-24 p-2 border-none rounded-md"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                readOnly={currentMember?.role === "teacher" ? false : true}
                            />
                        </div>
                        <div className="grid gap-1">
                            <div className="flex gap-1 text-sm">
                                <p className="">วันที่เผยแพร่</p>
                            </div>
                            <Input
                                disabled={isUpdatingAssignmentText}
                                type="datetime-local"
                                name="publishDate"
                                value={publishDate}
                                onChange={(e) => setPublishDate(e.target.value)}
                                readOnly={currentMember?.role === "teacher" ? false : true}
                                className="border-none"
                            />
                        </div>
                        <div className="grid gap-1">
                            <div className="flex gap-1 text-sm">
                                <p className="">กำหนดส่ง</p>
                            </div>
                            <Input
                                disabled={false}
                                type="datetime-local"
                                name="dueDate"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                readOnly={currentMember?.role === "teacher" ? false : true}
                                className="border-none"
                            />
                        </div>
                        {
                            currentMember?.role === "teacher" ? (
                                <Button
                                    disabled={isUpdatingAssignmentText}
                                    variant="default"
                                    onClick={() => onUpdateDataText()}
                                    className="w-full flex items-center gap-1 cursor-pointer"
                                >
                                    อัปเดตข้อมูล
                                </Button>
                            ) : null
                        }
                    </div>

                    <div className="w-full border p-2 rounded-sm">
                        <div className="flex flex-col space-y-2">
                            <p className="text-md font-semibold bg-accent p-2 rounded-sm">ไฟล์แนบประกอบงานที่หมอบหมาย</p>
                            {Assignment?.files?.some(f => f.url) ? (
                                Assignment.files
                                    .filter(f => f.url)
                                    .map((file) => (
                                        <div key={file.url} className="w-full flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => downloadFile({ url: file.url!, name: file.name })}
                                                className="cursor-pointer flex-1 flex justify-start items-center gap-2"
                                            >
                                                <Paperclip className="size-4" />
                                                {file.name}
                                            </Button>
                                            {currentMember?.role === "teacher" && (
                                                <Button

                                                    variant="ghost"
                                                    onClick={() => handleDeleteFile(file.id)}
                                                    className="flex items-center gap-1 cursor-pointer hover:text-red-600"
                                                >
                                                    <XIcon className="size-4" />
                                                    ลบ
                                                </Button>
                                            )}
                                        </div>
                                    ))
                            ) : (
                                <p className="text-sm text-muted-foreground px-2">ไม่มีไฟล์แนบ</p>
                            )}
                        </div>
                    </div>
                    {
                        currentMember?.role === "teacher" ? (
                            <div className="w-full border p-2 rounded-sm space-y-2">
                                <p className="text-md font-semibold bg-accent p-2 rounded-sm">เพิ่มไฟล์</p>
                                <Input disabled={false} type="file" multiple onChange={handleFileChange} />
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
                                <Button className="w-full cursor-pointer" disabled={isUpdatingAssignmentFile} onClick={onUpdateDataFile}>อัปเดตไฟล์</Button>
                            </div>
                        ) : (
                            <>
                                {
                                    ExistingSubmission === false ? (
                                        <div className="w-full border p-2 rounded-sm space-y-2">
                                            <p className="text-md font-semibold bg-accent p-2 rounded-sm">ส่งการบ้าน</p>
                                            <div className="flex gap-1 items-center mt-2">
                                                <span className="p-1 bg-red-600 text-white rounded-sm"><X className="size-3" /></span>
                                                <span className="text-xs font-semibold p-2 rounded-sm">ยังไม่ได้ส่งงาน</span>
                                            </div>
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
                                        </div>
                                    ) : null
                                }
                            </>
                        )
                    }
                    {
                        currentMember?.role === "teacher" ? (
                            <div className="w-full border p-2 rounded-sm space-y-2">
                                <Button
                                    onClick={handleDeleteAssignment}
                                    variant={"destructive"}
                                    className="cursor-pointer w-full"
                                >
                                    ลบงานที่หมอบหมาย
                                </Button>
                            </div>
                        ) : null
                    }
                    <div className="w-full border p-2 rounded-sm space-y-2 pb-6">
                        <p className="text-md font-semibold bg-accent p-2 rounded-sm">ข้อมูลการส่งการบ้าน</p>
                        {submitAssignment?.length <= 0 ? (
                            <p className="text-sm text-muted-foreground px-2">ไม่มีข้อมูลการส่งการบ้าน</p>

                            // <div className="flex gap-1 items-center text-red-600 ">
                            //     <span className="p-1 bg-red-600 text-white rounded-md"><X /></span>
                            //     <p className="text-md font-semibold">ยังไม่ได้ส่งงาน</p>
                            // </div>
                        ) : (
                            <div>
                                {
                                    currentMember?.role === "teacher" ? (
                                        <div className="">
                                            {
                                                submitAssignment.map((submit) => (
                                                    <div key={submit._id} className="grid gap-1">
                                                        <Button
                                                            variant={"outline"}
                                                            className="cursor-pointer flex gap-1 justify-start"
                                                            onClick={() => onSubmitAssignment(submit._id)}
                                                        >
                                                            <Backpack className="size-4" />
                                                            {submit.user?.name}
                                                        </Button>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    ) : (
                                        <>
                                            {submitMemberAssignment?.submitAssignment ? (
                                                <div className="grid gap-1">
                                                    {
                                                        submitMemberAssignment.submitAssignment?.canResubmit ? (
                                                            <div>
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
                                                                <Button
                                                                    disabled={isReSubmitAssignment}
                                                                    onClick={handleResubmission}
                                                                    className="cursor-pointer w-full mt-1"
                                                                    variant={"default"}
                                                                >ส่งใหม่</Button>
                                                            </div>

                                                        ) : (
                                                            <p className="text-sm text-muted-foreground p-2 rounded-sm">ไม่สามารถส่งใหม่ได้</p>
                                                        )
                                                    }


                                                    <p className="flex gap-1 items-center text-md font-semibold bg-accent p-2 rounded-sm">
                                                        <span className="p-1 bg-green-500 text-white rounded-md"><Check className="size-4" /></span>
                                                        <span>ส่งงานแล้ว</span>
                                                    </p>
                                                    <div>
                                                        <p className="text-md font-semibold bg-accent p-2 rounded-sm">
                                                            สถานะ: {
                                                                submitMemberAssignment.submitAssignment?.status === "late"
                                                                    ? "ส่งล่าช้า"
                                                                    : submitMemberAssignment.submitAssignment?.status === "submitted"
                                                                        ? "ส่งตรงเวลา"
                                                                        : submitMemberAssignment.submitAssignment?.status === "canResubmit"
                                                                            ? "ส่งใหม่"
                                                                            : "-"
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-md font-semibold bg-accent p-2 rounded-sm">ไฟล์ที่แนบ:</p>
                                                        <div className="mt-2">
                                                            {submitMemberAssignment.submitFiles?.map((file, index) => (
                                                                <div key={file._id} className="w-full flex items-center gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => downloadFile({ url: file.file!, name: file.name })}
                                                                        className="cursor-pointer flex-1 flex justify-start items-center gap-2"
                                                                    >
                                                                        <Paperclip className="size-4" />
                                                                        {file.name}
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {submitMemberAssignment.feedback && (
                                                        <div className="mt-4">
                                                            <p className="text-md font-semibold bg-accent p-2 rounded-sm">ข้อเสนอแนะ</p>
                                                            <div className="p-2 grid gap-1">
                                                                <p>คะแนน: {submitMemberAssignment.feedback.score}/{score}</p>
                                                                <p>ความคิดเห็น: {submitMemberAssignment.feedback.description}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground p-2 rounded-sm">ยังไม่ได้ส่งงาน</p>
                                            )}
                                        </>
                                    )
                                }
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>

    )
}
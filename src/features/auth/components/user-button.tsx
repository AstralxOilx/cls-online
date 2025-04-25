"use client";


// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useCurrentUser } from "../api/use-current-user";
// import { Loader, LoaderCircle, LogOut } from "lucide-react";
// import { useAuthActions } from "@convex-dev/auth/react";

export const UserButton = () => {

    // const { data, isLoading } = useCurrentUser();
    // const { signOut } = useAuthActions();

    // if (isLoading) {
    //     return <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
    // }

    // if (!data) {
    //     return null;
    // }

    // const { image, name, email } = data;

    // const avatarFallback = name!.charAt(0).toLocaleUpperCase();


    return (
        <>
        {/* // <DropdownMenu modal={false}>
        //     <DropdownMenuTrigger className="outline-none relative ">
        //         <Avatar className="size-10 hover:opacity-75 transition rounded-md">
        //             <AvatarImage alt={name} src={image} />
        //             <AvatarFallback className="rounded-md"> {avatarFallback}</AvatarFallback>
        //         </Avatar>
        //     </DropdownMenuTrigger>
        //     <DropdownMenuContent align="center" side="right" className="w-60">
        //         <DropdownMenuItem onClick={() => signOut()} className="h-10">
        //             <LogOut className="size-4 mr-2" />
        //             <span>ออกจากระบบ</span>
        //         </DropdownMenuItem>
        //     </DropdownMenuContent>
        // </DropdownMenu> */}
        </>
    );
}


import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
   ...authTables,
   users: defineTable({
      // ข้อมูลทั่วไป
      fname: v.string(),
      lname: v.string(),
      image: v.optional(v.string()),

      // การเข้าสู่ระบบ
      email: v.string(),
      emailVerificationTime: v.optional(v.number()),
      phone: v.optional(v.string()),
      phoneVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),

      // การยืนยันตัวตน
      identificationCode: v.string(),

      // บทบาทในระบบ
      role: v.union(
         v.literal("student"),
         v.literal("teacher"),
         v.literal("admin")
      ),

      // ข้อมูลเพิ่มเติม 
      gender: v.union(
         v.literal("female"),
         v.literal("male"), 
      ),
      birthdate: v.optional(v.string()),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
   })
      // ทำให้อีเมลต้องไม่ซ้ำกัน
      .index("email", ["email"]),

   // workspaces: defineTable({
   //    name: v.string(),
   //    userId: v.id("users"),
   //    joinCode: v.string(),
   // }),
   // members: defineTable({
   //    userId: v.id("users"),
   //    workspaceId: v.id("workspaces"),
   //    role: v.union(v.literal("teacher"), v.literal("student")),
   // })
   //    .index("by_user_id", ["userId"])
   //    .index("by_workspace_id", ["workspaceId"])
   //    .index("by_workspace_id_user_id", ["workspaceId", "userId"]),
   // channels: defineTable({
   //    name: v.string(),
   //    workspaceId: v.id("workspaces"),
   // })
   //    .index("by_workspace_id", ["workspaceId"]),
   // assignments: defineTable({
   //    name: v.string(),
   //    description: v.string(),
   //    score: v.number(),
   //    publishDate: v.string(),
   //    dueDate: v.string(),
   //    workspaceId: v.id("workspaces"),
   // })
   //    .index("by_workspace_id", ["workspaceId"])
   //    .index("by_workspace_id_and_publish", ["workspaceId", "publishDate",]),
   // files: defineTable({
   //    name: v.string(),
   //    assignmentId: v.id("assignments"),
   //    file: v.optional(v.id("_storage")),
   // })
   //    .index("by_assignment_id", ["assignmentId"]),

   // submitAssignments: defineTable({
   //    workspaceId: v.id("workspaces"),
   //    assignmentId: v.id("assignments"),
   //    userId: v.id("users"),
   //    status: v.union(v.literal("submitted"), v.literal("late"), v.literal("canResubmit")),
   //    canResubmit: v.optional(v.boolean()),
   // })
   //    .index("by_workspace_id", ["workspaceId"])
   //    .index("by_workspace_id_and_assignment_id", ["workspaceId", "assignmentId"])
   //    .index("by_user_id_and_assignment_id", ["userId", "assignmentId"])
   //    .index("by_user_id", ["userId"])
   //    .index("by_assignment_user", ["assignmentId", "userId"]),
   // submitFiles: defineTable({
   //    name: v.string(),
   //    submitAssignmentId: v.id("submitAssignments"),
   //    file: v.optional(v.id("_storage")),
   // })
   //    .index("by_submitAssignments_id", ["submitAssignmentId"]),
   // feedback: defineTable({
   //    submitAssignmentId: v.id("submitAssignments"),
   //    description: v.string(),
   //    score: v.number(),
   // })
   //    .index("by_submitAssignmentId", ["submitAssignmentId"]),
   // attendanceSession: defineTable({
   //    workspaceId: v.id("workspaces"),
   //    title: v.string(),
   //    startTime: v.string(),
   //    endTime: v.string(),
   //    endTeaching: v.string(),
   //    createdBy: v.id("users"),
   // })
   //    .index("by_workspaces", ["workspaceId"])
   //    .index("by_workspace_id_and_startTime_and_endTime", ["workspaceId", "startTime", "endTime",]),
   // attendance: defineTable({
   //    sessionId: v.id("attendanceSession"),
   //    userId: v.id("users"),
   //    description: v.optional(v.string()),
   //    status: v.union(
   //       v.literal("present"),
   //       v.literal("late"),
   //       v.literal("leave"),
   //    ),
   //    timestamp: v.string(), // เวลาที่เช็คชื่อ (optional)
   // })
   //    .index("by_session_user", ["sessionId", "userId"]),
   // conversations: defineTable({
   //    workspaceId: v.id("workspaces"),
   //    menubarOneId: v.id("members"),
   //    menubarTwoId: v.id("members"),
   // })
   //    .index("by_workspace_id", ["workspaceId"]),
   // messages: defineTable({
   //    body: v.string(),
   //    image: v.optional(v.id("_storage")),
   //    memberId: v.id("members"),
   //    workspaceId: v.id("workspaces"),
   //    channelId: v.optional(v.id("channels")),
   //    parentMessageId: v.optional(v.id("messages")),
   //    conversationId: v.optional(v.id("conversations")),
   //    updatedAt: v.optional(v.number()),
   // })
   //    .index("by_workspace_id", ["workspaceId"])
   //    .index("by_member_id", ["memberId"])
   //    .index("by_channel_id", ["channelId"])
   //    .index("by_conversation_id", ["conversationId"])
   //    .index("by_parent_message_id", ["parentMessageId"])
   //    .index("by_channel_id_parent_message_id_conversation_id",
   //       [
   //          "conversationId",
   //          "channelId",
   //          "parentMessageId",
   //       ]),
   // reactions: defineTable({
   //    workspaceId: v.id("workspaces"),
   //    messageId: v.id("messages"),
   //    memberId: v.id("members"),
   //    value: v.string(),
   // })
   //    .index("by_workspace_id", ["workspaceId"])
   //    .index("by_message_id", ["messageId"])
   //    .index("by_member_id", ["memberId"]),

   // notifications: defineTable({
   //    userId: v.id("users"),
   //    workspaceId: v.id("workspaces"),
   //    type: v.string(), // เช่น "new-assignment", "feedback", "announcement", etc.
   //    title: v.string(),
   //    description: v.optional(v.string()),
   //    data: v.optional(v.any()), // เก็บข้อมูลเพิ่มเติม เช่น assignmentId
   //    read: v.boolean(),
   //    createdAt: v.string(),
   // })
   //    .index("by_user_id", ["userId"])
   //    .index("by_workspace_id", ["workspaceId"]),

});

export default schema;
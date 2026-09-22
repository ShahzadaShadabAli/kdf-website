import { z } from "zod";

export const MEMBERSHIP_TYPES = ["honorary", "permanent"];
// "new" = waiting for a decision; the admin either adds the applicant as a
// member ("accepted") or rejects them. "contacted"/"closed" are left over from
// the old inbox flow and are treated as still waiting.
export const MEMBERSHIP_STATUSES = ["new", "accepted", "rejected"];
export const PENDING_MEMBERSHIP_STATUSES = ["new", "contacted", "closed"];
export const isPendingMembership = (status) => PENDING_MEMBERSHIP_STATUSES.includes(status);
export const GENDERS = ["Male", "Female", "Other"];
export const GUARDIAN_RELATIONS = ["S/O", "D/O"];
export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
  "Islamabad Capital Territory",
];

// Pakistani CNIC: 13 digits, with or without the conventional dashes
// (12345-1234567-1).
const CNIC_PATTERN = /^\d{5}-?\d{7}-?\d{1}$/;

export const membershipSubmitSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120),
    guardianRelation: z.enum(GUARDIAN_RELATIONS),
    guardianName: z.string().trim().min(1).max(120),
    gender: z.enum(GENDERS),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(6).max(30),
    cnic: z
      .string()
      .trim()
      .regex(CNIC_PATTERN, "Enter a valid 13-digit CNIC (e.g. 12345-1234567-1)"),
    profession: z.string().trim().max(120).default(""),
    homeAddress: z.string().trim().min(1).max(300),
    province: z.enum(PROVINCES),
    district: z.string().trim().min(1).max(120),
    city: z.string().trim().min(1).max(120),
    membershipType: z.enum(MEMBERSHIP_TYPES),
    disability: z.string().trim().max(200).default(""),
    message: z.string().trim().max(2000).default(""),
    // honeypot — must stay empty; bots that fill every field trip this
    companyWebsite: z.string().max(0).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.membershipType === "permanent" && !data.disability) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["disability"],
        message: "Disability/impairment type is required for permanent membership",
      });
    }
    if (data.membershipType === "permanent" && data.province !== "Gilgit-Baltistan") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["province"],
        message: "Regular membership is open only to permanent residents of Gilgit-Baltistan",
      });
    }
  });

export const membershipUpdateSchema = z.object({
  status: z.enum(MEMBERSHIP_STATUSES),
});

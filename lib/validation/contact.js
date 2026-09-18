import { z } from "zod";

export const CONTACT_STATUSES = ["new", "contacted", "closed"];

export const contactSubmitSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(2000),
  // honeypot — must stay empty; bots that fill every field trip this
  companyWebsite: z.string().max(0).optional().default(""),
});

export const contactUpdateSchema = z.object({
  status: z.enum(CONTACT_STATUSES),
});

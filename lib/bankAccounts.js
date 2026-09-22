const FIELDS = ["bankName", "accountTitle", "accountNumber", "iban", "branchName"];

export const EMPTY_BANK_ACCOUNT = Object.fromEntries(FIELDS.map((f) => [f, ""]));

// Settings saved before multiple accounts existed keep one account in
// top-level fields; treat that as a one-item list.
export function bankAccountsOf(settings) {
  if (settings?.bankAccounts?.length) return settings.bankAccounts;
  const legacy = Object.fromEntries(FIELDS.map((f) => [f, settings?.[f] || ""]));
  return FIELDS.some((f) => legacy[f]) ? [legacy] : [];
}

export const isFilledIn = (account) => FIELDS.some((f) => account[f]?.trim());

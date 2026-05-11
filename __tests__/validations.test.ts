import { describe, it, expect } from "vitest";
import { tenantSchema, receiptSchema, linkTenantSchema, paymentSchema } from "@/lib/validations";

describe("tenantSchema", () => {
  it("accepts valid tenant data", () => {
    const result = tenantSchema.safeParse({
      name: "John Doe",
      familySize: "4",
      baseRent: "15000",
      waterCharge: "500",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = tenantSchema.safeParse({
      name: "",
      familySize: "4",
      baseRent: "15000",
      waterCharge: "500",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
    }
  });

  it("rejects familySize less than 1", () => {
    const result = tenantSchema.safeParse({
      name: "John",
      familySize: "0",
      baseRent: "15000",
      waterCharge: "500",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative rent", () => {
    const result = tenantSchema.safeParse({
      name: "John",
      familySize: "2",
      baseRent: "-100",
      waterCharge: "0",
    });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers to numbers", () => {
    const result = tenantSchema.safeParse({
      name: "John",
      familySize: "3",
      baseRent: "10000",
      waterCharge: "300",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.familySize).toBe(3);
      expect(result.data.baseRent).toBe(10000);
    }
  });
});

describe("receiptSchema", () => {
  it("accepts valid receipt data", () => {
    const result = receiptSchema.safeParse({
      tenantId: "1",
      dateStart: "2026-01-01",
      dateEnd: "2026-01-31",
      includeRent: true,
      includeWater: true,
      includeElectricity: false,
      prevUnit: 0,
      currUnit: 0,
      oldPendingAmount: "0",
      rentPaid: "10000",
      waterPaid: "500",
      electricityPaid: "0",
    });
    expect(result.success).toBe(true);
  });

  it("rejects end date before start date", () => {
    const result = receiptSchema.safeParse({
      tenantId: "1",
      dateStart: "2026-02-01",
      dateEnd: "2026-01-31",
      includeRent: true,
      includeWater: false,
      includeElectricity: false,
      prevUnit: 0,
      currUnit: 0,
      oldPendingAmount: "0",
      rentPaid: "0",
      waterPaid: "0",
      electricityPaid: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejects currUnit less than prevUnit when electricity included", () => {
    const result = receiptSchema.safeParse({
      tenantId: "1",
      dateStart: "2026-01-01",
      dateEnd: "2026-01-31",
      includeRent: false,
      includeWater: false,
      includeElectricity: true,
      prevUnit: 100,
      currUnit: 50,
      oldPendingAmount: "0",
      rentPaid: "0",
      waterPaid: "0",
      electricityPaid: "0",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid electricity readings", () => {
    const result = receiptSchema.safeParse({
      tenantId: "1",
      dateStart: "2026-01-01",
      dateEnd: "2026-01-31",
      includeRent: false,
      includeWater: false,
      includeElectricity: true,
      prevUnit: 50,
      currUnit: 150,
      oldPendingAmount: "0",
      rentPaid: "0",
      waterPaid: "0",
      electricityPaid: "0",
    });
    expect(result.success).toBe(true);
  });
});

describe("linkTenantSchema", () => {
  it("accepts valid name with email", () => {
    const result = linkTenantSchema.safeParse({ name: "John Doe", email: "john@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = linkTenantSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("paymentSchema", () => {
  it("accepts valid payment", () => {
    const result = paymentSchema.safeParse({
      tenantId: "1",
      amount: "5000",
      description: "Rent payment",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero amount", () => {
    const result = paymentSchema.safeParse({
      tenantId: "1",
      amount: "0",
      description: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty description", () => {
    const result = paymentSchema.safeParse({
      tenantId: "1",
      amount: "100",
      description: "",
    });
    expect(result.success).toBe(false);
  });
});

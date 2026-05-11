import {
  tenantSchema,
  editTenantSchema,
  receiptSchema,
  linkTenantSchema,
  paymentSchema,
  roleSchema,
  customChargeSchema,
} from "@/lib/validations";

describe("customChargeSchema", () => {
  it("accepts valid charge", () => {
    expect(customChargeSchema.parse({ name: "Parking", amount: 50 })).toEqual({
      name: "Parking",
      amount: 50,
    });
  });

  it("rejects empty name", () => {
    expect(() => customChargeSchema.parse({ name: "", amount: 50 })).toThrow();
  });

  it("rejects negative amount", () => {
    expect(() => customChargeSchema.parse({ name: "Fee", amount: -1 })).toThrow();
  });

  it("coerces string amount to number", () => {
    expect(customChargeSchema.parse({ name: "Fee", amount: "100" })).toEqual({
      name: "Fee",
      amount: 100,
    });
  });
});

describe("tenantSchema", () => {
  const validTenant = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    familySize: 3,
    baseRent: 15000,
    waterCharge: 500,
  };

  it("accepts valid tenant data", () => {
    expect(tenantSchema.parse(validTenant)).toMatchObject({
      name: "John Doe",
      familySize: 3,
    });
  });

  it("rejects empty name", () => {
    expect(() => tenantSchema.parse({ ...validTenant, name: "" })).toThrow();
  });

  it("rejects name exceeding 100 characters", () => {
    expect(() => tenantSchema.parse({ ...validTenant, name: "a".repeat(101) })).toThrow();
  });

  it("accepts missing email", () => {
    const result = tenantSchema.parse({ ...validTenant, email: "" });
    expect(result.email).toBe("");
  });

  it("rejects invalid email", () => {
    expect(() => tenantSchema.parse({ ...validTenant, email: "not-an-email" })).toThrow();
  });

  it("accepts missing phone", () => {
    const result = tenantSchema.parse({ ...validTenant, phone: "" });
    expect(result.phone).toBe("");
  });

  it("rejects invalid phone", () => {
    expect(() => tenantSchema.parse({ ...validTenant, phone: "abc" })).toThrow();
  });

  it("rejects family size less than 1", () => {
    expect(() => tenantSchema.parse({ ...validTenant, familySize: 0 })).toThrow();
  });

  it("rejects negative base rent", () => {
    expect(() => tenantSchema.parse({ ...validTenant, baseRent: -100 })).toThrow();
  });

  it("accepts zero base rent", () => {
    const result = tenantSchema.parse({ ...validTenant, baseRent: 0 });
    expect(result.baseRent).toBe(0);
  });

  it("defaults custom charges to empty array", () => {
    const result = tenantSchema.parse(validTenant);
    expect(result.customCharges).toEqual([]);
  });

  it("coerces string numbers", () => {
    const result = tenantSchema.parse({
      ...validTenant,
      familySize: "2",
      baseRent: "10000",
      waterCharge: "300",
    });
    expect(result.familySize).toBe(2);
    expect(result.baseRent).toBe(10000);
    expect(result.waterCharge).toBe(300);
  });
});

describe("editTenantSchema", () => {
  const validEdit = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+9876543210",
    familySize: 4,
    baseRent: 20000,
    waterCharge: 600,
  };

  it("accepts valid edit data", () => {
    expect(editTenantSchema.parse(validEdit)).toMatchObject({
      name: "Jane Doe",
      familySize: 4,
    });
  });

  it("rejects family size above 50", () => {
    expect(() => editTenantSchema.parse({ ...validEdit, familySize: 51 })).toThrow();
  });

  it("has no customCharges field", () => {
    const result = editTenantSchema.parse(validEdit);
    expect((result as any).customCharges).toBeUndefined();
  });
});

describe("receiptSchema", () => {
  const validReceipt = {
    tenantId: 1,
    dateStart: "2024-01-01",
    dateEnd: "2024-01-31",
    includeRent: true,
    includeWater: true,
    includeElectricity: false,
    oldPendingAmount: 0,
    rentPaid: 0,
    waterPaid: 0,
    electricityPaid: 0,
  };

  it("accepts valid receipt data", () => {
    expect(receiptSchema.parse(validReceipt)).toMatchObject({
      tenantId: 1,
      dateStart: "2024-01-01",
    });
  });

  it("rejects end date before start date", () => {
    expect(() =>
      receiptSchema.parse({
        ...validReceipt,
        dateStart: "2024-02-01",
        dateEnd: "2024-01-31",
      }),
    ).toThrow("End date must be on or after start date");
  });

  it("accepts same start and end date", () => {
    const result = receiptSchema.parse({
      ...validReceipt,
      dateStart: "2024-01-01",
      dateEnd: "2024-01-01",
    });
    expect(result.dateEnd).toBe("2024-01-01");
  });

  it("rejects curr unit < prev unit when electricity is included", () => {
    expect(() =>
      receiptSchema.parse({
        ...validReceipt,
        includeElectricity: true,
        prevUnit: 100,
        currUnit: 50,
      }),
    ).toThrow("Current reading must be >= previous reading");
  });

  it("accepts curr unit >= prev unit when electricity is included", () => {
    const result = receiptSchema.parse({
      ...validReceipt,
      includeElectricity: true,
      prevUnit: 100,
      currUnit: 150,
    });
    expect(result.currUnit).toBe(150);
  });

  it("defaults optional fields correctly", () => {
    const result = receiptSchema.parse({
      tenantId: 1,
      dateStart: "2024-01-01",
      dateEnd: "2024-01-31",
    });
    expect(result.includeRent).toBe(true);
    expect(result.includeWater).toBe(true);
    expect(result.includeElectricity).toBe(true);
    expect(result.oldPendingAmount).toBe(0);
    expect(result.customCharges).toEqual([]);
  });
});

describe("linkTenantSchema", () => {
  it("accepts valid link data", () => {
    expect(linkTenantSchema.parse({ name: "John", email: "john@test.com" })).toMatchObject({
      name: "John",
      email: "john@test.com",
    });
  });

  it("rejects empty name", () => {
    expect(() => linkTenantSchema.parse({ name: "", email: "john@test.com" })).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() => linkTenantSchema.parse({ name: "John", email: "bad" })).toThrow();
  });

  it("accepts optional phone", () => {
    const result = linkTenantSchema.parse({
      name: "John",
      email: "john@test.com",
      phone: "+1234567890",
    });
    expect(result.phone).toBe("+1234567890");
  });

  it("accepts empty phone", () => {
    const result = linkTenantSchema.parse({
      name: "John",
      email: "john@test.com",
      phone: "",
    });
    expect(result.phone).toBe("");
  });
});

describe("paymentSchema", () => {
  it("accepts valid payment", () => {
    expect(
      paymentSchema.parse({
        tenantId: 1,
        amount: 5000,
        description: "January rent",
      }),
    ).toMatchObject({ amount: 5000 });
  });

  it("rejects amount <= 0", () => {
    expect(() =>
      paymentSchema.parse({
        tenantId: 1,
        amount: 0,
        description: "Zero",
      }),
    ).toThrow();
  });

  it("rejects empty description", () => {
    expect(() =>
      paymentSchema.parse({
        tenantId: 1,
        amount: 100,
        description: "",
      }),
    ).toThrow();
  });

  it("coerces string amount to number", () => {
    const result = paymentSchema.parse({
      tenantId: "1",
      amount: "5000",
      description: "Payment",
    });
    expect(result.tenantId).toBe(1);
    expect(result.amount).toBe(5000);
  });
});

describe("roleSchema", () => {
  it("accepts landlord", () => {
    expect(roleSchema.parse("landlord")).toBe("landlord");
  });

  it("accepts tenant", () => {
    expect(roleSchema.parse("tenant")).toBe("tenant");
  });

  it("rejects invalid role", () => {
    expect(() => roleSchema.parse("admin")).toThrow();
  });
});

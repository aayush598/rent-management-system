import { tenants, bills, payments } from "@/db/schema";

describe("Database Schema", () => {
  describe("tenants table", () => {
    it("has the correct column names", () => {
      const colNames = Object.keys(tenants);
      expect(colNames).toContain("id");
      expect(colNames).toContain("userId");
      expect(colNames).toContain("tenantUserId");
      expect(colNames).toContain("name");
      expect(colNames).toContain("email");
      expect(colNames).toContain("phone");
      expect(colNames).toContain("familySize");
      expect(colNames).toContain("baseRent");
      expect(colNames).toContain("waterCharge");
      expect(colNames).toContain("customCharges");
      expect(colNames).toContain("isLandlordConfirmed");
      expect(colNames).toContain("isTenantConfirmed");
      expect(colNames).toContain("createdAt");
    });

    it("has id as a primary key column", () => {
      expect(tenants.id).toBeDefined();
      expect(tenants.id.primary).toBe(true);
    });

    it("has required columns marked as not null", () => {
      expect(tenants.name.notNull).toBe(true);
      expect(tenants.userId.notNull).toBe(true);
      expect(tenants.familySize.notNull).toBe(true);
    });

    it("has optional columns without notNull", () => {
      expect(tenants.email.notNull).toBe(false);
      expect(tenants.phone.notNull).toBe(false);
      expect(tenants.tenantUserId.notNull).toBe(false);
    });

    it("has jsonb column for custom charges", () => {
      expect(tenants.customCharges).toBeDefined();
    });
  });

  describe("bills table", () => {
    it("has the correct column names", () => {
      const colNames = Object.keys(bills);
      expect(colNames).toContain("id");
      expect(colNames).toContain("tenantId");
      expect(colNames).toContain("dateStart");
      expect(colNames).toContain("dateEnd");
      expect(colNames).toContain("month");
      expect(colNames).toContain("rentAmount");
      expect(colNames).toContain("waterAmount");
      expect(colNames).toContain("oldPendingAmount");
      expect(colNames).toContain("electricityPrevUnit");
      expect(colNames).toContain("electricityCurrUnit");
      expect(colNames).toContain("electricityAmount");
      expect(colNames).toContain("customCharges");
      expect(colNames).toContain("totalAmount");
      expect(colNames).toContain("rentPaid");
      expect(colNames).toContain("waterPaid");
      expect(colNames).toContain("electricityPaid");
      expect(colNames).toContain("totalPaid");
      expect(colNames).toContain("isPaid");
      expect(colNames).toContain("createdAt");
    });

    it("has tenantId as foreign key", () => {
      expect(bills.tenantId).toBeDefined();
      expect(bills.tenantId.notNull).toBe(true);
      expect(bills.tenantId.primary).toBe(false);
    });
  });

  describe("payments table", () => {
    it("has the correct column names", () => {
      const colNames = Object.keys(payments);
      expect(colNames).toContain("id");
      expect(colNames).toContain("tenantId");
      expect(colNames).toContain("billId");
      expect(colNames).toContain("amount");
      expect(colNames).toContain("paymentDate");
      expect(colNames).toContain("description");
    });
  });
});

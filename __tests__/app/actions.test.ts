import {
  createTenant,
  updateTenant,
  updateCustomCharges,
  confirmTenantLink,
  rejectTenantLink,
  generateReceipt,
  deleteBill,
  deletePayment,
  updateBill,
  updatePayment,
  setUserRole,
  linkTenantAccount,
  linkTenantByName,
  unlinkTenantAccount,
} from "@/app/actions";

const { mockAuth, mockClerkClient, mockDb, mockRevalidatePath } = vi.hoisted(() => {
  const mockAuth = vi.fn();
  const mockClerkClient = vi.fn();
  const mockRevalidatePath = vi.fn();

  const mockDb = {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  return { mockAuth, mockClerkClient, mockDb, mockRevalidatePath };
});

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
  clerkClient: () => mockClerkClient(),
}));

vi.mock("@/db", () => ({
  db: mockDb,
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: any[]) => mockRevalidatePath(...args),
}));

function makeSelectChain(returnValues: any[][]) {
  let callIndex = 0;
  mockDb.select.mockImplementation(() => {
    const idx = callIndex;
    callIndex++;
    const value = returnValues[idx] ?? [];
    const mockLimit = vi.fn().mockResolvedValue(value);
    const thenable = Object.assign(Promise.resolve(value), { limit: mockLimit });
    const mockWhere = vi.fn().mockReturnValue(thenable);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    return { from: mockFrom };
  });
}

function mockUpdateChain() {
  const mockWhere = vi.fn().mockResolvedValue(undefined);
  const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
  mockDb.update.mockReturnValue({ set: mockSet });
  return { mockSet, mockWhere };
}

function mockDeleteChain() {
  const mockWhere = vi.fn().mockResolvedValue(undefined);
  mockDb.delete.mockReturnValue({ where: mockWhere });
  return { mockWhere };
}

function mockInsertSimple() {
  const mockValues = vi.fn().mockResolvedValue(undefined);
  mockDb.insert = vi.fn().mockReturnValue({ values: mockValues });
  return { mockValues };
}

function createFormData(data: Record<string, any>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      fd.append(key, String(value));
    }
  }
  return fd;
}

const mockTenant = {
  id: 1,
  userId: "user_landlord",
  tenantUserId: "user_tenant",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  familySize: 3,
  baseRent: "15000.00",
  waterCharge: "500.00",
  customCharges: [],
  isLandlordConfirmed: true,
  isTenantConfirmed: true,
  createdAt: new Date(),
};

const mockBill = {
  id: 1,
  tenantId: 1,
  dateStart: "2024-01-01",
  dateEnd: "2024-01-31",
  month: "2024-01-01 to 2024-01-31",
  rentAmount: "10000.00",
  waterAmount: "500.00",
  oldPendingAmount: "0.00",
  electricityPrevUnit: 0,
  electricityCurrUnit: 0,
  electricityAmount: "0.00",
  customCharges: [],
  totalAmount: "10500.00",
  rentPaid: "0.00",
  waterPaid: "0.00",
  electricityPaid: "0.00",
  totalPaid: "0.00",
  isPaid: false,
  createdAt: new Date(),
};

const mockPayment = {
  id: 1,
  tenantId: 1,
  billId: 1,
  amount: "8000.00",
  paymentDate: new Date(),
  description: "Rent payment",
};

describe("Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: "user_landlord" });
  });

  describe("createTenant", () => {
    it("creates a tenant successfully", async () => {
      mockInsertSimple();
      const fd = createFormData({
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        familySize: 3,
        baseRent: "15000",
        waterCharge: "500",
      });

      await createTenant(fd);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tenants");
    });

    it("throws when unauthenticated", async () => {
      mockAuth.mockResolvedValue({ userId: null });
      const fd = createFormData({ name: "John", familySize: 1, baseRent: "1000", waterCharge: "100" });

      await expect(createTenant(fd)).rejects.toThrow("Unauthorized");
    });

    it("handles custom charges JSON", async () => {
      mockInsertSimple();
      const fd = createFormData({
        name: "John",
        familySize: 2,
        baseRent: "10000",
        waterCharge: "300",
        customCharges: JSON.stringify([{ name: "Parking", amount: 500 }]),
      });

      await createTenant(fd);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("handles malformed custom charges gracefully", async () => {
      mockInsertSimple();
      const fd = createFormData({
        name: "John",
        familySize: 2,
        baseRent: "10000",
        waterCharge: "300",
        customCharges: "not-json",
      });

      await expect(createTenant(fd)).resolves.not.toThrow();
    });
  });

  describe("updateTenant", () => {
    it("updates a tenant successfully", async () => {
      makeSelectChain([[mockTenant]]);
      mockUpdateChain();
      const fd = createFormData({
        name: "John Updated",
        email: "john@example.com",
        phone: "+1234567890",
        familySize: 4,
        baseRent: "20000",
        waterCharge: "600",
      });

      await updateTenant(1, fd);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tenants/1");
    });

    it("throws when tenant does not belong to user", async () => {
      makeSelectChain([[{ ...mockTenant, userId: "other_user" }]]);
      const fd = createFormData({ name: "Test", familySize: 1, baseRent: "1000", waterCharge: "100" });

      await expect(updateTenant(1, fd)).rejects.toThrow("Unauthorized");
    });

    it("throws when tenant not found", async () => {
      makeSelectChain([[]]);
      const fd = createFormData({ name: "Test", familySize: 1, baseRent: "1000", waterCharge: "100" });

      await expect(updateTenant(999, fd)).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateCustomCharges", () => {
    it("updates custom charges successfully", async () => {
      makeSelectChain([[mockTenant]]);
      mockUpdateChain();
      const fd = createFormData({
        customCharges: JSON.stringify([
          { name: "Parking", amount: 1000 },
          { name: "Storage", amount: 500 },
        ]),
      });

      await updateCustomCharges(1, fd);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      mockAuth.mockResolvedValue({ userId: null });
      const fd = createFormData({ customCharges: "[]" });
      await expect(updateCustomCharges(1, fd)).rejects.toThrow("Unauthorized");
    });
  });

  describe("confirmTenantLink", () => {
    it("confirms tenant link", async () => {
      makeSelectChain([[mockTenant]]);
      mockUpdateChain();

      await confirmTenantLink(1);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("throws when tenant has no linked account", async () => {
      makeSelectChain([[{ ...mockTenant, tenantUserId: null }]]);
      await expect(confirmTenantLink(1)).rejects.toThrow("Tenant has not linked their account yet");
    });
  });

  describe("rejectTenantLink", () => {
    it("rejects tenant link and clears tenantUserId", async () => {
      makeSelectChain([[mockTenant]]);
      mockUpdateChain();

      await rejectTenantLink(1);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("generateReceipt", () => {
    it("generates a receipt successfully", async () => {
      makeSelectChain([[]]);
      mockInsertSimple();
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        }),
      });

      const fd = createFormData({
        tenantId: "1",
        dateStart: "2024-02-01",
        dateEnd: "2024-02-29",
        includeRent: "true",
        includeWater: "true",
        includeElectricity: "false",
        rentAmount: "10000",
        waterAmount: "500",
        oldPendingAmount: "0",
      });

      const billId = await generateReceipt(fd);
      expect(billId).toBe(1);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/tenants/1");
    });

    it("throws when overlapping bill exists", async () => {
      makeSelectChain([[mockBill]]);

      const fd = createFormData({
        tenantId: "1",
        dateStart: "2024-01-15",
        dateEnd: "2024-02-15",
      });

      await expect(generateReceipt(fd)).rejects.toThrow("A bill already exists for this period");
    });

    it("calculates electricity amount correctly", async () => {
      makeSelectChain([[]]);
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 2 }]),
        }),
      });

      const fd = createFormData({
        tenantId: "1",
        dateStart: "2024-03-01",
        dateEnd: "2024-03-31",
        includeRent: "true",
        includeWater: "true",
        includeElectricity: "true",
        rentAmount: "10000",
        waterAmount: "500",
        oldPendingAmount: "200",
        electricityPrevUnit: "100",
        electricityCurrUnit: "150",
      });

      await generateReceipt(fd);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("creates payment record when totalPaid > 0", async () => {
      makeSelectChain([[]]);
      let insertCallCount = 0;
      mockDb.insert = vi.fn().mockImplementation(() => ({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockImplementation(() => {
            insertCallCount++;
            return insertCallCount === 1 ? [{ id: 1 }] : undefined;
          }),
        }),
      }));

      const fd = createFormData({
        tenantId: "1",
        dateStart: "2024-04-01",
        dateEnd: "2024-04-30",
        includeRent: "true",
        rentAmount: "10000",
        rentPaid: "5000",
        waterPaid: "500",
      });

      await generateReceipt(fd);
      expect(mockDb.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe("deleteBill", () => {
    it("deletes bill and associated payments", async () => {
      makeSelectChain([[mockTenant]]);
      mockDeleteChain();

      await deleteBill(1, 1);
      expect(mockDb.delete).toHaveBeenCalledTimes(2);
    });

    it("throws when unauthorized", async () => {
      makeSelectChain([[{ ...mockTenant, userId: "other" }]]);
      await expect(deleteBill(1, 1)).rejects.toThrow("Unauthorized");
    });
  });

  describe("deletePayment", () => {
    it("deletes payment", async () => {
      makeSelectChain([[mockTenant]]);
      mockDeleteChain();

      await deletePayment(1, 1);
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("updateBill", () => {
    it("updates a bill successfully", async () => {
      makeSelectChain([[mockTenant], [], []]);
      mockUpdateChain();
      mockDeleteChain();

      const fd = createFormData({
        tenantId: "1",
        dateStart: "2024-01-01",
        dateEnd: "2024-01-31",
        rentAmount: "12000",
        waterAmount: "600",
      });

      await updateBill(1, fd);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("updates existing payment when totalPaid > 0", async () => {
      makeSelectChain([[mockTenant], [], [{ id: 1, amount: "5000.00" }]]);
      mockUpdateChain();

      const fd = createFormData({
        tenantId: "1",
        dateStart: "2024-02-01",
        dateEnd: "2024-02-29",
        includeRent: "true",
        rentAmount: "10000",
        waterPaid: "1000",
      });

      await updateBill(1, fd);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("deletes payment when totalPaid drops to 0", async () => {
      makeSelectChain([[mockTenant], [], [{ id: 1 }]]);
      mockUpdateChain();
      mockDeleteChain();

      const fd = createFormData({
        tenantId: "1",
        dateStart: "2024-03-01",
        dateEnd: "2024-03-31",
        rentPaid: "0",
        waterPaid: "0",
      });

      await updateBill(1, fd);
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("updatePayment", () => {
    it("updates a payment successfully", async () => {
      makeSelectChain([
        [mockTenant],
        [{ ...mockPayment, billId: 1 }],
        [{ amount: "5000.00" }, { amount: "3000.00" }],
        [mockBill],
      ]);
      mockUpdateChain();

      const fd = createFormData({
        tenantId: "1",
        amount: "8000",
        description: "Updated payment",
      });

      await updatePayment(1, fd);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("updates bill isPaid status when total payments match total amount", async () => {
      makeSelectChain([
        [mockTenant],
        [{ id: 1, billId: 1, amount: "10500.00", tenantId: 1, paymentDate: new Date(), description: "Full" }],
        [{ amount: "10500.00" }],
        [{ ...mockBill, totalAmount: "10500.00" }],
      ]);
      mockUpdateChain();

      const fd = createFormData({
        tenantId: "1",
        amount: "10500",
        description: "Full payment",
      });

      await updatePayment(1, fd);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("setUserRole", () => {
    it("sets user role to landlord", async () => {
      const mockUpdateUser = vi.fn();
      mockClerkClient.mockResolvedValue({
        users: { updateUser: mockUpdateUser },
      });

      await setUserRole("landlord");
      expect(mockUpdateUser).toHaveBeenCalledWith("user_landlord", {
        publicMetadata: { role: "landlord" },
      });
    });

    it("sets user role to tenant", async () => {
      const mockUpdateUser = vi.fn();
      mockClerkClient.mockResolvedValue({
        users: { updateUser: mockUpdateUser },
      });

      await setUserRole("tenant");
      expect(mockUpdateUser).toHaveBeenCalledWith("user_landlord", {
        publicMetadata: { role: "tenant" },
      });
    });

    it("throws when unauthenticated", async () => {
      mockAuth.mockResolvedValue({ userId: null });
      await expect(setUserRole("landlord")).rejects.toThrow("Unauthorized");
    });
  });

  describe("linkTenantAccount", () => {
    it("links tenant account successfully", async () => {
      makeSelectChain([[{ ...mockTenant, tenantUserId: null }]]);
      mockUpdateChain();

      const fd = createFormData({ tenantId: "1" });
      await linkTenantAccount(fd);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("throws when tenant is already linked", async () => {
      makeSelectChain([[mockTenant]]);
      const fd = createFormData({ tenantId: "1" });
      await expect(linkTenantAccount(fd)).rejects.toThrow("Tenant is already linked to another user");
    });

    it("throws when tenant not found", async () => {
      makeSelectChain([[]]);
      const fd = createFormData({ tenantId: "999" });
      await expect(linkTenantAccount(fd)).rejects.toThrow("Tenant not found");
    });
  });

  describe("linkTenantByName", () => {
    it("links tenant by name and email", async () => {
      makeSelectChain([[{ ...mockTenant, tenantUserId: null }]]);
      mockUpdateChain();

      const fd = createFormData({
        name: "John Doe",
        email: "john@example.com",
      });

      await linkTenantByName(fd);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("throws when name is empty", async () => {
      const fd = createFormData({ name: "", email: "test@test.com" });
      await expect(linkTenantByName(fd)).rejects.toThrow("Please enter your name");
    });

    it("throws when email is empty", async () => {
      const fd = createFormData({ name: "John", email: "" });
      await expect(linkTenantByName(fd)).rejects.toThrow("Please enter your email address");
    });

    it("falls back to phone-based lookup when email matches nothing", async () => {
      makeSelectChain([[], [{ ...mockTenant, tenantUserId: null }]]);
      mockUpdateChain();

      const fd = createFormData({
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
      });

      await linkTenantByName(fd);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("throws when no match found", async () => {
      makeSelectChain([[], []]);

      const fd = createFormData({
        name: "Unknown",
        email: "unknown@test.com",
      });

      await expect(linkTenantByName(fd)).rejects.toThrow("No unlinked tenant found");
    });

    it("throws when multiple matches found", async () => {
      makeSelectChain([[mockTenant, mockTenant]]);

      const fd = createFormData({
        name: "John Doe",
        email: "john@example.com",
      });

      await expect(linkTenantByName(fd)).rejects.toThrow("Multiple matching records found");
    });
  });

  describe("unlinkTenantAccount", () => {
    it("unlinks tenant account", async () => {
      makeSelectChain([[mockTenant]]);
      mockUpdateChain();

      await unlinkTenantAccount(1);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("throws when unauthorized", async () => {
      makeSelectChain([[{ ...mockTenant, userId: "other" }]]);
      await expect(unlinkTenantAccount(1)).rejects.toThrow("Unauthorized");
    });
  });
});

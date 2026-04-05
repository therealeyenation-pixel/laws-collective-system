import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import * as assetService from "../services/expanded-asset-management";

export const expandedAssetManagementRouter = router({
  // Asset CRUD
  createAsset: protectedProcedure
    .input(z.object({
      name: z.string(), description: z.string(),
      category: z.enum(["equipment", "software", "vehicle", "furniture", "technology", "tools", "machinery"]),
      purchaseDate: z.date(), purchasePrice: z.number(), salvageValue: z.number(),
      usefulLifeYears: z.number(), depreciationMethod: z.enum(["straight_line", "declining_balance", "double_declining", "sum_of_years", "units_of_production"]),
      location: z.string(), building: z.string().optional(), room: z.string().optional(),
      serialNumber: z.string().optional(), manufacturer: z.string().optional(), model: z.string().optional(),
      warrantyExpiration: z.date().optional(), houseId: z.string().optional(), departmentId: z.string().optional(), notes: z.string().optional(),
    }))
    .mutation(({ input }) => assetService.createAsset(input)),

  getAsset: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => assetService.getAsset(input.id)),
  getAssetByTag: publicProcedure.input(z.object({ assetTag: z.string() })).query(({ input }) => assetService.getAssetByTag(input.assetTag)),
  
  updateAsset: protectedProcedure
    .input(z.object({ id: z.string(), updates: z.record(z.any()) }))
    .mutation(({ input }) => assetService.updateAsset(input.id, input.updates)),

  listAssets: publicProcedure
    .input(z.object({
      category: z.enum(["equipment", "software", "vehicle", "furniture", "technology", "tools", "machinery"]).optional(),
      status: z.enum(["available", "checked_out", "in_maintenance", "reserved", "retired", "disposed", "lost", "damaged"]).optional(),
      houseId: z.string().optional(), departmentId: z.string().optional(), location: z.string().optional(),
    }).optional())
    .query(({ input }) => assetService.listAssets(input)),

  // Depreciation
  generateDepreciationSchedule: publicProcedure
    .input(z.object({ assetId: z.string() }))
    .query(({ input }) => {
      const asset = assetService.getAsset(input.assetId);
      return asset ? assetService.generateDepreciationSchedule(asset) : [];
    }),

  calculateCurrentBookValue: publicProcedure
    .input(z.object({ assetId: z.string() }))
    .query(({ input }) => {
      const asset = assetService.getAsset(input.assetId);
      return asset ? assetService.calculateCurrentBookValue(asset) : 0;
    }),

  // Checkout/Return
  checkoutAsset: protectedProcedure
    .input(z.object({
      assetId: z.string(), userId: z.string(), userName: z.string(),
      expectedReturnDate: z.date(), purpose: z.string(), projectId: z.string().optional(),
      conditionAtCheckout: z.enum(["excellent", "good", "fair", "poor"]), notes: z.string().optional(),
    }))
    .mutation(({ input }) => assetService.checkoutAsset(input)),

  returnAsset: protectedProcedure
    .input(z.object({
      checkoutId: z.string(), conditionAtReturn: z.enum(["excellent", "good", "fair", "poor"]), notes: z.string().optional(),
    }))
    .mutation(({ input }) => assetService.returnAsset(input)),

  getAssetCheckoutHistory: publicProcedure.input(z.object({ assetId: z.string() })).query(({ input }) => assetService.getAssetCheckoutHistory(input.assetId)),
  getUserActiveCheckouts: publicProcedure.input(z.object({ userId: z.string() })).query(({ input }) => assetService.getUserActiveCheckouts(input.userId)),
  getOverdueCheckouts: publicProcedure.query(() => assetService.getOverdueCheckouts()),

  // Software Licenses
  createSoftwareLicense: protectedProcedure
    .input(z.object({
      name: z.string(), vendor: z.string(), licenseType: z.enum(["perpetual", "subscription", "per_seat", "concurrent", "site_license", "enterprise"]),
      licenseKey: z.string().optional(), totalSeats: z.number(), purchaseDate: z.date(), startDate: z.date(),
      expirationDate: z.date().optional(), renewalDate: z.date().optional(), purchasePrice: z.number(),
      annualCost: z.number().optional(), autoRenew: z.boolean(), notes: z.string().optional(),
    }))
    .mutation(({ input }) => assetService.createSoftwareLicense(input)),

  assignLicenseSeat: protectedProcedure.input(z.object({ licenseId: z.string(), userId: z.string() })).mutation(({ input }) => assetService.assignLicenseSeat(input.licenseId, input.userId)),
  removeLicenseSeat: protectedProcedure.input(z.object({ licenseId: z.string(), userId: z.string() })).mutation(({ input }) => assetService.removeLicenseSeat(input.licenseId, input.userId)),
  getLicensesExpiringSoon: publicProcedure.input(z.object({ daysAhead: z.number().optional() })).query(({ input }) => assetService.getLicensesExpiringSoon(input.daysAhead)),
  listSoftwareLicenses: publicProcedure
    .input(z.object({
      status: z.enum(["active", "expired", "pending_renewal", "cancelled"]).optional(),
      vendor: z.string().optional(), licenseType: z.enum(["perpetual", "subscription", "per_seat", "concurrent", "site_license", "enterprise"]).optional(),
    }).optional())
    .query(({ input }) => assetService.listSoftwareLicenses(input)),

  // Vehicles
  createVehicle: protectedProcedure
    .input(z.object({
      assetId: z.string(), vehicleType: z.enum(["sedan", "suv", "truck", "van", "bus", "motorcycle", "heavy_equipment"]),
      vin: z.string(), licensePlate: z.string(), year: z.number(), make: z.string(), model: z.string(), color: z.string(),
      currentMileage: z.number(), registrationExpiration: z.date(), insurancePolicy: z.string().optional(), insuranceExpiration: z.date().optional(),
      fuelType: z.enum(["gasoline", "diesel", "electric", "hybrid", "natural_gas"]), fuelCapacity: z.number().optional(), averageMpg: z.number().optional(),
    }))
    .mutation(({ input }) => assetService.createVehicle(input)),

  updateVehicleMileage: protectedProcedure.input(z.object({ vehicleId: z.string(), newMileage: z.number() })).mutation(({ input }) => assetService.updateVehicleMileage(input.vehicleId, input.newMileage)),
  getVehiclesWithExpiringRegistration: publicProcedure.input(z.object({ daysAhead: z.number().optional() })).query(({ input }) => assetService.getVehiclesWithExpiringRegistration(input.daysAhead)),
  listVehicles: publicProcedure
    .input(z.object({
      vehicleType: z.enum(["sedan", "suv", "truck", "van", "bus", "motorcycle", "heavy_equipment"]).optional(),
      fuelType: z.enum(["gasoline", "diesel", "electric", "hybrid", "natural_gas"]).optional(),
    }).optional())
    .query(({ input }) => assetService.listVehicles(input)),

  // Maintenance
  createMaintenanceRecord: protectedProcedure
    .input(z.object({
      assetId: z.string(), maintenanceType: z.enum(["preventive", "corrective", "predictive", "condition_based"]),
      description: z.string(), performedBy: z.string(), performedDate: z.date(), laborCost: z.number(), partsCost: z.number(),
      partsUsed: z.array(z.object({ partName: z.string(), partNumber: z.string().optional(), quantity: z.number(), unitCost: z.number() })).optional(),
      issueResolved: z.boolean(), nextMaintenanceDate: z.date().optional(), workOrderNumber: z.string().optional(), invoiceNumber: z.string().optional(),
    }))
    .mutation(({ input }) => assetService.createMaintenanceRecord(input)),

  getAssetMaintenanceHistory: publicProcedure.input(z.object({ assetId: z.string() })).query(({ input }) => assetService.getAssetMaintenanceHistory(input.assetId)),
  getAssetTotalMaintenanceCost: publicProcedure.input(z.object({ assetId: z.string() })).query(({ input }) => assetService.getAssetTotalMaintenanceCost(input.assetId)),
  getAssetsDueForMaintenance: publicProcedure.query(() => assetService.getAssetsDueForMaintenance()),

  // Reservations
  createReservation: protectedProcedure
    .input(z.object({
      assetId: z.string(), userId: z.string(), userName: z.string(),
      startDate: z.date(), endDate: z.date(), purpose: z.string(),
    }))
    .mutation(({ input }) => assetService.createReservation(input)),

  approveReservation: protectedProcedure.input(z.object({ reservationId: z.string(), approvedBy: z.string() })).mutation(({ input }) => assetService.approveReservation(input.reservationId, input.approvedBy)),
  getAssetReservations: publicProcedure.input(z.object({ assetId: z.string() })).query(({ input }) => assetService.getAssetReservations(input.assetId)),

  // Reports
  generateInventorySummary: publicProcedure.query(() => assetService.generateInventorySummary()),
  generateLicenseComplianceReport: publicProcedure.query(() => assetService.generateLicenseComplianceReport()),
  generateFleetSummary: publicProcedure.query(() => assetService.generateFleetSummary()),
  exportAssetData: publicProcedure.query(() => assetService.exportAssetData()),
});

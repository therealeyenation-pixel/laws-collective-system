import { describe, it, expect, beforeEach } from "vitest";
import {
  createAsset, getAsset, getAssetByTag, updateAsset, listAssets,
  generateAssetTag, calculateStraightLineDepreciation, calculateDecliningBalanceDepreciation,
  calculateDoubleDecliningDepreciation, calculateSumOfYearsDepreciation,
  generateDepreciationSchedule, calculateCurrentBookValue,
  checkoutAsset, returnAsset, getAssetCheckoutHistory, getUserActiveCheckouts, getOverdueCheckouts,
  createSoftwareLicense, assignLicenseSeat, removeLicenseSeat, getLicensesExpiringSoon, listSoftwareLicenses,
  createVehicle, updateVehicleMileage, getVehiclesWithExpiringRegistration, listVehicles,
  createMaintenanceRecord, getAssetMaintenanceHistory, getAssetTotalMaintenanceCost,
  createReservation, approveReservation, getAssetReservations,
  generateInventorySummary, generateLicenseComplianceReport, generateFleetSummary,
  clearAllData, exportAssetData,
} from "./expanded-asset-management";

describe("Expanded Asset Management Service", () => {
  beforeEach(() => { clearAllData(); });

  describe("Asset Tag Generation", () => {
    it("should generate asset tags with correct prefixes", () => {
      expect(generateAssetTag("equipment")).toMatch(/^EQP-/);
      expect(generateAssetTag("software")).toMatch(/^SFT-/);
      expect(generateAssetTag("vehicle")).toMatch(/^VEH-/);
      expect(generateAssetTag("furniture")).toMatch(/^FUR-/);
      expect(generateAssetTag("technology")).toMatch(/^TEC-/);
      expect(generateAssetTag("tools")).toMatch(/^TLS-/);
      expect(generateAssetTag("machinery")).toMatch(/^MCH-/);
    });
  });

  describe("Asset CRUD Operations", () => {
    it("should create an asset with all required fields", () => {
      const asset = createAsset({
        name: "Dell Laptop", description: "Developer workstation",
        category: "technology", purchaseDate: new Date("2024-01-15"),
        purchasePrice: 1500, salvageValue: 200, usefulLifeYears: 5,
        depreciationMethod: "straight_line", location: "Main Office",
        building: "HQ", room: "101", serialNumber: "ABC123",
        manufacturer: "Dell", model: "XPS 15",
      });
      expect(asset.id).toBeDefined();
      expect(asset.assetTag).toMatch(/^TEC-/);
      expect(asset.name).toBe("Dell Laptop");
      expect(asset.status).toBe("available");
      expect(asset.currentValue).toBe(1500);
    });

    it("should retrieve asset by ID", () => {
      const created = createAsset({
        name: "Test Asset", description: "Test", category: "equipment",
        purchaseDate: new Date(), purchasePrice: 1000, salvageValue: 100,
        usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office",
      });
      const retrieved = getAsset(created.id);
      expect(retrieved).toEqual(created);
    });

    it("should retrieve asset by tag", () => {
      const created = createAsset({
        name: "Tagged Asset", description: "Test", category: "tools",
        purchaseDate: new Date(), purchasePrice: 500, salvageValue: 50,
        usefulLifeYears: 10, depreciationMethod: "straight_line", location: "Warehouse",
      });
      const retrieved = getAssetByTag(created.assetTag);
      expect(retrieved?.id).toBe(created.id);
    });

    it("should update asset properties", () => {
      const asset = createAsset({
        name: "Original Name", description: "Test", category: "furniture",
        purchaseDate: new Date(), purchasePrice: 800, salvageValue: 80,
        usefulLifeYears: 7, depreciationMethod: "straight_line", location: "Office",
      });
      const updated = updateAsset(asset.id, { name: "Updated Name", location: "New Location" });
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.location).toBe("New Location");
      expect(updated?.assetTag).toBe(asset.assetTag);
    });

    it("should list assets with filters", () => {
      createAsset({ name: "Laptop 1", description: "Dev", category: "technology", purchaseDate: new Date(), purchasePrice: 1500, salvageValue: 150, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office A", houseId: "house-1" });
      createAsset({ name: "Laptop 2", description: "Dev", category: "technology", purchaseDate: new Date(), purchasePrice: 1500, salvageValue: 150, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office B", houseId: "house-2" });
      createAsset({ name: "Desk", description: "Furniture", category: "furniture", purchaseDate: new Date(), purchasePrice: 500, salvageValue: 50, usefulLifeYears: 10, depreciationMethod: "straight_line", location: "Office A", houseId: "house-1" });
      
      expect(listAssets({ category: "technology" })).toHaveLength(2);
      expect(listAssets({ houseId: "house-1" })).toHaveLength(2);
      expect(listAssets({ location: "Office A" })).toHaveLength(2);
    });
  });

  describe("Depreciation Calculations", () => {
    it("should calculate straight-line depreciation", () => {
      const annual = calculateStraightLineDepreciation(10000, 1000, 5);
      expect(annual).toBe(1800);
    });

    it("should calculate declining balance depreciation", () => {
      const firstYear = calculateDecliningBalanceDepreciation(10000, 5, 1);
      expect(firstYear).toBe(2000);
    });

    it("should calculate double declining depreciation", () => {
      const firstYear = calculateDoubleDecliningDepreciation(10000, 5);
      expect(firstYear).toBe(4000);
    });

    it("should calculate sum-of-years depreciation", () => {
      const firstYear = calculateSumOfYearsDepreciation(10000, 1000, 5, 1);
      expect(firstYear).toBeCloseTo(3000, 0);
    });

    it("should generate depreciation schedule", () => {
      const asset = createAsset({
        name: "Test Equipment", description: "Test", category: "equipment",
        purchaseDate: new Date("2024-01-01"), purchasePrice: 10000, salvageValue: 1000,
        usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office",
      });
      const schedule = generateDepreciationSchedule(asset);
      expect(schedule).toHaveLength(5);
      expect(schedule[0].beginningValue).toBe(10000);
      expect(schedule[0].depreciationExpense).toBe(1800);
      expect(schedule[4].endingValue).toBe(1000);
    });

    it("should calculate current book value", () => {
      const asset = createAsset({
        name: "Old Equipment", description: "Test", category: "equipment",
        purchaseDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        purchasePrice: 10000, salvageValue: 1000, usefulLifeYears: 5,
        depreciationMethod: "straight_line", location: "Office",
      });
      const bookValue = calculateCurrentBookValue(asset);
      expect(bookValue).toBeLessThan(10000);
      expect(bookValue).toBeGreaterThan(1000);
    });
  });

  describe("Checkout/Return Workflow", () => {
    it("should checkout an available asset", () => {
      const asset = createAsset({
        name: "Projector", description: "Meeting room", category: "equipment",
        purchaseDate: new Date(), purchasePrice: 800, salvageValue: 80,
        usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office",
      });
      const checkout = checkoutAsset({
        assetId: asset.id, userId: "user-1", userName: "John Doe",
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        purpose: "Client presentation", conditionAtCheckout: "excellent",
      });
      expect("error" in checkout).toBe(false);
      if (!("error" in checkout)) {
        expect(checkout.status).toBe("active");
        expect(getAsset(asset.id)?.status).toBe("checked_out");
      }
    });

    it("should prevent checkout of unavailable asset", () => {
      const asset = createAsset({
        name: "Camera", description: "Photo", category: "equipment",
        purchaseDate: new Date(), purchasePrice: 2000, salvageValue: 200,
        usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office",
      });
      checkoutAsset({ assetId: asset.id, userId: "user-1", userName: "John", expectedReturnDate: new Date(Date.now() + 86400000), purpose: "Event", conditionAtCheckout: "good" });
      const secondCheckout = checkoutAsset({ assetId: asset.id, userId: "user-2", userName: "Jane", expectedReturnDate: new Date(Date.now() + 86400000), purpose: "Meeting", conditionAtCheckout: "good" });
      expect("error" in secondCheckout).toBe(true);
    });

    it("should return a checked out asset", () => {
      const asset = createAsset({
        name: "Tablet", description: "Demo", category: "technology",
        purchaseDate: new Date(), purchasePrice: 600, salvageValue: 60,
        usefulLifeYears: 3, depreciationMethod: "straight_line", location: "Office",
      });
      const checkout = checkoutAsset({ assetId: asset.id, userId: "user-1", userName: "John", expectedReturnDate: new Date(Date.now() + 86400000), purpose: "Demo", conditionAtCheckout: "excellent" });
      if (!("error" in checkout)) {
        const returned = returnAsset({ checkoutId: checkout.id, conditionAtReturn: "good", notes: "Minor scratches" });
        expect("error" in returned).toBe(false);
        if (!("error" in returned)) {
          expect(returned.status).toBe("returned");
          expect(getAsset(asset.id)?.status).toBe("available");
        }
      }
    });

    it("should track checkout history", () => {
      const asset = createAsset({
        name: "Monitor", description: "Display", category: "technology",
        purchaseDate: new Date(), purchasePrice: 400, salvageValue: 40,
        usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office",
      });
      const checkout1 = checkoutAsset({ assetId: asset.id, userId: "user-1", userName: "John", expectedReturnDate: new Date(Date.now() + 86400000), purpose: "WFH", conditionAtCheckout: "excellent" });
      if (!("error" in checkout1)) {
        returnAsset({ checkoutId: checkout1.id, conditionAtReturn: "excellent" });
        checkoutAsset({ assetId: asset.id, userId: "user-2", userName: "Jane", expectedReturnDate: new Date(Date.now() + 86400000), purpose: "Remote", conditionAtCheckout: "excellent" });
        const history = getAssetCheckoutHistory(asset.id);
        expect(history).toHaveLength(2);
      }
    });

    it("should get user active checkouts", () => {
      const asset1 = createAsset({ name: "Asset 1", description: "Test", category: "equipment", purchaseDate: new Date(), purchasePrice: 100, salvageValue: 10, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office" });
      const asset2 = createAsset({ name: "Asset 2", description: "Test", category: "equipment", purchaseDate: new Date(), purchasePrice: 100, salvageValue: 10, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office" });
      checkoutAsset({ assetId: asset1.id, userId: "user-1", userName: "John", expectedReturnDate: new Date(Date.now() + 86400000), purpose: "Work", conditionAtCheckout: "good" });
      checkoutAsset({ assetId: asset2.id, userId: "user-1", userName: "John", expectedReturnDate: new Date(Date.now() + 86400000), purpose: "Work", conditionAtCheckout: "good" });
      expect(getUserActiveCheckouts("user-1")).toHaveLength(2);
    });

    it("should identify overdue checkouts", () => {
      const asset = createAsset({ name: "Overdue Asset", description: "Test", category: "equipment", purchaseDate: new Date(), purchasePrice: 100, salvageValue: 10, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office" });
      checkoutAsset({ assetId: asset.id, userId: "user-1", userName: "John", expectedReturnDate: new Date(Date.now() - 86400000), purpose: "Work", conditionAtCheckout: "good" });
      const overdue = getOverdueCheckouts();
      expect(overdue).toHaveLength(1);
      expect(overdue[0].status).toBe("overdue");
    });
  });

  describe("Software License Management", () => {
    it("should create a software license", () => {
      const license = createSoftwareLicense({
        name: "Microsoft 365", vendor: "Microsoft", licenseType: "subscription",
        totalSeats: 50, purchaseDate: new Date(), startDate: new Date(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        purchasePrice: 5000, annualCost: 5000, autoRenew: true,
      });
      expect(license.id).toBeDefined();
      expect(license.totalSeats).toBe(50);
      expect(license.usedSeats).toBe(0);
      expect(license.status).toBe("active");
    });

    it("should assign license seats", () => {
      const license = createSoftwareLicense({
        name: "Adobe CC", vendor: "Adobe", licenseType: "per_seat",
        totalSeats: 5, purchaseDate: new Date(), startDate: new Date(),
        purchasePrice: 3000, autoRenew: false,
      });
      const result = assignLicenseSeat(license.id, "user-1");
      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(result.usedSeats).toBe(1);
        expect(result.assignedUsers).toContain("user-1");
      }
    });

    it("should prevent over-allocation of seats", () => {
      const license = createSoftwareLicense({
        name: "Small License", vendor: "Test", licenseType: "per_seat",
        totalSeats: 1, purchaseDate: new Date(), startDate: new Date(),
        purchasePrice: 100, autoRenew: false,
      });
      assignLicenseSeat(license.id, "user-1");
      const result = assignLicenseSeat(license.id, "user-2");
      expect("error" in result).toBe(true);
    });

    it("should remove license seats", () => {
      const license = createSoftwareLicense({
        name: "Test License", vendor: "Test", licenseType: "per_seat",
        totalSeats: 5, purchaseDate: new Date(), startDate: new Date(),
        purchasePrice: 500, autoRenew: false,
      });
      assignLicenseSeat(license.id, "user-1");
      const result = removeLicenseSeat(license.id, "user-1");
      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(result.usedSeats).toBe(0);
      }
    });

    it("should find licenses expiring soon", () => {
      createSoftwareLicense({
        name: "Expiring Soon", vendor: "Test", licenseType: "subscription",
        totalSeats: 10, purchaseDate: new Date(), startDate: new Date(),
        expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        purchasePrice: 1000, autoRenew: false,
      });
      createSoftwareLicense({
        name: "Not Expiring", vendor: "Test", licenseType: "perpetual",
        totalSeats: 10, purchaseDate: new Date(), startDate: new Date(),
        purchasePrice: 2000, autoRenew: false,
      });
      const expiring = getLicensesExpiringSoon(30);
      expect(expiring).toHaveLength(1);
      expect(expiring[0].name).toBe("Expiring Soon");
    });

    it("should list licenses with filters", () => {
      createSoftwareLicense({ name: "License A", vendor: "Microsoft", licenseType: "subscription", totalSeats: 10, purchaseDate: new Date(), startDate: new Date(), purchasePrice: 1000, autoRenew: true });
      createSoftwareLicense({ name: "License B", vendor: "Adobe", licenseType: "per_seat", totalSeats: 5, purchaseDate: new Date(), startDate: new Date(), purchasePrice: 500, autoRenew: false });
      expect(listSoftwareLicenses({ vendor: "Microsoft" })).toHaveLength(1);
      expect(listSoftwareLicenses({ licenseType: "per_seat" })).toHaveLength(1);
    });
  });

  describe("Vehicle Management", () => {
    it("should create a vehicle linked to an asset", () => {
      const asset = createAsset({
        name: "Company Van", description: "Delivery vehicle", category: "vehicle",
        purchaseDate: new Date(), purchasePrice: 35000, salvageValue: 5000,
        usefulLifeYears: 7, depreciationMethod: "straight_line", location: "Garage",
      });
      const vehicle = createVehicle({
        assetId: asset.id, vehicleType: "van", vin: "1HGBH41JXMN109186",
        licensePlate: "ABC-1234", year: 2024, make: "Ford", model: "Transit",
        color: "White", currentMileage: 1500, registrationExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        fuelType: "gasoline", fuelCapacity: 25, averageMpg: 22,
      });
      expect("error" in vehicle).toBe(false);
      if (!("error" in vehicle)) {
        expect(vehicle.vin).toBe("1HGBH41JXMN109186");
        expect(vehicle.vehicleType).toBe("van");
      }
    });

    it("should prevent creating vehicle for non-vehicle asset", () => {
      const asset = createAsset({
        name: "Not a Vehicle", description: "Equipment", category: "equipment",
        purchaseDate: new Date(), purchasePrice: 1000, salvageValue: 100,
        usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office",
      });
      const result = createVehicle({
        assetId: asset.id, vehicleType: "sedan", vin: "TEST123",
        licensePlate: "XYZ-999", year: 2024, make: "Test", model: "Model",
        color: "Blue", currentMileage: 0, registrationExpiration: new Date(),
        fuelType: "gasoline",
      });
      expect("error" in result).toBe(true);
    });

    it("should update vehicle mileage", () => {
      const asset = createAsset({ name: "Car", description: "Company car", category: "vehicle", purchaseDate: new Date(), purchasePrice: 25000, salvageValue: 5000, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Garage" });
      const vehicle = createVehicle({ assetId: asset.id, vehicleType: "sedan", vin: "VIN123", licensePlate: "ABC-123", year: 2024, make: "Toyota", model: "Camry", color: "Silver", currentMileage: 10000, registrationExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), fuelType: "hybrid" });
      if (!("error" in vehicle)) {
        const updated = updateVehicleMileage(vehicle.id, 12000);
        expect("error" in updated).toBe(false);
        if (!("error" in updated)) {
          expect(updated.currentMileage).toBe(12000);
        }
      }
    });

    it("should prevent mileage decrease", () => {
      const asset = createAsset({ name: "Truck", description: "Delivery", category: "vehicle", purchaseDate: new Date(), purchasePrice: 40000, salvageValue: 8000, usefulLifeYears: 7, depreciationMethod: "straight_line", location: "Lot" });
      const vehicle = createVehicle({ assetId: asset.id, vehicleType: "truck", vin: "VIN456", licensePlate: "TRK-456", year: 2023, make: "Ford", model: "F-150", color: "Black", currentMileage: 50000, registrationExpiration: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), fuelType: "gasoline" });
      if (!("error" in vehicle)) {
        const result = updateVehicleMileage(vehicle.id, 40000);
        expect("error" in result).toBe(true);
      }
    });

    it("should find vehicles with expiring registration", () => {
      const asset = createAsset({ name: "Expiring Car", description: "Test", category: "vehicle", purchaseDate: new Date(), purchasePrice: 20000, salvageValue: 4000, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Lot" });
      createVehicle({ assetId: asset.id, vehicleType: "sedan", vin: "EXP123", licensePlate: "EXP-123", year: 2022, make: "Honda", model: "Civic", color: "Red", currentMileage: 30000, registrationExpiration: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), fuelType: "gasoline" });
      const expiring = getVehiclesWithExpiringRegistration(30);
      expect(expiring).toHaveLength(1);
    });
  });

  describe("Maintenance Management", () => {
    it("should create maintenance record", () => {
      const asset = createAsset({ name: "Printer", description: "Office printer", category: "equipment", purchaseDate: new Date(), purchasePrice: 500, salvageValue: 50, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office" });
      const record = createMaintenanceRecord({
        assetId: asset.id, maintenanceType: "preventive",
        description: "Annual cleaning and calibration", performedBy: "Tech Support",
        performedDate: new Date(), laborCost: 100, partsCost: 50,
        issueResolved: true, nextMaintenanceDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
      expect("error" in record).toBe(false);
      if (!("error" in record)) {
        expect(record.totalCost).toBe(150);
        expect(record.maintenanceType).toBe("preventive");
      }
    });

    it("should track maintenance history", () => {
      const asset = createAsset({ name: "HVAC", description: "Heating/Cooling", category: "equipment", purchaseDate: new Date(), purchasePrice: 5000, salvageValue: 500, usefulLifeYears: 10, depreciationMethod: "straight_line", location: "Building" });
      createMaintenanceRecord({ assetId: asset.id, maintenanceType: "preventive", description: "Filter change", performedBy: "HVAC Tech", performedDate: new Date(), laborCost: 50, partsCost: 30, issueResolved: true });
      createMaintenanceRecord({ assetId: asset.id, maintenanceType: "corrective", description: "Compressor repair", performedBy: "HVAC Tech", performedDate: new Date(), laborCost: 200, partsCost: 500, issueResolved: true });
      const history = getAssetMaintenanceHistory(asset.id);
      expect(history).toHaveLength(2);
    });

    it("should calculate total maintenance cost", () => {
      const asset = createAsset({ name: "Server", description: "Data center", category: "technology", purchaseDate: new Date(), purchasePrice: 10000, salvageValue: 1000, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "DC" });
      createMaintenanceRecord({ assetId: asset.id, maintenanceType: "preventive", description: "Cleaning", performedBy: "IT", performedDate: new Date(), laborCost: 100, partsCost: 0, issueResolved: true });
      createMaintenanceRecord({ assetId: asset.id, maintenanceType: "corrective", description: "RAM replacement", performedBy: "IT", performedDate: new Date(), laborCost: 50, partsCost: 200, issueResolved: true });
      const totalCost = getAssetTotalMaintenanceCost(asset.id);
      expect(totalCost).toBe(350);
    });
  });

  describe("Reservation System", () => {
    it("should create a reservation", () => {
      const asset = createAsset({ name: "Conference Room TV", description: "Display", category: "technology", purchaseDate: new Date(), purchasePrice: 2000, salvageValue: 200, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Conference Room" });
      const reservation = createReservation({
        assetId: asset.id, userId: "user-1", userName: "John Doe",
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        purpose: "Client presentation",
      });
      expect("error" in reservation).toBe(false);
      if (!("error" in reservation)) {
        expect(reservation.status).toBe("pending");
      }
    });

    it("should prevent conflicting reservations", () => {
      const asset = createAsset({ name: "Projector", description: "Portable", category: "equipment", purchaseDate: new Date(), purchasePrice: 800, salvageValue: 80, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Storage" });
      const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const end = new Date(Date.now() + 48 * 60 * 60 * 1000);
      createReservation({ assetId: asset.id, userId: "user-1", userName: "John", startDate: start, endDate: end, purpose: "Meeting" });
      const conflict = createReservation({ assetId: asset.id, userId: "user-2", userName: "Jane", startDate: start, endDate: end, purpose: "Training" });
      expect("error" in conflict).toBe(true);
    });

    it("should approve a reservation", () => {
      const asset = createAsset({ name: "Camera", description: "Photo", category: "equipment", purchaseDate: new Date(), purchasePrice: 3000, salvageValue: 300, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Media Room" });
      const reservation = createReservation({ assetId: asset.id, userId: "user-1", userName: "John", startDate: new Date(Date.now() + 86400000), endDate: new Date(Date.now() + 172800000), purpose: "Event" });
      if (!("error" in reservation)) {
        const approved = approveReservation(reservation.id, "admin-1");
        expect("error" in approved).toBe(false);
        if (!("error" in approved)) {
          expect(approved.status).toBe("approved");
          expect(approved.approvedBy).toBe("admin-1");
        }
      }
    });

    it("should list asset reservations", () => {
      const asset = createAsset({ name: "Meeting Room", description: "Space", category: "furniture", purchaseDate: new Date(), purchasePrice: 0, salvageValue: 0, usefulLifeYears: 20, depreciationMethod: "straight_line", location: "Floor 2" });
      createReservation({ assetId: asset.id, userId: "user-1", userName: "John", startDate: new Date(Date.now() + 86400000), endDate: new Date(Date.now() + 90000000), purpose: "Meeting 1" });
      createReservation({ assetId: asset.id, userId: "user-2", userName: "Jane", startDate: new Date(Date.now() + 172800000), endDate: new Date(Date.now() + 180000000), purpose: "Meeting 2" });
      const reservations = getAssetReservations(asset.id);
      expect(reservations).toHaveLength(2);
    });
  });

  describe("Reporting", () => {
    it("should generate inventory summary", () => {
      createAsset({ name: "Laptop", description: "Dev", category: "technology", purchaseDate: new Date(), purchasePrice: 1500, salvageValue: 150, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office" });
      createAsset({ name: "Desk", description: "Furniture", category: "furniture", purchaseDate: new Date(), purchasePrice: 500, salvageValue: 50, usefulLifeYears: 10, depreciationMethod: "straight_line", location: "Office" });
      const summary = generateInventorySummary();
      expect(summary.totalAssets).toBe(2);
      expect(summary.byCategory.technology.count).toBe(1);
      expect(summary.byCategory.furniture.count).toBe(1);
    });

    it("should generate license compliance report", () => {
      createSoftwareLicense({ name: "License 1", vendor: "Vendor", licenseType: "per_seat", totalSeats: 10, purchaseDate: new Date(), startDate: new Date(), purchasePrice: 1000, annualCost: 1000, autoRenew: true });
      const license = createSoftwareLicense({ name: "License 2", vendor: "Vendor", licenseType: "per_seat", totalSeats: 5, purchaseDate: new Date(), startDate: new Date(), purchasePrice: 500, annualCost: 500, autoRenew: false });
      assignLicenseSeat(license.id, "user-1");
      assignLicenseSeat(license.id, "user-2");
      const report = generateLicenseComplianceReport();
      expect(report.totalLicenses).toBe(2);
      expect(report.totalSeats).toBe(15);
      expect(report.usedSeats).toBe(2);
      expect(report.totalAnnualCost).toBe(1500);
    });

    it("should generate fleet summary", () => {
      const asset1 = createAsset({ name: "Car 1", description: "Sedan", category: "vehicle", purchaseDate: new Date(), purchasePrice: 25000, salvageValue: 5000, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Lot" });
      const asset2 = createAsset({ name: "Truck 1", description: "Pickup", category: "vehicle", purchaseDate: new Date(), purchasePrice: 40000, salvageValue: 8000, usefulLifeYears: 7, depreciationMethod: "straight_line", location: "Lot" });
      createVehicle({ assetId: asset1.id, vehicleType: "sedan", vin: "VIN1", licensePlate: "ABC-1", year: 2024, make: "Toyota", model: "Camry", color: "White", currentMileage: 15000, registrationExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), fuelType: "hybrid" });
      createVehicle({ assetId: asset2.id, vehicleType: "truck", vin: "VIN2", licensePlate: "ABC-2", year: 2023, make: "Ford", model: "F-150", color: "Black", currentMileage: 30000, registrationExpiration: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), fuelType: "gasoline" });
      const summary = generateFleetSummary();
      expect(summary.totalVehicles).toBe(2);
      expect(summary.totalMileage).toBe(45000);
      expect(summary.byType.sedan).toBe(1);
      expect(summary.byType.truck).toBe(1);
    });
  });

  describe("Data Export", () => {
    it("should export all asset data", () => {
      createAsset({ name: "Test Asset", description: "Test", category: "equipment", purchaseDate: new Date(), purchasePrice: 1000, salvageValue: 100, usefulLifeYears: 5, depreciationMethod: "straight_line", location: "Office" });
      createSoftwareLicense({ name: "Test License", vendor: "Test", licenseType: "perpetual", totalSeats: 10, purchaseDate: new Date(), startDate: new Date(), purchasePrice: 500, autoRenew: false });
      const exported = exportAssetData();
      expect(exported.assets).toHaveLength(1);
      expect(exported.softwareLicenses).toHaveLength(1);
    });
  });
});

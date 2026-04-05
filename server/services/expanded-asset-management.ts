/**
 * Expanded Asset Management Service
 * 
 * Tracks equipment, software licenses, and vehicles with checkout/return workflows,
 * depreciation tracking, maintenance schedules, and lifecycle management
 */

const generateId = () => crypto.randomUUID();

// ============================================================================
// Types & Interfaces
// ============================================================================

export type AssetCategory = 
  | "equipment"
  | "software"
  | "vehicle"
  | "furniture"
  | "technology"
  | "tools"
  | "machinery";

export type AssetStatus = 
  | "available"
  | "checked_out"
  | "in_maintenance"
  | "reserved"
  | "retired"
  | "disposed"
  | "lost"
  | "damaged";

export type DepreciationMethod = 
  | "straight_line"
  | "declining_balance"
  | "double_declining"
  | "sum_of_years"
  | "units_of_production";

export type LicenseType = 
  | "perpetual"
  | "subscription"
  | "per_seat"
  | "concurrent"
  | "site_license"
  | "enterprise";

export type MaintenanceType = 
  | "preventive"
  | "corrective"
  | "predictive"
  | "condition_based";

export type VehicleType = 
  | "sedan"
  | "suv"
  | "truck"
  | "van"
  | "bus"
  | "motorcycle"
  | "heavy_equipment";

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  description: string;
  category: AssetCategory;
  status: AssetStatus;
  houseId?: string;
  departmentId?: string;
  assignedToUserId?: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  location: string;
  building?: string;
  room?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  warrantyExpiration?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface SoftwareLicense {
  id: string;
  name: string;
  vendor: string;
  licenseType: LicenseType;
  licenseKey?: string;
  totalSeats: number;
  usedSeats: number;
  purchaseDate: Date;
  startDate: Date;
  expirationDate?: Date;
  renewalDate?: Date;
  purchasePrice: number;
  annualCost?: number;
  assignedUsers: string[];
  assignedDevices: string[];
  status: "active" | "expired" | "pending_renewal" | "cancelled";
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface Vehicle {
  id: string;
  assetId: string;
  vehicleType: VehicleType;
  vin: string;
  licensePlate: string;
  year: number;
  make: string;
  model: string;
  color: string;
  currentMileage: number;
  lastMileageUpdate: Date;
  averageMilesPerMonth: number;
  registrationExpiration: Date;
  insurancePolicy?: string;
  insuranceExpiration?: Date;
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid" | "natural_gas";
  fuelCapacity?: number;
  averageMpg?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutRecord {
  id: string;
  assetId: string;
  userId: string;
  userName: string;
  checkoutDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  purpose: string;
  projectId?: string;
  conditionAtCheckout: "excellent" | "good" | "fair" | "poor";
  conditionAtReturn?: "excellent" | "good" | "fair" | "poor";
  status: "active" | "returned" | "overdue" | "lost";
  checkoutNotes?: string;
  returnNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  maintenanceType: MaintenanceType;
  description: string;
  performedBy: string;
  performedDate: Date;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  partsUsed?: Array<{ partName: string; partNumber?: string; quantity: number; unitCost: number }>;
  issueResolved: boolean;
  nextMaintenanceDate?: Date;
  workOrderNumber?: string;
  invoiceNumber?: string;
  createdAt: Date;
}

export interface DepreciationSchedule {
  assetId: string;
  year: number;
  beginningValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingValue: number;
}

export interface AssetReservation {
  id: string;
  assetId: string;
  userId: string;
  userName: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// In-Memory Storage
const assets: Map<string, Asset> = new Map();
const softwareLicenses: Map<string, SoftwareLicense> = new Map();
const vehicles: Map<string, Vehicle> = new Map();
const checkoutRecords: Map<string, CheckoutRecord> = new Map();
const maintenanceRecords: Map<string, MaintenanceRecord> = new Map();
const reservations: Map<string, AssetReservation> = new Map();

// ============================================================================
// Asset Management Functions
// ============================================================================

export function generateAssetTag(category: AssetCategory): string {
  const prefixes: Record<AssetCategory, string> = {
    equipment: "EQP", software: "SFT", vehicle: "VEH", furniture: "FUR",
    technology: "TEC", tools: "TLS", machinery: "MCH",
  };
  const prefix = prefixes[category];
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function createAsset(input: {
  name: string; description: string; category: AssetCategory;
  purchaseDate: Date; purchasePrice: number; salvageValue: number;
  usefulLifeYears: number; depreciationMethod: DepreciationMethod;
  location: string; building?: string; room?: string;
  serialNumber?: string; manufacturer?: string; model?: string;
  warrantyExpiration?: Date; houseId?: string; departmentId?: string; notes?: string;
}): Asset {
  const id = generateId();
  const asset: Asset = {
    id, assetTag: generateAssetTag(input.category),
    name: input.name, description: input.description, category: input.category,
    status: "available", houseId: input.houseId, departmentId: input.departmentId,
    purchaseDate: input.purchaseDate, purchasePrice: input.purchasePrice,
    currentValue: input.purchasePrice, salvageValue: input.salvageValue,
    usefulLifeYears: input.usefulLifeYears, depreciationMethod: input.depreciationMethod,
    location: input.location, building: input.building, room: input.room,
    serialNumber: input.serialNumber, manufacturer: input.manufacturer,
    model: input.model, warrantyExpiration: input.warrantyExpiration,
    notes: input.notes, createdAt: new Date(), updatedAt: new Date(),
  };
  assets.set(id, asset);
  return asset;
}

export function getAsset(id: string): Asset | undefined { return assets.get(id); }

export function getAssetByTag(assetTag: string): Asset | undefined {
  for (const asset of assets.values()) {
    if (asset.assetTag === assetTag) return asset;
  }
  return undefined;
}

export function updateAsset(id: string, updates: Partial<Asset>): Asset | undefined {
  const asset = assets.get(id);
  if (!asset) return undefined;
  const updated = { ...asset, ...updates, id: asset.id, assetTag: asset.assetTag, updatedAt: new Date() };
  assets.set(id, updated);
  return updated;
}

export function listAssets(filters?: {
  category?: AssetCategory; status?: AssetStatus;
  houseId?: string; departmentId?: string; location?: string;
}): Asset[] {
  let result = Array.from(assets.values());
  if (filters?.category) result = result.filter(a => a.category === filters.category);
  if (filters?.status) result = result.filter(a => a.status === filters.status);
  if (filters?.houseId) result = result.filter(a => a.houseId === filters.houseId);
  if (filters?.departmentId) result = result.filter(a => a.departmentId === filters.departmentId);
  if (filters?.location) result = result.filter(a => a.location.toLowerCase().includes(filters.location!.toLowerCase()));
  return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// ============================================================================
// Depreciation Functions
// ============================================================================

export function calculateStraightLineDepreciation(purchasePrice: number, salvageValue: number, usefulLifeYears: number): number {
  return (purchasePrice - salvageValue) / usefulLifeYears;
}

export function calculateDecliningBalanceDepreciation(bookValue: number, usefulLifeYears: number, rate: number = 1): number {
  return bookValue * ((1 / usefulLifeYears) * rate);
}

export function calculateDoubleDecliningDepreciation(bookValue: number, usefulLifeYears: number): number {
  return calculateDecliningBalanceDepreciation(bookValue, usefulLifeYears, 2);
}

export function calculateSumOfYearsDepreciation(purchasePrice: number, salvageValue: number, usefulLifeYears: number, currentYear: number): number {
  const sumOfYears = (usefulLifeYears * (usefulLifeYears + 1)) / 2;
  const remainingYears = usefulLifeYears - currentYear + 1;
  return (purchasePrice - salvageValue) * (remainingYears / sumOfYears);
}

export function generateDepreciationSchedule(asset: Asset): DepreciationSchedule[] {
  const schedule: DepreciationSchedule[] = [];
  let bookValue = asset.purchasePrice;
  let accumulatedDepreciation = 0;
  
  for (let year = 1; year <= asset.usefulLifeYears; year++) {
    let depreciationExpense: number;
    switch (asset.depreciationMethod) {
      case "straight_line":
        depreciationExpense = calculateStraightLineDepreciation(asset.purchasePrice, asset.salvageValue, asset.usefulLifeYears);
        break;
      case "declining_balance":
        depreciationExpense = calculateDecliningBalanceDepreciation(bookValue, asset.usefulLifeYears);
        break;
      case "double_declining":
        depreciationExpense = calculateDoubleDecliningDepreciation(bookValue, asset.usefulLifeYears);
        break;
      case "sum_of_years":
        depreciationExpense = calculateSumOfYearsDepreciation(asset.purchasePrice, asset.salvageValue, asset.usefulLifeYears, year);
        break;
      default:
        depreciationExpense = calculateStraightLineDepreciation(asset.purchasePrice, asset.salvageValue, asset.usefulLifeYears);
    }
    if (bookValue - depreciationExpense < asset.salvageValue) {
      depreciationExpense = bookValue - asset.salvageValue;
    }
    accumulatedDepreciation += depreciationExpense;
    const endingValue = asset.purchasePrice - accumulatedDepreciation;
    schedule.push({ assetId: asset.id, year, beginningValue: bookValue, depreciationExpense, accumulatedDepreciation, endingValue: Math.max(endingValue, asset.salvageValue) });
    bookValue = endingValue;
    if (bookValue <= asset.salvageValue) break;
  }
  return schedule;
}

export function calculateCurrentBookValue(asset: Asset): number {
  const yearsOwned = (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const schedule = generateDepreciationSchedule(asset);
  const currentYear = Math.min(Math.floor(yearsOwned) + 1, schedule.length);
  if (currentYear === 0) return asset.purchasePrice;
  if (currentYear > schedule.length) return asset.salvageValue;
  return schedule[currentYear - 1].endingValue;
}

// ============================================================================
// Checkout/Return Functions
// ============================================================================

export function checkoutAsset(input: {
  assetId: string; userId: string; userName: string;
  expectedReturnDate: Date; purpose: string; projectId?: string;
  conditionAtCheckout: "excellent" | "good" | "fair" | "poor"; notes?: string;
}): CheckoutRecord | { error: string } {
  const asset = assets.get(input.assetId);
  if (!asset) return { error: "Asset not found" };
  if (asset.status !== "available") return { error: `Asset is not available (current status: ${asset.status})` };
  
  const id = generateId();
  const record: CheckoutRecord = {
    id, assetId: input.assetId, userId: input.userId, userName: input.userName,
    checkoutDate: new Date(), expectedReturnDate: input.expectedReturnDate,
    purpose: input.purpose, projectId: input.projectId,
    conditionAtCheckout: input.conditionAtCheckout, status: "active",
    checkoutNotes: input.notes, createdAt: new Date(), updatedAt: new Date(),
  };
  checkoutRecords.set(id, record);
  updateAsset(input.assetId, { status: "checked_out", assignedToUserId: input.userId });
  return record;
}

export function returnAsset(input: {
  checkoutId: string; conditionAtReturn: "excellent" | "good" | "fair" | "poor"; notes?: string;
}): CheckoutRecord | { error: string } {
  const record = checkoutRecords.get(input.checkoutId);
  if (!record) return { error: "Checkout record not found" };
  if (record.status !== "active" && record.status !== "overdue") return { error: `Cannot return asset (current status: ${record.status})` };
  
  record.actualReturnDate = new Date();
  record.conditionAtReturn = input.conditionAtReturn;
  record.returnNotes = input.notes;
  record.status = "returned";
  record.updatedAt = new Date();
  checkoutRecords.set(input.checkoutId, record);
  updateAsset(record.assetId, { status: "available", assignedToUserId: undefined });
  return record;
}

export function getAssetCheckoutHistory(assetId: string): CheckoutRecord[] {
  return Array.from(checkoutRecords.values()).filter(r => r.assetId === assetId).sort((a, b) => b.checkoutDate.getTime() - a.checkoutDate.getTime());
}

export function getUserActiveCheckouts(userId: string): CheckoutRecord[] {
  return Array.from(checkoutRecords.values()).filter(r => r.userId === userId && r.status === "active").sort((a, b) => a.expectedReturnDate.getTime() - b.expectedReturnDate.getTime());
}

export function getOverdueCheckouts(): CheckoutRecord[] {
  const now = new Date();
  return Array.from(checkoutRecords.values())
    .filter(r => r.status === "active" && r.expectedReturnDate < now)
    .map(r => { r.status = "overdue"; r.updatedAt = new Date(); checkoutRecords.set(r.id, r); return r; })
    .sort((a, b) => a.expectedReturnDate.getTime() - b.expectedReturnDate.getTime());
}

// ============================================================================
// Software License Functions
// ============================================================================

export function createSoftwareLicense(input: {
  name: string; vendor: string; licenseType: LicenseType; licenseKey?: string;
  totalSeats: number; purchaseDate: Date; startDate: Date;
  expirationDate?: Date; renewalDate?: Date; purchasePrice: number;
  annualCost?: number; autoRenew: boolean; notes?: string;
}): SoftwareLicense {
  const id = generateId();
  const license: SoftwareLicense = {
    id, name: input.name, vendor: input.vendor, licenseType: input.licenseType,
    licenseKey: input.licenseKey, totalSeats: input.totalSeats, usedSeats: 0,
    purchaseDate: input.purchaseDate, startDate: input.startDate,
    expirationDate: input.expirationDate, renewalDate: input.renewalDate,
    purchasePrice: input.purchasePrice, annualCost: input.annualCost,
    assignedUsers: [], assignedDevices: [], status: "active",
    autoRenew: input.autoRenew, notes: input.notes,
    createdAt: new Date(), updatedAt: new Date(),
  };
  softwareLicenses.set(id, license);
  return license;
}

export function assignLicenseSeat(licenseId: string, userId: string): SoftwareLicense | { error: string } {
  const license = softwareLicenses.get(licenseId);
  if (!license) return { error: "License not found" };
  if (license.assignedUsers.includes(userId)) return { error: "User already has this license assigned" };
  if (license.usedSeats >= license.totalSeats) return { error: "No available seats" };
  license.assignedUsers.push(userId);
  license.usedSeats = license.assignedUsers.length;
  license.updatedAt = new Date();
  softwareLicenses.set(licenseId, license);
  return license;
}

export function removeLicenseSeat(licenseId: string, userId: string): SoftwareLicense | { error: string } {
  const license = softwareLicenses.get(licenseId);
  if (!license) return { error: "License not found" };
  const index = license.assignedUsers.indexOf(userId);
  if (index === -1) return { error: "User does not have this license assigned" };
  license.assignedUsers.splice(index, 1);
  license.usedSeats = license.assignedUsers.length;
  license.updatedAt = new Date();
  softwareLicenses.set(licenseId, license);
  return license;
}

export function getLicensesExpiringSoon(daysAhead: number = 30): SoftwareLicense[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return Array.from(softwareLicenses.values())
    .filter(l => l.expirationDate && l.expirationDate <= futureDate && l.expirationDate > now)
    .sort((a, b) => (a.expirationDate?.getTime() || 0) - (b.expirationDate?.getTime() || 0));
}

export function listSoftwareLicenses(filters?: { status?: SoftwareLicense["status"]; vendor?: string; licenseType?: LicenseType }): SoftwareLicense[] {
  let result = Array.from(softwareLicenses.values());
  if (filters?.status) result = result.filter(l => l.status === filters.status);
  if (filters?.vendor) result = result.filter(l => l.vendor.toLowerCase().includes(filters.vendor!.toLowerCase()));
  if (filters?.licenseType) result = result.filter(l => l.licenseType === filters.licenseType);
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// Vehicle Functions
// ============================================================================

export function createVehicle(input: {
  assetId: string; vehicleType: VehicleType; vin: string; licensePlate: string;
  year: number; make: string; model: string; color: string; currentMileage: number;
  registrationExpiration: Date; insurancePolicy?: string; insuranceExpiration?: Date;
  fuelType: Vehicle["fuelType"]; fuelCapacity?: number; averageMpg?: number;
}): Vehicle | { error: string } {
  const asset = assets.get(input.assetId);
  if (!asset) return { error: "Asset not found" };
  if (asset.category !== "vehicle") return { error: "Asset is not a vehicle" };
  
  const id = generateId();
  const vehicle: Vehicle = {
    id, assetId: input.assetId, vehicleType: input.vehicleType, vin: input.vin,
    licensePlate: input.licensePlate, year: input.year, make: input.make,
    model: input.model, color: input.color, currentMileage: input.currentMileage,
    lastMileageUpdate: new Date(), averageMilesPerMonth: 0,
    registrationExpiration: input.registrationExpiration,
    insurancePolicy: input.insurancePolicy, insuranceExpiration: input.insuranceExpiration,
    fuelType: input.fuelType, fuelCapacity: input.fuelCapacity, averageMpg: input.averageMpg,
    createdAt: new Date(), updatedAt: new Date(),
  };
  vehicles.set(id, vehicle);
  return vehicle;
}

export function updateVehicleMileage(vehicleId: string, newMileage: number): Vehicle | { error: string } {
  const vehicle = vehicles.get(vehicleId);
  if (!vehicle) return { error: "Vehicle not found" };
  if (newMileage < vehicle.currentMileage) return { error: "New mileage cannot be less than current mileage" };
  const daysSinceLastUpdate = (new Date().getTime() - vehicle.lastMileageUpdate.getTime()) / (24 * 60 * 60 * 1000);
  const milesDriven = newMileage - vehicle.currentMileage;
  vehicle.currentMileage = newMileage;
  vehicle.lastMileageUpdate = new Date();
  vehicle.averageMilesPerMonth = (milesDriven / daysSinceLastUpdate) * 30;
  vehicle.updatedAt = new Date();
  vehicles.set(vehicleId, vehicle);
  return vehicle;
}

export function getVehiclesWithExpiringRegistration(daysAhead: number = 30): Vehicle[] {
  const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  return Array.from(vehicles.values()).filter(v => v.registrationExpiration <= futureDate).sort((a, b) => a.registrationExpiration.getTime() - b.registrationExpiration.getTime());
}

export function listVehicles(filters?: { vehicleType?: VehicleType; fuelType?: Vehicle["fuelType"] }): Vehicle[] {
  let result = Array.from(vehicles.values());
  if (filters?.vehicleType) result = result.filter(v => v.vehicleType === filters.vehicleType);
  if (filters?.fuelType) result = result.filter(v => v.fuelType === filters.fuelType);
  return result;
}

// ============================================================================
// Maintenance Functions
// ============================================================================

export function createMaintenanceRecord(input: {
  assetId: string; maintenanceType: MaintenanceType; description: string;
  performedBy: string; performedDate: Date; laborCost: number; partsCost: number;
  partsUsed?: MaintenanceRecord["partsUsed"]; issueResolved: boolean;
  nextMaintenanceDate?: Date; workOrderNumber?: string; invoiceNumber?: string;
}): MaintenanceRecord | { error: string } {
  const asset = assets.get(input.assetId);
  if (!asset) return { error: "Asset not found" };
  const id = generateId();
  const record: MaintenanceRecord = {
    id, assetId: input.assetId, maintenanceType: input.maintenanceType,
    description: input.description, performedBy: input.performedBy,
    performedDate: input.performedDate, laborCost: input.laborCost,
    partsCost: input.partsCost, totalCost: input.laborCost + input.partsCost,
    partsUsed: input.partsUsed, issueResolved: input.issueResolved,
    nextMaintenanceDate: input.nextMaintenanceDate,
    workOrderNumber: input.workOrderNumber, invoiceNumber: input.invoiceNumber,
    createdAt: new Date(),
  };
  maintenanceRecords.set(id, record);
  return record;
}

export function getAssetMaintenanceHistory(assetId: string): MaintenanceRecord[] {
  return Array.from(maintenanceRecords.values()).filter(r => r.assetId === assetId).sort((a, b) => b.performedDate.getTime() - a.performedDate.getTime());
}

export function getAssetTotalMaintenanceCost(assetId: string): number {
  return Array.from(maintenanceRecords.values()).filter(r => r.assetId === assetId).reduce((sum, r) => sum + r.totalCost, 0);
}

export function getAssetsDueForMaintenance(): Array<{ asset: Asset; lastMaintenance?: MaintenanceRecord; nextDue?: Date }> {
  const result: Array<{ asset: Asset; lastMaintenance?: MaintenanceRecord; nextDue?: Date }> = [];
  const now = new Date();
  for (const asset of assets.values()) {
    const history = getAssetMaintenanceHistory(asset.id);
    const lastMaintenance = history[0];
    if (lastMaintenance?.nextMaintenanceDate && lastMaintenance.nextMaintenanceDate <= now) {
      result.push({ asset, lastMaintenance, nextDue: lastMaintenance.nextMaintenanceDate });
    }
  }
  return result.sort((a, b) => (a.nextDue?.getTime() || 0) - (b.nextDue?.getTime() || 0));
}

// ============================================================================
// Reservation Functions
// ============================================================================

export function createReservation(input: {
  assetId: string; userId: string; userName: string;
  startDate: Date; endDate: Date; purpose: string;
}): AssetReservation | { error: string } {
  const asset = assets.get(input.assetId);
  if (!asset) return { error: "Asset not found" };
  const conflicts = Array.from(reservations.values()).filter(r => 
    r.assetId === input.assetId && r.status !== "cancelled" && r.status !== "rejected" && r.status !== "completed" &&
    ((input.startDate >= r.startDate && input.startDate < r.endDate) ||
     (input.endDate > r.startDate && input.endDate <= r.endDate) ||
     (input.startDate <= r.startDate && input.endDate >= r.endDate))
  );
  if (conflicts.length > 0) return { error: "Asset is already reserved for this time period" };
  
  const id = generateId();
  const reservation: AssetReservation = {
    id, assetId: input.assetId, userId: input.userId, userName: input.userName,
    startDate: input.startDate, endDate: input.endDate, purpose: input.purpose,
    status: "pending", createdAt: new Date(), updatedAt: new Date(),
  };
  reservations.set(id, reservation);
  return reservation;
}

export function approveReservation(reservationId: string, approvedBy: string): AssetReservation | { error: string } {
  const reservation = reservations.get(reservationId);
  if (!reservation) return { error: "Reservation not found" };
  if (reservation.status !== "pending") return { error: `Cannot approve reservation (current status: ${reservation.status})` };
  reservation.status = "approved";
  reservation.approvedBy = approvedBy;
  reservation.approvedAt = new Date();
  reservation.updatedAt = new Date();
  reservations.set(reservationId, reservation);
  updateAsset(reservation.assetId, { status: "reserved" });
  return reservation;
}

export function getAssetReservations(assetId: string): AssetReservation[] {
  return Array.from(reservations.values()).filter(r => r.assetId === assetId).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

// ============================================================================
// Reporting Functions
// ============================================================================

export function generateInventorySummary(): {
  totalAssets: number; totalValue: number;
  byCategory: Record<AssetCategory, { count: number; value: number }>;
  byStatus: Record<AssetStatus, number>; averageAge: number;
} {
  const allAssets = Array.from(assets.values());
  const now = new Date();
  const byCategory: Record<AssetCategory, { count: number; value: number }> = {
    equipment: { count: 0, value: 0 }, software: { count: 0, value: 0 },
    vehicle: { count: 0, value: 0 }, furniture: { count: 0, value: 0 },
    technology: { count: 0, value: 0 }, tools: { count: 0, value: 0 },
    machinery: { count: 0, value: 0 },
  };
  const byStatus: Record<AssetStatus, number> = {
    available: 0, checked_out: 0, in_maintenance: 0, reserved: 0,
    retired: 0, disposed: 0, lost: 0, damaged: 0,
  };
  let totalValue = 0, totalAgeMonths = 0;
  for (const asset of allAssets) {
    const currentValue = calculateCurrentBookValue(asset);
    totalValue += currentValue;
    byCategory[asset.category].count++;
    byCategory[asset.category].value += currentValue;
    byStatus[asset.status]++;
    totalAgeMonths += (now.getTime() - asset.purchaseDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
  }
  return { totalAssets: allAssets.length, totalValue, byCategory, byStatus, averageAge: allAssets.length > 0 ? totalAgeMonths / allAssets.length : 0 };
}

export function generateLicenseComplianceReport(): {
  totalLicenses: number; totalSeats: number; usedSeats: number;
  utilizationRate: number; expiringSoon: number; expired: number; totalAnnualCost: number;
} {
  const allLicenses = Array.from(softwareLicenses.values());
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  let totalSeats = 0, usedSeats = 0, expiringSoon = 0, expired = 0, totalAnnualCost = 0;
  for (const license of allLicenses) {
    totalSeats += license.totalSeats;
    usedSeats += license.usedSeats;
    totalAnnualCost += license.annualCost || 0;
    if (license.expirationDate) {
      if (license.expirationDate < now) expired++;
      else if (license.expirationDate <= thirtyDaysFromNow) expiringSoon++;
    }
  }
  return { totalLicenses: allLicenses.length, totalSeats, usedSeats, utilizationRate: totalSeats > 0 ? (usedSeats / totalSeats) * 100 : 0, expiringSoon, expired, totalAnnualCost };
}

export function generateFleetSummary(): {
  totalVehicles: number; totalMileage: number; averageMileage: number;
  byType: Record<VehicleType, number>; byFuelType: Record<Vehicle["fuelType"], number>;
  expiringRegistrations: number; expiringInsurance: number;
} {
  const allVehicles = Array.from(vehicles.values());
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const byType: Record<VehicleType, number> = { sedan: 0, suv: 0, truck: 0, van: 0, bus: 0, motorcycle: 0, heavy_equipment: 0 };
  const byFuelType: Record<Vehicle["fuelType"], number> = { gasoline: 0, diesel: 0, electric: 0, hybrid: 0, natural_gas: 0 };
  let totalMileage = 0, expiringRegistrations = 0, expiringInsurance = 0;
  for (const vehicle of allVehicles) {
    totalMileage += vehicle.currentMileage;
    byType[vehicle.vehicleType]++;
    byFuelType[vehicle.fuelType]++;
    if (vehicle.registrationExpiration <= thirtyDaysFromNow) expiringRegistrations++;
    if (vehicle.insuranceExpiration && vehicle.insuranceExpiration <= thirtyDaysFromNow) expiringInsurance++;
  }
  return { totalVehicles: allVehicles.length, totalMileage, averageMileage: allVehicles.length > 0 ? totalMileage / allVehicles.length : 0, byType, byFuelType, expiringRegistrations, expiringInsurance };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function clearAllData(): void {
  assets.clear(); softwareLicenses.clear(); vehicles.clear();
  checkoutRecords.clear(); maintenanceRecords.clear(); reservations.clear();
}

export function exportAssetData(): {
  assets: Asset[]; softwareLicenses: SoftwareLicense[]; vehicles: Vehicle[];
  checkoutRecords: CheckoutRecord[]; maintenanceRecords: MaintenanceRecord[];
  reservations: AssetReservation[];
} {
  return {
    assets: Array.from(assets.values()),
    softwareLicenses: Array.from(softwareLicenses.values()),
    vehicles: Array.from(vehicles.values()),
    checkoutRecords: Array.from(checkoutRecords.values()),
    maintenanceRecords: Array.from(maintenanceRecords.values()),
    reservations: Array.from(reservations.values()),
  };
}

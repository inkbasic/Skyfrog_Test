// ── ข้อมูล Dropdown สำหรับ Vehicle Form ──
// อิงจากยี่ห้อ/รุ่นที่นิยมในประเทศไทย

export const BRAND_OPTIONS = [
  'Toyota',
  'Honda',
  'Isuzu',
  'Mitsubishi',
  'Mazda',
  'Nissan',
  'Suzuki',
  'Ford',
  'MG',
  'BYD',
  'Hyundai',
  'Kia',
  'Subaru',
  'BMW',
  'Mercedes-Benz',
  'Volvo',
  'Tesla',
  'GWM',
  'Neta',
  'ORA',
] as const;

// รุ่นยอดนิยมแยกตามยี่ห้อ
export const MODEL_OPTIONS: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla Altis', 'Corolla Cross', 'Yaris', 'Yaris Ativ', 'Vios', 'Hilux Revo', 'Fortuner', 'Innova', 'C-HR', 'RAV4', 'Veloz', 'BZ4X'],
  Honda: ['Civic', 'City', 'Accord', 'CR-V', 'HR-V', 'BR-V', 'WR-V', 'Jazz', 'e:N1'],
  Isuzu: ['D-Max', 'MU-X', 'D-Max Spark'],
  Mitsubishi: ['Triton', 'Pajero Sport', 'Xpander', 'Xpander Cross', 'Outlander PHEV', 'Attrage', 'Mirage'],
  Mazda: ['Mazda2', 'Mazda3', 'CX-3', 'CX-5', 'CX-30', 'CX-60', 'BT-50'],
  Nissan: ['Almera', 'Kicks', 'X-Trail', 'Navara', 'Terra', 'Note', 'Leaf'],
  Suzuki: ['Swift', 'Ciaz', 'Ertiga', 'XL7', 'Jimny', 'Carry'],
  Ford: ['Ranger', 'Everest', 'Territory', 'Ranger Raptor'],
  MG: ['MG3', 'MG5', 'ZS', 'HS', 'MG4 Electric', 'Extender', 'MG EP'],
  BYD: ['Atto 3', 'Dolphin', 'Seal', 'Sealion 6 DM-i', 'Sealion 7'],
  Hyundai: ['Creta', 'Tucson', 'Stargazer', 'Ioniq 5', 'Ioniq 6', 'H-1'],
  Kia: ['Seltos', 'Sportage', 'EV6', 'EV9', 'K5', 'Carnival'],
  Subaru: ['Forester', 'XV', 'Outback', 'BRZ', 'WRX'],
  BMW: ['Series 3', 'Series 5', 'X1', 'X3', 'X5', 'iX3', 'i4', 'iX'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'EQA', 'EQB', 'EQS'],
  Volvo: ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'C40 Recharge', 'EX30', 'EX90'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  GWM: ['Haval H6', 'Haval Jolion', 'ORA Good Cat', 'Tank 300'],
  Neta: ['Neta V', 'Neta V-II', 'Neta X'],
  ORA: ['Good Cat', 'Good Cat GT'],
};

export const COLOR_OPTIONS = [
  'White',
  'Black',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Dark Blue',
  'Green',
  'Brown',
  'Gold',
  'Orange',
  'Yellow',
  'Bronze',
] as const;

export const ENGINE_TYPE_OPTIONS = [
  'Petrol',
  'Diesel',
  'Electric',
  'Hybrid',
  'Plug-in Hybrid',
] as const;

export const FUEL_TYPE_OPTIONS = [
  'Gasoline 91',
  'Gasoline 95',
  'Gasohol E20',
  'Gasohol E85',
  'Diesel B7',
  'Diesel B20',
  'Electric',
  'Gasoline/Electric',
  'LPG',
  'NGV/CNG',
] as const;

export const STATUS_OPTIONS = [
  { value: 'Available', label: 'Available' },
  { value: 'InUse', label: 'In Use' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Retired', label: 'Retired' },
] as const;

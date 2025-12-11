export interface ValidationError {
  [key: string]: string;
}

export interface RoleValidationErrors {
  nama_role: string;
  deskripsi: string;
}

export interface ShopValidationErrors {
  nama_toko: string;
  deskripsi: string;
  nomor_telepon: string;
  nomor_whatsapp: string;
  alamat: string;
}

export interface MenuValidationErrors {
  nama_menu: string;
  icon: string;
  path: string;
  urutan: string;
  parent_id: string;
}

export interface UserValidationErrors {
  username: string;
  password: string;
  nama_lengkap: string;
  nomor_telepon: string;
  nomor_whatsapp: string;
  role_id: string;
}
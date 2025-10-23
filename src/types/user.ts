export interface Role {
  id: number;
  nama_role: string;
  deskripsi: string;
}

export interface User {
  id: number;
  username: string;
  nama_lengkap: string;
  nomor_telepon?: string;
  nomor_whatsapp?: string;
  tanggal_awal_kerja?: string;
  status_karyawan?: string;
  role: Role;
}

export interface LoginResponse {
  access_token: string;
  user: User;
  allowedPaths: string[];
}
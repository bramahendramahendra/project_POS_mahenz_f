export interface Role {
  id: number;
  nama_role: string;
  deskripsi: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CreateRoleDto {
  nama_role: string;
  deskripsi?: string;
}

export interface UpdateRoleDto {
  nama_role?: string;
  deskripsi?: string;
}
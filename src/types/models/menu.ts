export interface Menu {
  id: number;
  nama_menu: string;
  icon: string;
  path: string;
  urutan: number;
  parent_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  parent?: {
    id: number;
    nama_menu: string;
  };
  children?: Menu[];
}

export interface CreateMenuDto {
  nama_menu: string;
  icon?: string;
  path?: string;
  urutan: number;
  parent_id?: number | null;
  is_active?: boolean;
}

export interface UpdateMenuDto {
  nama_menu?: string;
  icon?: string;
  path?: string;
  urutan?: number;
  parent_id?: number | null;
  is_active?: boolean;
}
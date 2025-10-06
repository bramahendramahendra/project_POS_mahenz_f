export interface Menu {
  id: number;
  nama_menu: string;
  icon: string;
  path: string;
  urutan: number;
  parent_id: number | null;
  children?: Menu[];
  is_active: boolean;
}
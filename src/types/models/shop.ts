export interface Shop {
  id: number;
  nama_toko: string;
  deskripsi?: string;
  nomor_telepon?: string;
  nomor_whatsapp?: string;
  alamat?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CreateShopDto {
  nama_toko: string;
  deskripsi?: string;
  nomor_telepon?: string;
  nomor_whatsapp?: string;
  alamat?: string;
}

export interface UpdateShopDto {
  nama_toko?: string;
  deskripsi?: string;
  nomor_telepon?: string;
  nomor_whatsapp?: string;
  alamat?: string;
}
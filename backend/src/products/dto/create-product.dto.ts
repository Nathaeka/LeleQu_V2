import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString({ message: 'Nama produk harus berupa teks.' })
  @IsNotEmpty({ message: 'Nama produk wajib diisi.' })
  @MinLength(3, { message: 'Nama produk minimal 3 karakter.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Slug harus berupa teks.' })
  @MinLength(3, { message: 'Slug minimal 3 karakter.' })
  slug?: string;

  @IsString({ message: 'Deskripsi produk harus berupa teks.' })
  @IsNotEmpty({ message: 'Deskripsi produk wajib diisi.' })
  @MinLength(10, { message: 'Deskripsi produk minimal 10 karakter.' })
  description: string;

  @IsString({ message: 'Kategori atau ukuran produk harus berupa teks.' })
  @IsNotEmpty({ message: 'Kategori atau ukuran produk wajib diisi.' })
  @MinLength(2, { message: 'Kategori produk minimal 2 karakter.' })
  category: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Harga produk harus berupa angka.' })
  @Min(0, { message: 'Harga produk tidak boleh kurang dari 0.' })
  price: number;

  @IsOptional()
  @IsString({ message: 'URL gambar harus berupa teks.' })
  image?: string;

  @IsOptional()
  @IsString({ message: 'Minimal pemesanan harus berupa teks.' })
  minOrder?: string;

  @IsOptional()
  @IsArray({ message: 'Karakteristik produk harus berupa array.' })
  @IsString({ each: true, message: 'Setiap karakteristik harus berupa teks.' })
  characteristics?: string[];

  @IsOptional()
  @IsBoolean({ message: 'Status ketersediaan harus berupa boolean.' })
  isAvailable?: boolean;
}

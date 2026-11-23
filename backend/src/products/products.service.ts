import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  // Penyimpanan sementara di memori (akan kembali ke data awal jika server direstart)
  private products: Product[] = [
    {
      id: 1,
      name: 'Ikan Lele Konsumsi (8–10 ekor/kg)',
      slug: 'ikan-lele-konsumsi-8-10',
      description:
        'Ikan lele segar pilihan dengan rasio 8–10 ekor per kilogram. Dipanen langsung dari kolam pengelolaan bersih dan sehat. Daging tebal, gurih, padat, dan bebas bau lumpur karena telah melalui proses pembersihan dan karantina air mengalir sebelum ditimbang.',
      category: 'Konsumsi (8–10 ekor/kg)',
      price: 25000,
      image: '/assets/foto/Ikan_lele_segar_5b6a360e.jpg',
      minOrder: '3 kg',
      characteristics: [
        'Ukuran seragam 8-10 ekor/kg',
        'Daging padat & kenyal',
        'Bebas bau lumpur',
        'Dipanen langsung saat order',
      ],
      isAvailable: true,
      createdAt: new Date('2026-10-20T08:00:00Z'),
    },
    {
      id: 2,
      name: 'Ikan Lele Super / Besar (6–8 ekor/kg)',
      slug: 'ikan-lele-super-besar-6-8',
      description:
        'Ikan lele ukuran jumbo dengan bobot 6–8 ekor per kilogram. Rendemen daging sangat tebal, cocok untuk olahan lele bakar madu, lele asap, mangut lele, atau di-fillet tanpa duri untuk masakan keluarga.',
      category: 'Super / Besar (6–8 ekor/kg)',
      price: 24000,
      image: '/assets/foto/Ikan_lele_segar_5b6a360e.jpg',
      minOrder: '3 kg',
      characteristics: [
        'Ukuran jumbo 6-8 ekor/kg',
        'Daging tebal memuaskan',
        'Kadar lemak seimbang',
        'Kondisi ikan bugar & sehat',
      ],
      isAvailable: true,
      createdAt: new Date('2026-10-25T08:00:00Z'),
    },
    {
      id: 3,
      name: 'Ikan Lele Frozen Siap Masak',
      slug: 'ikan-lele-frozen-vacuum',
      description:
        'Ikan lele segar yang telah disiangi bersih (dibuang isi perut dan insang), dicuci higienis, lalu dibekukan cepat (air blast frozen) dan dikemas rapat kedap udara (vacuum pack). Siap langsung dibumbui atau digoreng kapan saja tanpa repot membersihkan ikan.',
      category: 'Frozen Siap Masak (Pack 1 kg)',
      price: 28000,
      image: '/assets/foto/lele_frozen_577f6962.jpg',
      minOrder: '2 kg (2 pack)',
      characteristics: [
        'Sudah disiangi & bersih',
        'Kemasan vacuum pack higienis',
        'Tahan lama dalam freezer',
        'Praktis tanpa repot',
      ],
      isAvailable: true,
      createdAt: new Date('2026-10-28T08:00:00Z'),
    },
    {
      id: 4,
      name: 'Fillet Daging Ikan Lele (Boneless / Tanpa Duri)',
      slug: 'fillet-ikan-lele-boneless',
      description:
        'Potongan daging murni ikan lele tanpa tulang/duri dan kulit. Diproses dari lele ukuran super segar berbobot tinggi. Sangat higienis, bergizi tinggi untuk anak-anak, nugget ikan, fish & chips, atau masakan diet sehat.',
      category: 'Fillet Daging Murni (Pack 500 gr)',
      price: 45000,
      image: '/assets/foto/lele_fillet_ab2007db.jpg',
      minOrder: '1 kg',
      characteristics: [
        '100% daging murni tanpa duri',
        'Bebas pengawet kimiawi',
        'Kemasan food grade vacuum',
        'Tinggi protein berkualitas',
      ],
      isAvailable: true,
      createdAt: new Date('2026-10-29T08:00:00Z'),
    },
    {
      id: 5,
      name: 'Rolade Ikan Lele Siap Masak',
      slug: 'rolade-ikan-lele',
      description:
        'Produk olahan ikan lele pilihan yang dicincang lembut bersama bumbu rempah alami lalu digulung dengan lapisan telur dadar lezat. Gurih, bergizi, cocok untuk lauk harian keluarga, bekal anak, dan katering.',
      category: 'Olahan Lele (Roll)',
      price: 35000,
      image: '/assets/foto/Rolade_lele_1c433422.jpg',
      minOrder: '2 roll',
      characteristics: [
        'Olahan daging lele asli',
        'Kaya rempah nusantara',
        'Tinggal iris & goreng/kukus',
        'Disukai anak & dewasa',
      ],
      isAvailable: true,
      createdAt: new Date('2026-10-30T08:00:00Z'),
    },
  ];

  private nextId = 6;

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private sanitizeImageUrl(url?: string): string {
    if (!url || !url.trim()) {
      return '/assets/foto/Ikan_lele_segar_5b6a360e.jpg';
    }
    const trimmed = url.trim();
    if (
      trimmed.startsWith('javascript:') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('vbscript:')
    ) {
      throw new BadRequestException('Format URL gambar tidak diizinkan.');
    }
    return trimmed;
  }

  create(createProductDto: CreateProductDto): Product {
    const normalizedName = createProductDto.name.trim().toLowerCase();
    const slug = this.generateSlug(
      createProductDto.slug || createProductDto.name,
    );

    const duplicate = this.products.find(
      (item) =>
        item.name.trim().toLowerCase() === normalizedName || item.slug === slug,
    );

    if (duplicate) {
      throw new ConflictException(
        `Produk dengan nama "${createProductDto.name}" atau slug "${slug}" sudah terdaftar.`,
      );
    }

    const newProduct: Product = {
      id: this.nextId++,
      name: createProductDto.name.trim(),
      slug,
      description: createProductDto.description.trim(),
      category: createProductDto.category.trim(),
      price: Number(createProductDto.price),
      image: this.sanitizeImageUrl(createProductDto.image),
      minOrder: createProductDto.minOrder?.trim() || '3 kg',
      characteristics: createProductDto.characteristics ?? [],
      isAvailable: createProductDto.isAvailable ?? true,
      createdAt: new Date(),
    };

    this.products.push(newProduct);
    return newProduct;
  }

  findAll(): Product[] {
    return [...this.products];
  }

  findOne(id: number): Product {
    const product = this.products.find((item) => item.id === id);
    if (!product) {
      throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan.`);
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto): Product {
    const index = this.products.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan.`);
    }

    const existing = this.products[index];
    const nextName =
      updateProductDto.name !== undefined
        ? updateProductDto.name.trim()
        : existing.name;
    const nextSlug =
      updateProductDto.slug !== undefined
        ? this.generateSlug(updateProductDto.slug)
        : updateProductDto.name !== undefined
          ? this.generateSlug(updateProductDto.name)
          : existing.slug;

    const duplicate = this.products.find(
      (item) =>
        item.id !== id &&
        (item.name.trim().toLowerCase() === nextName.toLowerCase() ||
          item.slug === nextSlug),
    );

    if (duplicate) {
      throw new ConflictException(
        `Produk lain dengan nama "${nextName}" atau slug "${nextSlug}" sudah ada.`,
      );
    }

    const updatedProduct: Product = {
      ...existing,
      name: nextName,
      slug: nextSlug,
      description:
        updateProductDto.description !== undefined
          ? updateProductDto.description.trim()
          : existing.description,
      category:
        updateProductDto.category !== undefined
          ? updateProductDto.category.trim()
          : existing.category,
      price:
        updateProductDto.price !== undefined
          ? Number(updateProductDto.price)
          : existing.price,
      image:
        updateProductDto.image !== undefined
          ? this.sanitizeImageUrl(updateProductDto.image)
          : existing.image,
      minOrder:
        updateProductDto.minOrder !== undefined
          ? updateProductDto.minOrder.trim()
          : existing.minOrder,
      characteristics:
        updateProductDto.characteristics !== undefined
          ? updateProductDto.characteristics
          : existing.characteristics,
      isAvailable:
        updateProductDto.isAvailable !== undefined
          ? updateProductDto.isAvailable
          : existing.isAvailable,
    };

    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  remove(id: number): Product {
    const index = this.products.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan.`);
    }

    const [deleted] = this.products.splice(index, 1);
    return deleted;
  }
}

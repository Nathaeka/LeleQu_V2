import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined and seeded with 5 initial products', () => {
    expect(service).toBeDefined();
    expect(service.findAll()).toHaveLength(5);
  });

  it('should return a single product by ID', () => {
    const product = service.findOne(1);
    expect(product.id).toBe(1);
    expect(product.name).toContain('Ikan Lele Konsumsi');
  });

  it('should throw NotFoundException when product ID does not exist', () => {
    expect(() => service.findOne(9999)).toThrow(NotFoundException);
  });

  it('should create a new product with unique ID', () => {
    const created = service.create({
      name: 'Ikan Lele Asap Purbalingga',
      description: 'Ikan lele diasap alami dengan kayu keras berkualitas.',
      category: 'Olahan Lele',
      price: 38000,
    });

    expect(created.id).toBe(6);
    expect(created.isAvailable).toBe(true);
    expect(service.findAll()).toHaveLength(6);
  });

  it('should throw ConflictException when creating duplicate product name', () => {
    expect(() =>
      service.create({
        name: 'Ikan Lele Konsumsi (8–10 ekor/kg)',
        description: 'Produk duplikat untuk pengujian conflict exception.',
        category: 'Konsumsi',
        price: 25000,
      }),
    ).toThrow(ConflictException);
  });

  it('should update an existing product', () => {
    const updated = service.update(1, { price: 27000, minOrder: '5 kg' });
    expect(updated.price).toBe(27000);
    expect(updated.minOrder).toBe('5 kg');
  });

  it('should remove an existing product and throw NotFoundException afterward', () => {
    const deleted = service.remove(5);
    expect(deleted.id).toBe(5);
    expect(service.findAll()).toHaveLength(4);
    expect(() => service.findOne(5)).toThrow(NotFoundException);
  });
});

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    const product = this.productsService.create(createProductDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Produk berhasil ditambahkan.',
      data: product,
    };
  }

  @Get()
  findAll() {
    const products = this.productsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Daftar produk berhasil diambil.',
      data: products,
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const product = this.productsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Detail produk berhasil diambil.',
      data: product,
    };
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = this.productsService.update(id, updateProductDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Produk berhasil diperbarui.',
      data: product,
    };
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    const product = this.productsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Produk berhasil dihapus.',
      data: product,
    };
  }
}

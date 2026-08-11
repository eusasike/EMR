import { prisma } from "../config/database";
import { redis } from "../config/redis";
import {
  CreateProductDTO,
  UpdateProductDTO,
  ProductWithCategoriesDTO,
} from "../type/dtos";

export class ProductService {
  /**
   * Create a Product linked to multiple Category IDs (M:N)
   */
  async createProduct(
    dto: CreateProductDTO,
  ): Promise<ProductWithCategoriesDTO> {
    const product = await prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
        categories: {
          create: dto.categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    // Invalidate product listing cache
    await redis.del("products:all");

    return product;
  }

  /**
   * Fetch all Products with associated Categories
   */
  async getAllProducts(): Promise<ProductWithCategoriesDTO[]> {
    const cacheKey = "products:all";

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const products = await prisma.product.findMany({
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    await redis.set(cacheKey, JSON.stringify(products), "EX", 600);
    return products;
  }

  /**
   * Update Product details and update M:N Category associations
   */
  async updateProduct(
    id: string,
    dto: UpdateProductDTO,
  ): Promise<ProductWithCategoriesDTO> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.price && { price: dto.price }),
        ...(dto.categoryIds && {
          categories: {
            deleteMany: {}, // Unlink old categories
            create: dto.categoryIds.map((catId) => ({
              category: { connect: { id: catId } },
            })),
          },
        }),
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    // Invalidate cache
    await redis.del("products:all");

    return product;
  }
}

export const productService = new ProductService();

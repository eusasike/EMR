// src/types/dtos.ts
import { User, Order, Product, Category } from "../generated/client";

// ==========================================
// 1. User & Order DTOs (1:N Relationship)
// ==========================================

export type CreateUserDTO = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUserDTO = Partial<Pick<User, "name" | "email">>;
export type UserSummaryDTO = Pick<User, "id" | "name" | "email">;

export interface UserWithOrdersDTO extends User {
  orders: Order[];
}

export type CreateOrderDTO = Omit<Order, "id" | "createdAt">;

// ==========================================
// 2. Product & Category DTOs (M:N Relationship)
// ==========================================

export interface CreateProductDTO {
  name: string;
  price: number;
  categoryIds: string[];
}

export interface UpdateProductDTO {
  name?: string;
  price?: number;
  categoryIds?: string[];
}

export interface ProductWithCategoriesDTO extends Product {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  categories: {
    category: Category;
  }[];
}

export type CreateCategoryDTO = Pick<Category, "name">;

/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from "@tsoa/runtime";
import { fetchMiddlewares, ExpressTemplateService } from "@tsoa/runtime";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { VitalSignsController } from "./../controllers/vital-sign.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { VisitController } from "./../controllers/visit.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PharmacyController } from "../controllers/inventory.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from "./../controllers/register.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PaymentController } from "./../controllers/payment.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PatientController } from "./../controllers/patient.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MedicalServiceController } from "./../controllers/medical-service.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { InvoiceController } from "./../controllers/invoice.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HealthController } from "./../controllers/health.controller";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from "./../controllers/auth.controller";
import { expressAuthentication } from "./../middlewares/authenticate";
// @ts-ignore - no great way to install types from subpackage
import type {
  Request as ExRequest,
  Response as ExResponse,
  RequestHandler,
  Router,
} from "express";

const expressAuthenticationRecasted = expressAuthentication as (
  req: ExRequest,
  securityName: string,
  scopes?: string[],
  res?: ExResponse,
) => Promise<any>;

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
  Decimal: {
    dataType: "refAlias",
    type: { dataType: "string", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "_36_Enums.TriagePriority": {
    dataType: "refAlias",
    type: {
      dataType: "union",
      subSchemas: [
        { dataType: "enum", enums: ["RED"] },
        { dataType: "enum", enums: ["YELLOW"] },
        { dataType: "enum", enums: ["GREEN"] },
        { dataType: "enum", enums: ["BLACK"] },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "DefaultSelection_Prisma._36_VitalSignsPayload_": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        updatedAt: { dataType: "datetime", required: true },
        createdAt: { dataType: "datetime", required: true },
        recordedById: { dataType: "string", required: true },
        notes: { dataType: "string", required: true },
        priority: { ref: "_36_Enums.TriagePriority", required: true },
        bmi: { ref: "Decimal", required: true },
        height: { ref: "Decimal", required: true },
        weight: { ref: "Decimal", required: true },
        spo2: { dataType: "double", required: true },
        respiratoryRate: { dataType: "double", required: true },
        pulseRate: { dataType: "double", required: true },
        diastolicBP: { dataType: "double", required: true },
        systolicBP: { dataType: "double", required: true },
        temperature: { ref: "Decimal", required: true },
        visitId: { dataType: "string", required: true },
        id: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  VitalSigns: {
    dataType: "refAlias",
    type: {
      ref: "DefaultSelection_Prisma._36_VitalSignsPayload_",
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  TriagePriority: {
    dataType: "refAlias",
    type: { ref: "_36_Enums.TriagePriority", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateVitalSignsInput: {
    dataType: "refObject",
    properties: {
      visitId: { dataType: "string", required: true },
      temperature: { dataType: "double", required: true },
      systolicBP: { dataType: "double", required: true },
      diastolicBP: { dataType: "double", required: true },
      pulseRate: { dataType: "double", required: true },
      respiratoryRate: { dataType: "double", required: true },
      spo2: { dataType: "double", required: true },
      weight: { dataType: "double", required: true },
      height: { dataType: "double", required: true },
      priority: { ref: "TriagePriority" },
      notes: { dataType: "string" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Partial_Omit_CreateVitalSignsInput.visitId__": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        temperature: { dataType: "double" },
        systolicBP: { dataType: "double" },
        diastolicBP: { dataType: "double" },
        pulseRate: { dataType: "double" },
        respiratoryRate: { dataType: "double" },
        spo2: { dataType: "double" },
        weight: { dataType: "double" },
        height: { dataType: "double" },
        priority: { ref: "_36_Enums.TriagePriority" },
        notes: { dataType: "string" },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  UpdateVitalSignsInput: {
    dataType: "refAlias",
    type: {
      ref: "Partial_Omit_CreateVitalSignsInput.visitId__",
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "_36_Enums.VisitType": {
    dataType: "refAlias",
    type: {
      dataType: "union",
      subSchemas: [
        { dataType: "enum", enums: ["OPD"] },
        { dataType: "enum", enums: ["EMERGENCY"] },
        { dataType: "enum", enums: ["REFERRAL"] },
        { dataType: "enum", enums: ["FOLLOW_UP"] },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  VisitType: {
    dataType: "refAlias",
    type: { ref: "_36_Enums.VisitType", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "_36_Enums.VisitPriority": {
    dataType: "refAlias",
    type: {
      dataType: "union",
      subSchemas: [
        { dataType: "enum", enums: ["NORMAL"] },
        { dataType: "enum", enums: ["URGENT"] },
        { dataType: "enum", enums: ["CRITICAL"] },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  VisitPriority: {
    dataType: "refAlias",
    type: { ref: "_36_Enums.VisitPriority", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  VisitResponseDTO: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string", required: true },
      data: {
        dataType: "nestedObjectLiteral",
        nestedProperties: {
          attending: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              email: { dataType: "string" },
              lastName: { dataType: "string" },
              firstName: { dataType: "string" },
              id: { dataType: "string", required: true },
            },
          },
          createdAt: { dataType: "datetime", required: true },
          priority: { ref: "VisitPriority", required: true },
          visitType: { ref: "VisitType", required: true },
          symptoms: {
            dataType: "union",
            subSchemas: [
              { dataType: "string" },
              { dataType: "enum", enums: [null] },
            ],
          },
          icdCode: {
            dataType: "union",
            subSchemas: [
              { dataType: "string" },
              { dataType: "enum", enums: [null] },
            ],
          },
          diagnosis: {
            dataType: "union",
            subSchemas: [
              { dataType: "string" },
              { dataType: "enum", enums: [null] },
            ],
          },
          attendingId: { dataType: "string", required: true },
          patientId: { dataType: "string", required: true },
          id: { dataType: "string", required: true },
        },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Record_string.string-Array_": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {},
      additionalProperties: {
        dataType: "array",
        array: { dataType: "string" },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ErrorResponseDTO: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string", required: true },
      errors: { ref: "Record_string.string-Array_" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateVisitDTO: {
    dataType: "refObject",
    properties: {
      patientId: { dataType: "string", required: true },
      attendingId: { dataType: "string", required: true },
      symptoms: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
      },
      diagnosis: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
      },
      icdCode: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
      },
      visitType: { ref: "VisitType" },
      priority: { ref: "VisitPriority" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  UpdateVisitDTO: {
    dataType: "refObject",
    properties: {
      diagnosis: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
      },
      icdCode: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
      },
      symptoms: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
      },
      priority: { ref: "VisitPriority" },
      attendingId: { dataType: "string" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ProductDTO: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      code: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      name: { dataType: "string", required: true },
      description: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      category: { dataType: "string", required: true },
      unitPrice: { dataType: "double", required: true },
      reorderLevel: { dataType: "double", required: true },
      totalAvailableStock: { dataType: "double" },
      createdAt: { dataType: "datetime", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ApiResponse_ProductDTO_: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string" },
      data: { ref: "ProductDTO", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateProductDTO: {
    dataType: "refObject",
    properties: {
      code: { dataType: "string" },
      name: { dataType: "string", required: true },
      description: { dataType: "string" },
      category: { dataType: "string" },
      unitPrice: { dataType: "double", required: true },
      reorderLevel: { dataType: "double" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ApiListResponse_ProductDTO_: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string" },
      count: { dataType: "double", required: true },
      data: {
        dataType: "array",
        array: { dataType: "refObject", ref: "ProductDTO" },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  BatchDTO: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      productId: { dataType: "string", required: true },
      batchNumber: { dataType: "string", required: true },
      quantity: { dataType: "double", required: true },
      initialQty: { dataType: "double", required: true },
      costPrice: {
        dataType: "union",
        subSchemas: [
          { dataType: "double" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      expiryDate: { dataType: "datetime", required: true },
      createdAt: { dataType: "datetime", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ApiResponse_BatchDTO_: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string" },
      data: { ref: "BatchDTO", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateBatchDTO: {
    dataType: "refObject",
    properties: {
      productId: { dataType: "string", required: true },
      batchNumber: { dataType: "string", required: true },
      quantity: { dataType: "double", required: true },
      costPrice: { dataType: "double" },
      expiryDate: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  DispensedItemDTO: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      productId: { dataType: "string", required: true },
      batchId: { dataType: "string", required: true },
      quantity: { dataType: "double", required: true },
      unitPrice: { dataType: "double", required: true },
      productName: { dataType: "string" },
      batchNumber: { dataType: "string" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  DispenseRecordDTO: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      visitId: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      dispensedById: { dataType: "string", required: true },
      totalCost: { dataType: "double", required: true },
      notes: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      items: {
        dataType: "array",
        array: { dataType: "refObject", ref: "DispensedItemDTO" },
        required: true,
      },
      createdAt: { dataType: "datetime", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ApiResponse_DispenseRecordDTO_: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string" },
      data: { ref: "DispenseRecordDTO", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  DispenseItemInputDTO: {
    dataType: "refObject",
    properties: {
      productId: { dataType: "string", required: true },
      quantity: { dataType: "double", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  DispenseMedicationDTO: {
    dataType: "refObject",
    properties: {
      visitId: { dataType: "string" },
      dispensedById: { dataType: "string", required: true },
      notes: { dataType: "string" },
      items: {
        dataType: "array",
        array: { dataType: "refObject", ref: "DispenseItemInputDTO" },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "_36_Enums.Role": {
    dataType: "refAlias",
    type: {
      dataType: "union",
      subSchemas: [
        { dataType: "enum", enums: ["ADMIN"] },
        { dataType: "enum", enums: ["MANAGER"] },
        { dataType: "enum", enums: ["GUEST"] },
        { dataType: "enum", enums: ["NURSE"] },
        { dataType: "enum", enums: ["DOCTOR"] },
        { dataType: "enum", enums: ["CASHIER"] },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  Role: {
    dataType: "refAlias",
    type: { ref: "_36_Enums.Role", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  RegisterUserDTO: {
    dataType: "refObject",
    properties: {
      firstName: { dataType: "string", required: true },
      lastName: { dataType: "string", required: true },
      middleName: { dataType: "string" },
      email: { dataType: "string", required: true },
      phone: { dataType: "string" },
      password: { dataType: "string", required: true },
      role: { ref: "Role", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PaymentMethod: {
    dataType: "refAlias",
    type: {
      dataType: "union",
      subSchemas: [
        { dataType: "enum", enums: ["CASH"] },
        { dataType: "enum", enums: ["MOBILE_MONEY"] },
        { dataType: "enum", enums: ["INSURANCE"] },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PaymentDTO: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      invoiceId: { dataType: "string", required: true },
      amount: { dataType: "double", required: true },
      paymentMethod: { ref: "PaymentMethod", required: true },
      transactionReference: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      processedById: { dataType: "string", required: true },
      notes: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      createdAt: { dataType: "datetime", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PaymentResponseData: {
    dataType: "refObject",
    properties: {
      payment: { ref: "PaymentDTO", required: true },
      invoice: {
        dataType: "nestedObjectLiteral",
        nestedProperties: {
          status: {
            dataType: "union",
            subSchemas: [
              { dataType: "enum", enums: ["PENDING"] },
              { dataType: "enum", enums: ["PARTIALLY_PAID"] },
              { dataType: "enum", enums: ["PAID"] },
              { dataType: "enum", enums: ["CANCELLED"] },
            ],
            required: true,
          },
          balance: { dataType: "double", required: true },
          amountPaid: { dataType: "double", required: true },
          grandTotal: { dataType: "double", required: true },
          invoiceNumber: { dataType: "string", required: true },
          id: { dataType: "string", required: true },
        },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ApiResponse_PaymentResponseData_: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string" },
      data: { ref: "PaymentResponseData", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ProcessPaymentDTO: {
    dataType: "refObject",
    properties: {
      invoiceId: { dataType: "string", required: true },
      amount: { dataType: "double", required: true },
      paymentMethod: { ref: "PaymentMethod", required: true },
      transactionReference: { dataType: "string" },
      processedById: { dataType: "string", required: true },
      notes: { dataType: "string" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ApiListResponse_PaymentDTO_: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string" },
      count: { dataType: "double", required: true },
      data: {
        dataType: "array",
        array: { dataType: "refObject", ref: "PaymentDTO" },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "_36_Enums.Gender": {
    dataType: "refAlias",
    type: {
      dataType: "union",
      subSchemas: [
        { dataType: "enum", enums: ["MALE"] },
        { dataType: "enum", enums: ["FEMALE"] },
        { dataType: "enum", enums: ["OTHER"] },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  Gender: {
    dataType: "refAlias",
    type: { ref: "_36_Enums.Gender", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatientDTO: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      mrn: { dataType: "string", required: true },
      firstName: { dataType: "string", required: true },
      lastName: { dataType: "string", required: true },
      middleName: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      gender: { ref: "Gender", required: true },
      dateOfBirth: { dataType: "datetime", required: true },
      phone: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      emergencyContactName: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      emergencyContactPhone: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
        required: true,
      },
      createdAt: { dataType: "datetime", required: true },
      updatedAt: { dataType: "datetime", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ApiResponse_PatientDTO_: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string" },
      data: { ref: "PatientDTO", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatientResponseDTO: {
    dataType: "refAlias",
    type: { ref: "ApiResponse_PatientDTO_", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  RegisterPatientDTO: {
    dataType: "refObject",
    properties: {
      firstName: { dataType: "string", required: true },
      lastName: { dataType: "string", required: true },
      middleName: { dataType: "string" },
      gender: { ref: "Gender", required: true },
      dateOfBirth: { dataType: "string", required: true },
      phone: { dataType: "string" },
      emergencyContactName: { dataType: "string" },
      emergencyContactPhone: { dataType: "string" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "DefaultSelection_Prisma._36_PatientPayload_": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        emergencyContactPhone: { dataType: "string", required: true },
        emergencyContactName: { dataType: "string", required: true },
        dateOfBirth: { dataType: "datetime", required: true },
        gender: { ref: "_36_Enums.Gender", required: true },
        mrn: { dataType: "string", required: true },
        phone: { dataType: "string", required: true },
        middleName: { dataType: "string", required: true },
        lastName: { dataType: "string", required: true },
        firstName: { dataType: "string", required: true },
        updatedAt: { dataType: "datetime", required: true },
        createdAt: { dataType: "datetime", required: true },
        id: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  Patient: {
    dataType: "refAlias",
    type: {
      ref: "DefaultSelection_Prisma._36_PatientPayload_",
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatientListResponse: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      count: { dataType: "double", required: true },
      data: {
        dataType: "array",
        array: { dataType: "refAlias", ref: "Patient" },
        required: true,
      },
      message: { dataType: "string" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PaginationMeta: {
    dataType: "refObject",
    properties: {
      total: { dataType: "double", required: true },
      page: { dataType: "double", required: true },
      limit: { dataType: "double", required: true },
      totalPages: { dataType: "double", required: true },
      hasNextPage: { dataType: "boolean", required: true },
      hasPrevPage: { dataType: "boolean", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PaginatedResponse_PatientDTO_: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      data: {
        dataType: "array",
        array: { dataType: "refObject", ref: "PatientDTO" },
        required: true,
      },
      pagination: { ref: "PaginationMeta", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PaginatedPatientsResponseDTO: {
    dataType: "refAlias",
    type: { ref: "PaginatedResponse_PatientDTO_", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateMedicalServiceInput: {
    dataType: "refObject",
    properties: {
      name: { dataType: "string", required: true },
      category: { dataType: "string", required: true },
      price: { dataType: "double", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  Partial_CreateMedicalServiceInput_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        name: { dataType: "string" },
        category: { dataType: "string" },
        price: { dataType: "double" },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  UpdateMedicalServiceInput: {
    dataType: "refAlias",
    type: { ref: "Partial_CreateMedicalServiceInput_", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Pick_ProvideServiceInput.Exclude_keyofProvideServiceInput.providedById__": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        visitId: { dataType: "string", required: true },
        notes: { dataType: "string" },
        serviceId: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Omit_ProvideServiceInput.providedById_": {
    dataType: "refAlias",
    type: {
      ref: "Pick_ProvideServiceInput.Exclude_keyofProvideServiceInput.providedById__",
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  InvoiceItemSummaryDTO: {
    dataType: "refObject",
    properties: {
      type: {
        dataType: "union",
        subSchemas: [
          { dataType: "enum", enums: ["SERVICE"] },
          { dataType: "enum", enums: ["MEDICATION"] },
        ],
        required: true,
      },
      name: { dataType: "string", required: true },
      quantity: { dataType: "double", required: true },
      unitPrice: { dataType: "double", required: true },
      totalPrice: { dataType: "double", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  InvoiceDTO: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      invoiceNumber: { dataType: "string", required: true },
      visitId: { dataType: "string", required: true },
      serviceTotal: { dataType: "double", required: true },
      medicationTotal: { dataType: "double", required: true },
      grandTotal: { dataType: "double", required: true },
      amountPaid: { dataType: "double", required: true },
      balance: { dataType: "double", required: true },
      status: {
        dataType: "union",
        subSchemas: [
          { dataType: "enum", enums: ["PENDING"] },
          { dataType: "enum", enums: ["PARTIALLY_PAID"] },
          { dataType: "enum", enums: ["PAID"] },
          { dataType: "enum", enums: ["CANCELLED"] },
        ],
        required: true,
      },
      itemsSummary: {
        dataType: "array",
        array: { dataType: "refObject", ref: "InvoiceItemSummaryDTO" },
        required: true,
      },
      createdAt: { dataType: "datetime", required: true },
      updatedAt: { dataType: "datetime", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ApiResponse_InvoiceDTO_: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string" },
      data: { ref: "InvoiceDTO", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GenerateInvoiceDTO: {
    dataType: "refObject",
    properties: {
      visitId: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ComponentStatus: {
    dataType: "refObject",
    properties: {
      status: {
        dataType: "union",
        subSchemas: [
          { dataType: "enum", enums: ["UP"] },
          { dataType: "enum", enums: ["DOWN"] },
        ],
        required: true,
      },
      latencyMs: { dataType: "double" },
      error: { dataType: "string" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  HealthResponseDTO: {
    dataType: "refObject",
    properties: {
      status: {
        dataType: "union",
        subSchemas: [
          { dataType: "enum", enums: ["UP"] },
          { dataType: "enum", enums: ["DOWN"] },
          { dataType: "enum", enums: ["DEGRADED"] },
        ],
        required: true,
      },
      timestamp: { dataType: "string", required: true },
      uptimeSeconds: { dataType: "double", required: true },
      services: {
        dataType: "nestedObjectLiteral",
        nestedProperties: {
          redis: { ref: "ComponentStatus", required: true },
          postgres: { ref: "ComponentStatus", required: true },
        },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AuthUserData: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      firstName: { dataType: "string", required: true },
      lastName: { dataType: "string", required: true },
      email: { dataType: "string", required: true },
      role: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  LoginResponseDTO: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string", required: true },
      data: {
        dataType: "nestedObjectLiteral",
        nestedProperties: {
          refreshToken: { dataType: "string", required: true },
          accessToken: { dataType: "string", required: true },
          user: { ref: "AuthUserData", required: true },
        },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  LoginDTO: {
    dataType: "refObject",
    properties: {
      email: { dataType: "string", required: true },
      password: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  LogoutResponseDTO: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  LogoutDTO: {
    dataType: "refObject",
    properties: {
      refreshToken: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  RefreshTokenResponseDTO: {
    dataType: "refObject",
    properties: {
      success: { dataType: "boolean", required: true },
      message: { dataType: "string", required: true },
      data: {
        dataType: "nestedObjectLiteral",
        nestedProperties: {
          refreshToken: { dataType: "string", required: true },
          accessToken: { dataType: "string", required: true },
        },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  RefreshTokenDTO: {
    dataType: "refObject",
    properties: {
      refreshToken: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {
  noImplicitAdditionalProperties: "throw-on-extras",
  bodyCoercion: true,
});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: Router) {
  // ###########################################################################################################
  //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
  //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
  // ###########################################################################################################

  const argsVitalSignsController_create: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    req: { in: "request", name: "req", required: true, dataType: "object" },
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "CreateVitalSignsInput",
    },
  };
  app.post(
    "/api/v1/vital-signs",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(VitalSignsController),
    ...fetchMiddlewares<RequestHandler>(VitalSignsController.prototype.create),

    async function VitalSignsController_create(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsVitalSignsController_create,
          request,
          response,
        });

        const controller = new VitalSignsController();

        await templateService.apiHandler({
          methodName: "create",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsVitalSignsController_getByVisitId: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    visitId: {
      in: "path",
      name: "visitId",
      required: true,
      dataType: "string",
    },
  };
  app.get(
    "/api/v1/vital-signs/visit/:visitId",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(VitalSignsController),
    ...fetchMiddlewares<RequestHandler>(
      VitalSignsController.prototype.getByVisitId,
    ),

    async function VitalSignsController_getByVisitId(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsVitalSignsController_getByVisitId,
          request,
          response,
        });

        const controller = new VitalSignsController();

        await templateService.apiHandler({
          methodName: "getByVisitId",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsVitalSignsController_update: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    id: { in: "path", name: "id", required: true, dataType: "string" },
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "UpdateVitalSignsInput",
    },
  };
  app.put(
    "/api/v1/vital-signs/:id",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(VitalSignsController),
    ...fetchMiddlewares<RequestHandler>(VitalSignsController.prototype.update),

    async function VitalSignsController_update(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsVitalSignsController_update,
          request,
          response,
        });

        const controller = new VitalSignsController();

        await templateService.apiHandler({
          methodName: "update",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsVitalSignsController_getAll: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    page: { default: 1, in: "query", name: "page", dataType: "double" },
    limit: { default: 20, in: "query", name: "limit", dataType: "double" },
    patientId: { in: "query", name: "patientId", dataType: "string" },
    priority: { in: "query", name: "priority", ref: "TriagePriority" },
    startDate: { in: "query", name: "startDate", dataType: "datetime" },
    endDate: { in: "query", name: "endDate", dataType: "datetime" },
  };
  app.get(
    "/api/v1/vital-signs",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(VitalSignsController),
    ...fetchMiddlewares<RequestHandler>(VitalSignsController.prototype.getAll),

    async function VitalSignsController_getAll(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsVitalSignsController_getAll,
          request,
          response,
        });

        const controller = new VitalSignsController();

        await templateService.apiHandler({
          methodName: "getAll",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsVisitController_createVisit: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "CreateVisitDTO",
    },
  };
  app.post(
    "/api/v1/visits",
    authenticateMiddleware([{ jwt: ["NURSE", "ADMIN"] }]),
    ...fetchMiddlewares<RequestHandler>(VisitController),
    ...fetchMiddlewares<RequestHandler>(VisitController.prototype.createVisit),

    async function VisitController_createVisit(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsVisitController_createVisit,
          request,
          response,
        });

        const controller = new VisitController();

        await templateService.apiHandler({
          methodName: "createVisit",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsVisitController_updateVisit: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    id: { in: "path", name: "id", required: true, dataType: "string" },
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "UpdateVisitDTO",
    },
  };
  app.put(
    "/api/v1/visits/:id",
    authenticateMiddleware([{ jwt: ["NURSE", "ADMIN"] }]),
    ...fetchMiddlewares<RequestHandler>(VisitController),
    ...fetchMiddlewares<RequestHandler>(VisitController.prototype.updateVisit),

    async function VisitController_updateVisit(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsVisitController_updateVisit,
          request,
          response,
        });

        const controller = new VisitController();

        await templateService.apiHandler({
          methodName: "updateVisit",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsVisitController_getVisitById: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    id: { in: "path", name: "id", required: true, dataType: "string" },
  };
  app.get(
    "/api/v1/visits/:id",
    authenticateMiddleware([{ jwt: ["NURSE", "ADMIN"] }]),
    ...fetchMiddlewares<RequestHandler>(VisitController),
    ...fetchMiddlewares<RequestHandler>(VisitController.prototype.getVisitById),

    async function VisitController_getVisitById(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsVisitController_getVisitById,
          request,
          response,
        });

        const controller = new VisitController();

        await templateService.apiHandler({
          methodName: "getVisitById",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsVisitController_getVisitsByPatient: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    mrn: { in: "path", name: "mrn", required: true, dataType: "string" },
  };
  app.get(
    "/api/v1/visits/patient/:mrn",
    authenticateMiddleware([{ jwt: ["NURSE", "ADMIN"] }]),
    ...fetchMiddlewares<RequestHandler>(VisitController),
    ...fetchMiddlewares<RequestHandler>(
      VisitController.prototype.getVisitsByPatient,
    ),

    async function VisitController_getVisitsByPatient(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsVisitController_getVisitsByPatient,
          request,
          response,
        });

        const controller = new VisitController();

        await templateService.apiHandler({
          methodName: "getVisitsByPatient",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsPharmacyController_createProduct: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "CreateProductDTO",
    },
  };
  app.post(
    "/api/pharmacy/products",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(PharmacyController),
    ...fetchMiddlewares<RequestHandler>(
      PharmacyController.prototype.createProduct,
    ),

    async function PharmacyController_createProduct(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsPharmacyController_createProduct,
          request,
          response,
        });

        const controller = new PharmacyController();

        await templateService.apiHandler({
          methodName: "createProduct",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsPharmacyController_getProducts: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {};
  app.get(
    "/api/pharmacy/products",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(PharmacyController),
    ...fetchMiddlewares<RequestHandler>(
      PharmacyController.prototype.getProducts,
    ),

    async function PharmacyController_getProducts(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsPharmacyController_getProducts,
          request,
          response,
        });

        const controller = new PharmacyController();

        await templateService.apiHandler({
          methodName: "getProducts",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsPharmacyController_addStockBatch: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "CreateBatchDTO",
    },
  };
  app.post(
    "/api/pharmacy/batches",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(PharmacyController),
    ...fetchMiddlewares<RequestHandler>(
      PharmacyController.prototype.addStockBatch,
    ),

    async function PharmacyController_addStockBatch(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsPharmacyController_addStockBatch,
          request,
          response,
        });

        const controller = new PharmacyController();

        await templateService.apiHandler({
          methodName: "addStockBatch",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsPharmacyController_dispenseMedications: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "DispenseMedicationDTO",
    },
  };
  app.post(
    "/api/pharmacy/dispense",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(PharmacyController),
    ...fetchMiddlewares<RequestHandler>(
      PharmacyController.prototype.dispenseMedications,
    ),

    async function PharmacyController_dispenseMedications(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsPharmacyController_dispenseMedications,
          request,
          response,
        });

        const controller = new PharmacyController();

        await templateService.apiHandler({
          methodName: "dispenseMedications",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsUserController_register: Record<string, TsoaRoute.ParameterSchema> =
    {
      requestBody: {
        in: "body",
        name: "requestBody",
        required: true,
        ref: "RegisterUserDTO",
      },
    };
  app.post(
    "/api/users/register",
    authenticateMiddleware([{ jwt: ["ADMIN"] }]),
    ...fetchMiddlewares<RequestHandler>(UserController),
    ...fetchMiddlewares<RequestHandler>(UserController.prototype.register),

    async function UserController_register(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsUserController_register,
          request,
          response,
        });

        const controller = new UserController();

        await templateService.apiHandler({
          methodName: "register",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsPaymentController_processPayment: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "ProcessPaymentDTO",
    },
  };
  app.post(
    "/api/payments",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(PaymentController),
    ...fetchMiddlewares<RequestHandler>(
      PaymentController.prototype.processPayment,
    ),

    async function PaymentController_processPayment(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsPaymentController_processPayment,
          request,
          response,
        });

        const controller = new PaymentController();

        await templateService.apiHandler({
          methodName: "processPayment",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsPaymentController_getPaymentsByInvoice: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    invoiceId: {
      in: "path",
      name: "invoiceId",
      required: true,
      dataType: "string",
    },
  };
  app.get(
    "/api/payments/invoice/:invoiceId",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(PaymentController),
    ...fetchMiddlewares<RequestHandler>(
      PaymentController.prototype.getPaymentsByInvoice,
    ),

    async function PaymentController_getPaymentsByInvoice(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsPaymentController_getPaymentsByInvoice,
          request,
          response,
        });

        const controller = new PaymentController();

        await templateService.apiHandler({
          methodName: "getPaymentsByInvoice",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsPatientController_registerPatient: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "RegisterPatientDTO",
    },
    req: { in: "request", name: "req", required: true, dataType: "object" },
  };
  app.post(
    "/api/v1/patients/register",
    authenticateMiddleware([{ jwt: ["NURSE", "ADMIN"] }]),
    ...fetchMiddlewares<RequestHandler>(PatientController),
    ...fetchMiddlewares<RequestHandler>(
      PatientController.prototype.registerPatient,
    ),

    async function PatientController_registerPatient(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsPatientController_registerPatient,
          request,
          response,
        });

        const controller = new PatientController();

        await templateService.apiHandler({
          methodName: "registerPatient",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsPatientController_lookupPatients: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    mrn: { in: "query", name: "mrn", dataType: "string" },
    firstName: { in: "query", name: "firstName", dataType: "string" },
    lastName: { in: "query", name: "lastName", dataType: "string" },
  };
  app.get(
    "/api/v1/patients/lookup",
    authenticateMiddleware([{ jwt: ["NURSE", "DOCTOR", "ADMIN"] }]),
    ...fetchMiddlewares<RequestHandler>(PatientController),
    ...fetchMiddlewares<RequestHandler>(
      PatientController.prototype.lookupPatients,
    ),

    async function PatientController_lookupPatients(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsPatientController_lookupPatients,
          request,
          response,
        });

        const controller = new PatientController();

        await templateService.apiHandler({
          methodName: "lookupPatients",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsPatientController_getPatients: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    page: { in: "query", name: "page", dataType: "double" },
    limit: { in: "query", name: "limit", dataType: "double" },
    search: { in: "query", name: "search", dataType: "string" },
    gender: {
      in: "query",
      name: "gender",
      dataType: "union",
      subSchemas: [
        { dataType: "enum", enums: ["MALE"] },
        { dataType: "enum", enums: ["FEMALE"] },
        { dataType: "enum", enums: ["OTHER"] },
      ],
    },
    sortBy: {
      in: "query",
      name: "sortBy",
      dataType: "union",
      subSchemas: [
        { dataType: "enum", enums: ["createdAt"] },
        { dataType: "enum", enums: ["lastName"] },
        { dataType: "enum", enums: ["mrn"] },
      ],
    },
    sortOrder: {
      in: "query",
      name: "sortOrder",
      dataType: "union",
      subSchemas: [
        { dataType: "enum", enums: ["asc"] },
        { dataType: "enum", enums: ["desc"] },
      ],
    },
  };
  app.get(
    "/api/v1/patients",
    authenticateMiddleware([{ jwt: ["NURSE", "ADMIN"] }]),
    ...fetchMiddlewares<RequestHandler>(PatientController),
    ...fetchMiddlewares<RequestHandler>(
      PatientController.prototype.getPatients,
    ),

    async function PatientController_getPatients(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsPatientController_getPatients,
          request,
          response,
        });

        const controller = new PatientController();

        await templateService.apiHandler({
          methodName: "getPatients",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsMedicalServiceController_createService: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "CreateMedicalServiceInput",
    },
  };
  app.post(
    "/api/v1/medical-services",
    authenticateMiddleware([{ jwt: ["ADMIN"] }]),
    ...fetchMiddlewares<RequestHandler>(MedicalServiceController),
    ...fetchMiddlewares<RequestHandler>(
      MedicalServiceController.prototype.createService,
    ),

    async function MedicalServiceController_createService(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsMedicalServiceController_createService,
          request,
          response,
        });

        const controller = new MedicalServiceController();

        await templateService.apiHandler({
          methodName: "createService",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsMedicalServiceController_getServices: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    page: { in: "query", name: "page", dataType: "double" },
    limit: { in: "query", name: "limit", dataType: "double" },
    category: { in: "query", name: "category", dataType: "string" },
    search: { in: "query", name: "search", dataType: "string" },
  };
  app.get(
    "/api/v1/medical-services",
    ...fetchMiddlewares<RequestHandler>(MedicalServiceController),
    ...fetchMiddlewares<RequestHandler>(
      MedicalServiceController.prototype.getServices,
    ),

    async function MedicalServiceController_getServices(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsMedicalServiceController_getServices,
          request,
          response,
        });

        const controller = new MedicalServiceController();

        await templateService.apiHandler({
          methodName: "getServices",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsMedicalServiceController_getServiceById: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    id: { in: "path", name: "id", required: true, dataType: "string" },
  };
  app.get(
    "/api/v1/medical-services/:id",
    ...fetchMiddlewares<RequestHandler>(MedicalServiceController),
    ...fetchMiddlewares<RequestHandler>(
      MedicalServiceController.prototype.getServiceById,
    ),

    async function MedicalServiceController_getServiceById(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsMedicalServiceController_getServiceById,
          request,
          response,
        });

        const controller = new MedicalServiceController();

        await templateService.apiHandler({
          methodName: "getServiceById",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsMedicalServiceController_updateService: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    id: { in: "path", name: "id", required: true, dataType: "string" },
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "UpdateMedicalServiceInput",
    },
  };
  app.put(
    "/api/v1/medical-services/:id",
    authenticateMiddleware([{ jwt: ["ADMIN"] }]),
    ...fetchMiddlewares<RequestHandler>(MedicalServiceController),
    ...fetchMiddlewares<RequestHandler>(
      MedicalServiceController.prototype.updateService,
    ),

    async function MedicalServiceController_updateService(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsMedicalServiceController_updateService,
          request,
          response,
        });

        const controller = new MedicalServiceController();

        await templateService.apiHandler({
          methodName: "updateService",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: undefined,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsMedicalServiceController_provideService: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    request: {
      in: "request",
      name: "request",
      required: true,
      dataType: "object",
    },
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "Omit_ProvideServiceInput.providedById_",
    },
  };
  app.post(
    "/api/v1/medical-services/provide",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(MedicalServiceController),
    ...fetchMiddlewares<RequestHandler>(
      MedicalServiceController.prototype.provideService,
    ),

    async function MedicalServiceController_provideService(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsMedicalServiceController_provideService,
          request,
          response,
        });

        const controller = new MedicalServiceController();

        await templateService.apiHandler({
          methodName: "provideService",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsInvoiceController_generateInvoice: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "GenerateInvoiceDTO",
    },
  };
  app.post(
    "/api/invoices/generate",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(InvoiceController),
    ...fetchMiddlewares<RequestHandler>(
      InvoiceController.prototype.generateInvoice,
    ),

    async function InvoiceController_generateInvoice(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsInvoiceController_generateInvoice,
          request,
          response,
        });

        const controller = new InvoiceController();

        await templateService.apiHandler({
          methodName: "generateInvoice",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 201,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsInvoiceController_getInvoiceByVisit: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {
    visitId: {
      in: "path",
      name: "visitId",
      required: true,
      dataType: "string",
    },
  };
  app.get(
    "/api/invoices/visit/:visitId",
    authenticateMiddleware([{ jwt: [] }]),
    ...fetchMiddlewares<RequestHandler>(InvoiceController),
    ...fetchMiddlewares<RequestHandler>(
      InvoiceController.prototype.getInvoiceByVisit,
    ),

    async function InvoiceController_getInvoiceByVisit(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsInvoiceController_getInvoiceByVisit,
          request,
          response,
        });

        const controller = new InvoiceController();

        await templateService.apiHandler({
          methodName: "getInvoiceByVisit",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsHealthController_checkHealth: Record<
    string,
    TsoaRoute.ParameterSchema
  > = {};
  app.get(
    "/health",
    ...fetchMiddlewares<RequestHandler>(HealthController),
    ...fetchMiddlewares<RequestHandler>(HealthController.prototype.checkHealth),

    async function HealthController_checkHealth(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsHealthController_checkHealth,
          request,
          response,
        });

        const controller = new HealthController();

        await templateService.apiHandler({
          methodName: "checkHealth",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "LoginDTO",
    },
  };
  app.post(
    "/api/auth/login",
    ...fetchMiddlewares<RequestHandler>(AuthController),
    ...fetchMiddlewares<RequestHandler>(AuthController.prototype.login),

    async function AuthController_login(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsAuthController_login,
          request,
          response,
        });

        const controller = new AuthController();

        await templateService.apiHandler({
          methodName: "login",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsAuthController_logout: Record<string, TsoaRoute.ParameterSchema> = {
    requestBody: {
      in: "body",
      name: "requestBody",
      required: true,
      ref: "LogoutDTO",
    },
  };
  app.post(
    "/api/auth/logout",
    ...fetchMiddlewares<RequestHandler>(AuthController),
    ...fetchMiddlewares<RequestHandler>(AuthController.prototype.logout),

    async function AuthController_logout(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsAuthController_logout,
          request,
          response,
        });

        const controller = new AuthController();

        await templateService.apiHandler({
          methodName: "logout",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  const argsAuthController_refresh: Record<string, TsoaRoute.ParameterSchema> =
    {
      requestBody: {
        in: "body",
        name: "requestBody",
        required: true,
        ref: "RefreshTokenDTO",
      },
    };
  app.post(
    "/api/auth/refresh",
    ...fetchMiddlewares<RequestHandler>(AuthController),
    ...fetchMiddlewares<RequestHandler>(AuthController.prototype.refresh),

    async function AuthController_refresh(
      request: ExRequest,
      response: ExResponse,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = templateService.getValidatedArgs({
          args: argsAuthController_refresh,
          request,
          response,
        });

        const controller = new AuthController();

        await templateService.apiHandler({
          methodName: "refresh",
          controller,
          response,
          next,
          validatedArgs,
          successStatus: 200,
        });
      } catch (err) {
        return next(err);
      }
    },
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
    return async function runAuthenticationMiddleware(
      request: any,
      response: any,
      next: any,
    ) {
      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      // keep track of failed auth attempts so we can hand back the most
      // recent one.  This behavior was previously existing so preserving it
      // here
      const failedAttempts: any[] = [];
      const pushAndRethrow = (error: any) => {
        failedAttempts.push(error);
        throw error;
      };

      const secMethodOrPromises: Promise<any>[] = [];
      for (const secMethod of security) {
        if (Object.keys(secMethod).length > 1) {
          const secMethodAndPromises: Promise<any>[] = [];

          for (const name in secMethod) {
            secMethodAndPromises.push(
              expressAuthenticationRecasted(
                request,
                name,
                secMethod[name],
                response,
              ).catch(pushAndRethrow),
            );
          }

          // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

          secMethodOrPromises.push(
            Promise.all(secMethodAndPromises).then((users) => {
              return users[0];
            }),
          );
        } else {
          for (const name in secMethod) {
            secMethodOrPromises.push(
              expressAuthenticationRecasted(
                request,
                name,
                secMethod[name],
                response,
              ).catch(pushAndRethrow),
            );
          }
        }
      }

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      try {
        request["user"] = await Promise.any(secMethodOrPromises);

        // Response was sent in middleware, abort
        if (response.writableEnded) {
          return;
        }

        next();
      } catch (err) {
        // Show most recent error as response
        const error = failedAttempts.pop();
        error.status = error.status || 401;

        // Response was sent in middleware, abort
        if (response.writableEnded) {
          return;
        }
        next(error);
      }

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    };
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

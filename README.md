# ERP System Core

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Database](https://img.shields.io/badge/postgresql-15+-blue.svg)](https://www.postgresql.org/)
[![Status](https://img.shields.io/badge/status-active--development-green.svg)]()

A modern, scalable ERP system foundation with multi-tenant support, inventory management, and role-based access control.

## Features

✅ **Core Modules**
- User management with RBAC
- Multi-vendor support
- Product catalog with flexible attributes
- Warehouse & bin location management
- Inventory tracking (batch/serial numbers)
- Transaction auditing

✅ **Database Features**
- UUID primary keys
- Strategic JSONB fields for flexibility
- Normalized relational structure
- Comprehensive audit logging
- Configuration management

✅ **Scalability**
- Designed for distributed systems
- Supports multi-warehouse operations
- Flexible permission system

## Schema Overview

```mermaid
erDiagram
    users ||--o{ roles : "RBAC"
    users }|--|| vendors : "multi-vendor"
    products }|--|| vendors : "supplier"
    stock_items }|--|| products : "inventory"
    stock_items }|--|| bins : "location"
    bins }|--|| warehouses : "storage"
    stock_movements }|--|| stock_items : "tracking"
    audit_logs }|--|| users : "accountability"
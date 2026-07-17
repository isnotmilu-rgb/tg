LATFORM ARCHITECTURE & UI/UX SPECIFICATION: TG LOGISTICS SYSTEM
ROLE & CONTEXT:
Act as a Principal Frontend Architect, UI/UX Lead, and Database Engineer. You are designing the core system for TG (Transportes Gallardo), a cargo logistics and transport enterprise based in Chiloé, Chile. The system must feel like a robust, high-density industrial ERP, not a simplified tracking tool. It must match the data structure defined in the master spreadsheet control.xlsx and implement the layout paradigm of Version 1 (with Sidebar Navigation and a Detailed Data Table).

1. SYSTEM ARCHITECTURE & DATA SCHEMA (Based on control.xlsx)
The application must strictly map its data models (TypeScript interfaces) to the schema of the spreadsheet. You must define and use these exact entities:

Viaje (Travel):

id_viaje (Primary Key, unique)

fecha (ISO Date: yyyy-mm-dd)

patente (Foreign Key -> Camiones)

chofer (Visible Text) / id_chofer_ref (Hidden FK -> Choferes)

cliente (Visible Text) / id_cliente_ref (Hidden FK -> Clientes)

lugar_inicio / lugar_llegada (Foreign Keys -> Ciudades)

km_inicial (Number), km_final (Number), km_total (Calculated: km_final - km_inicial)

litros_cargados (Number)

dinero_recibido (Number)

gasto_combustible (Number), gasto_otros (Number), gastos_totales (Calculated: gasto_combustible + gasto_otros)

saldo_a_rendir (Calculated: dinero_recibido - gastos_totales). Business Logic rule: If gastos_totales is 0 but there is dinero_recibido, the balance must equal dinero_recibido (do not leave blank).

n_factura (String/Nullable)

Ciudad (Dynamic Catalog):

id_ciudad (PK), nombre_ciudad (String), activo (Boolean).

Operational Scope: Operating mainly in southern Chile. Seed data examples: Quellón, Chonchi, Castro, Puerto Montt, Temuco.

2. LAYOUT & UX SPECIFICATION (The "Version 1" Structure)
The layout must use the professional layout of Version 1: a split-screen viewport with persistent lateral control navigation.

A. Sidebar Navigation (Left Panel)
Style: Fixed width, high contrast background (Deep Navy - #0f172a).

Brand Header: "TG Logistics" / "Transportes Gallardo" with a subtle, clean logotype indicator.

Navigation Links:

Dashboard (Active by default)

Viajes (History and detailed ledger)

Flota (Trucks & Trailers management)

Choferes (Personnel directory)

Configuración (System parameters and catalogs)

User Profile (Footer): Small component at the bottom displaying the logged administrator (e.g., "Administrador").

B. Main Dashboard Workspace (Right Panel)
Background: Off-white/slate-50 (#f8fafc) for maximum readability.

Top Header: "Dashboard General" with subtitle "Resumen de operaciones y finanzas".

KPI Cards Row (3 Cards max, keeping the high-contrast numeric typography):

Viajes Activos: Big number display, showing current active operations with a trend indicator.

Ingresos del Mes: Formatted currency (CLP, e.g., $1.250.000) showing total billing.

Eficiencia de Flota (or Egresos): Highlighting the fiscal output or operational metric.

The Central Component: "Hoja de Vida de Viajes" (Detailed Data Table):

This is the core of Version 1. It must be a dense, structured data table.

Header controls: Includes an "Estado" dropdown filter ("Todos los estados", "En tránsito", "Completado").

Columns: ID / Ruta, Fecha Salida, Estado (Styled badge: Blue for "En tránsito/En Curso", Green for "Completado"), Monto, Saldo.

Rows: Render realistic data using TG's real southern routes (e.g., "Quellón → Puerto Montt", "Chonchi → Castro").

Floating Action Button (FAB) (Bottom Right):

A high-visibility, emerald green or teal circular button with a "+" icon.

On click, this button triggers a smooth transition/navigation to the Full-Page 'Nuevo Viaje' Form.

3. FULL-PAGE FORM SPECIFICATION: 'REGISTRAR NUEVO VIAJE'
When the FAB is pressed, navigate to a clean, full-screen input view.

Tab/Section Organization (To reduce mobile cognitive load):

[Datos Generales]: Select Patent (Dropdown), Select Driver (Dropdown), Date Picker.

[Ruta y Logística]:

Origin & Destination selectors. These must be dynamic select components that consume the Ciudad model.

Next to Origin/Destination, place a small, neat [+ Agregar Ciudad] button. On click, open a micro-modal to register a new city to the local state (dynamically updating the dropdown list immediately).

[Control de Kilometraje y Carga]: km_inicial, km_final, litros_cargados.

[Finanzas]: dinero_recibido, gasto_combustible, gasto_otros, n_factura.

Form Validations & Calculations (Real-time):

If km_final is entered and is lower than km_inicial, highlight the field in red with an error message: "El kilometraje final no puede ser menor al inicial".

Auto-calculate km_total and display it in a read-only badge.

Auto-calculate saldo_a_rendir in real-time as the user types financial values.

Form Action Buttons: Large, touch-friendly buttons at the bottom. [Guardar Registro] (Success Green, min-height 44px) and [Cancelar / Volver] (Neutral Slate).

4. TECHNICAL & CODE REQUIREMENT
Generate a modular, production-ready React codebase using Next.js (App Router) and Tailwind CSS.

Structure components cleanly:

Sidebar.tsx

KPICards.tsx

TravelTable.tsx

TravelForm.tsx (using React Hook Form or local state management with strict validations).

Provide a types.ts file modeling the exact attributes matching control.xlsx.

Ensure the UI is strictly mobile-first/responsive: spacing, hit-targets, and grid collapses must render beautifully on both smartphones (for drivers on-road) and desktop screens (for dispatch controllers).

Do not use generic dummy text or Mexican cities. All mock data must represent TG (Transportes Gallardo) operating in Chiloé and southern Chile.

Please write the complete code implementing this exact architecture, restoring the powerful utility of the Version 1 dashboard layout combined with the modern, refined CSS styling of Version 2.
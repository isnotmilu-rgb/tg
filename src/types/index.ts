// src/types/index.ts

export interface Ciudad {
  id_ciudad: string;
  nombre_ciudad: string;
  activo: boolean;
}

export interface Chofer {
  id_chofer: string;
  nombre_completo: string;
  rut: string;
  telefono: string;
  activo: boolean;
}

export interface Camion {
  id_camion: string;
  patente: string;
  marca: string;
  modelo: string;
  capacidad_toneladas: number;
  chofer_id?: string | null;
  activo: boolean;
}

export interface Cliente {
  id_cliente: string;
  nombre_cliente: string;
  rut_cliente: string;
  activo: boolean;
}

export interface Viaje {
  id_viaje: string;
  fecha: string;
  id_camion: string;
  id_chofer_ref: string;
  lugar_inicio: string; 
  lugar_llegada: string; 
  km_ruta: number;
  km_ajuste: number;
  km_total: number; // km_ruta + km_ajuste
  litros_cargados: number;
  dinero_recibido: number;
  concepto_gasto: string;
  monto_gasto: number;
  saldo_a_rendir: number; // dinero_recibido - monto_gasto
  estado: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  camiones?: {
    patente: string;
    marca: string;
    modelo: string;
  } | {
    patente: string;
    marca: string;
    modelo: string;
  }[] | null;
}

export interface KPIStats {
  ingresosMes: number;
  egresosMes: number;
  viajesActivos: number;
}

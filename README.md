# Dorado Club — Sistema de Gestión

Aplicación web (instalable en computadora o celular como PWA) para la gestión
empresarial de **Dorado Club**. Esta primera fase entrega el **inicio de sesión**
y el **papel de acceso** (control de roles por cargo).

## Estado actual (Fase 1)

- **Inicio de sesión** por usuario y contraseña, por cargo.
- **Papel de acceso / cargos**: los 10 cargos de la empresa, cada uno asociado a
  un departamento y con sus permisos de gestión.
- **Administración de perfiles y cargos**: solo el **Gerente General** y el
  **Súper Intendente** pueden crear cargos y perfiles (usuario/contraseña). El
  personal **no** puede registrarse por su cuenta.
- **Auditoría**: registro de actividad (inicios de sesión, creación/edición de perfiles).
- **Inicio y Gestión**: cada cargo ve los módulos de su gerencia. Los módulos de
  registro financiero se muestran como *Próximamente* (próximas fases).

## Cargos

Gerente General · Súper Intendente · Gerente Administrativo · Gerente de Mercadeo ·
Gerente de RRHH · Gerente Inmobiliaria · Gerente de Condominio · Gerente de Komplex Gym ·
Gerente de DFC · Gerente de Sport Bar.

> Solo **Gerente General** y **Súper Intendente** pueden gestionar usuarios y cargos.

## Métodos de pago (base común de compra/venta)

Pago Móvil (Bs) · Zelle (USD, tasa 1) · Dólares (USD, tasa 1) · Bancolombia (COP) · COP.
El monto en USD se calcula dividiendo el monto entre la tasa; si el método es en
dólares, la tasa es siempre 1.

## Credenciales de prueba

Todos los perfiles iniciales usan la contraseña `dorado2026`:

| Cargo                  | Usuario             |
|------------------------|---------------------|
| Gerente General        | `gerencia.general`  |
| Súper Intendente       | `superintendente`   |
| Gerente Administrativo | `administracion`    |
| Gerente de Mercadeo    | `mercadeo`          |
| Gerente de RRHH        | `rrhh`              |
| Gerente Inmobiliaria   | `inmobiliaria`      |
| Gerente de Condominio  | `condominio`        |
| Gerente de Komplex Gym | `komplexgym`        |
| Gerente de DFC         | `dfc`               |
| Gerente de Sport Bar   | `sportbar`          |

> Los datos se guardan en `sessionStorage` (demo). En fases siguientes se conectará
> un backend con base de datos para persistencia real y registro de ingresos/egresos.

## Desarrollo

```bash
npm install
npm run dev      # entorno de desarrollo
npm run build    # build de producción
npm run lint     # análisis de código
```

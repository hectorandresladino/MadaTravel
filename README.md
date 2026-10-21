# NÓMADA TRAVEL — Agencia de Viajes full stack para Azure

**Ejercicio docente de arquitectura cloud:** React + Vite (frontend) · Spring Boot Java 21 (backend) · PostgreSQL (base de datos) · GitHub Actions (CI/CD) · Azure Static Web Apps y Azure App Service.

## Qué funciona en este MVP

- Catálogo con 6 paquetes demostrativos cargados desde PostgreSQL.
- Buscador por ciudad o país y filtros por país.
- Formulario de reserva de 1 a 10 viajeros; validaciones en frontend y backend.
- El precio se calcula **en Java**, no se confía en el valor enviado desde la pantalla.
- Reserva guardada en la base con código y estado `PENDIENTE`.
- Diagnóstico de salud `GET /actuator/health`.
- Migraciones automáticas de datos/esquema con Flyway.
- 3 workflows GitHub: CI, deploy backend, deploy frontend (estos dos son **manuales** para controlar costos).
- Sin pagos, autenticación, proveedores de vuelos/hoteles, inventario real ni reservas comerciales. Los precios son ficticios.

## Estructura de carpetas

```text
AgenciaViajes_Azure/
├── README.md                        ← Guía general
├── .gitignore                       ← Evita subir secretos y build
├── .env.example                     ← Contraseña de PostgreSQL local (plantilla)
├── compose.yaml                     ← PostgreSQL local opcional (Docker)
├── frontend/                        ← CLIENTE: React + Vite
│   ├── .env.example                 ← VITE_API_URL
│   ├── package.json                 ← Dependencias JavaScript
│   ├── index.html                   ← Punto de entrada
│   ├── vite.config.js
│   ├── public/staticwebapp.config.json ← Rutas para Azure Static Web Apps
│   └── src/
│       ├── main.jsx                 ← Inicio de React
│       ├── App.jsx                  ← Catálogo + reservas
│       └── styles.css               ← Diseño adaptable
├── backend/                         ← SERVIDOR: Spring Boot Java 21
│   ├── pom.xml                      ← Dependencias Maven
│   ├── .env.example                 ← Variables backend (plantilla)
│   └── src/
│       ├── main/java/com/academia/viajes/
│       │   ├── AgenciaViajesApplication.java
│       │   ├── config/WebConfig.java             ← CORS
│       │   ├── controller/PaqueteController.java ← GET paquetes
│       │   ├── controller/ReservaController.java ← POST reservas
│       │   ├── dto/                             ← Validaciones y respuestas
│       │   ├── entity/                          ← JPA
│       │   ├── repository/                      ← Datos
│       │   ├── service/ReservaService.java      ← Lógica de negocio
│       │   └── exception/                       ← Gestión de errores
│       ├── main/resources/application.yml       ← DB_URL, DB_USER, DB_PASSWORD
│       ├── main/resources/db/migration/         ← SQL Flyway
│       └── test/                               ← Prueba de unidad
├── .github/workflows/
│   ├── 01-validacion.yml             ← CI: pruebas Java / build React
│   ├── 02-desplegar-backend.yml      ← Azure App Service
│   └── 03-desplegar-frontend.yml     ← Azure Static Web Apps
└── docs/
    ├── ARQUITECTURA.md              ← Diagrama de arquitectura y ER
    └── DESPLIEGUE_AZURE.md         ← Guía detallada Azure
```

## API que se implementó

| Verbo | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/paquetes` | Lista paquetes activos |
| GET | `/api/v1/paquetes/1` | Detalle de paquete |
| POST | `/api/v1/reservas` | Guarda una solicitud de reserva |
| GET | `/actuator/health` | Estado de salud API |

Ejemplo de petición:

```http
POST /api/v1/reservas
Content-Type: application/json

{"paqueteId":1,"nombreCliente":"Ana Pérez","correoCliente":"ana@example.com","viajeros":2}
```

Respuesta esperada: HTTP `201 Created`, cuerpo JSON con `codigo`, `estado`, `totalCop`, `creadaEn`.

## Comenzar

1. Abrir `docs/DESPLIEGUE_AZURE.md` y completar la sección **1. Pruebas locales**.
2. Verificar `/actuator/health` y abrir frontend `http://localhost:5173`.
3. **Solo después** crear recursos en Azure y configurar secretos OIDC / URL pública.
4. Ejecutar los workflows desde la pestaña Actions de GitHub.

**Estado de entrega:** se entregan todos los archivos fuente, no una aplicación ya publicada. En este entorno no estaban disponibles Maven ni las dependencias descargadas de npm, por lo cual las compilaciones y pruebas completas deben verificarse en GitHub Actions/tu equipo antes del despliegue.

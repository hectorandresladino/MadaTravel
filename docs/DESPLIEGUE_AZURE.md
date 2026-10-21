# Guía paso a paso: llevar Agencia de Viajes a Azure

> Estado: código de ejemplo creado; **no se ha publicado a ningún repositorio ni a Azure**. Para publicar debe disponer de su cuenta Azure, recursos y variables. Crear App Service y PostgreSQL puede generar cargos incluso sin tráfico: revisar precios y presupuestos antes.

## 0. Requisitos

- Azure activo con permisos para crear recursos y Microsoft Entra ID.
- Repositorio GitHub con este directorio como raíz. Rama principal `main`.
- Para ejecutar local: Java JDK 21, Maven 3.9+, Node.js 22, npm y PostgreSQL 16 (o Docker Desktop).
- Nombres sugeridos: grupo `rg-agencia-viajes-lab`, backend `app-agencia-viajes-UNICO`, frontend `swa-agencia-viajes`, PostgreSQL `pg-agencia-viajes-UNICO`. Sustituir `UNICO` con un sufijo disponible.

## 1. Pruebas locales (antes de gastar Azure)

1. Copiar `.env.example` (raíz) a `.env.local` y cambiar `DB_PASSWORD` por una contraseña fuerte para su equipo. No subir `.env.local`.
2. En la raíz ejecutar `docker compose --env-file .env.local up -d` (si tiene Docker). Este servicio solo publica PostgreSQL en `127.0.0.1:5432`.
3. Abrir terminal nueva y establecer variable `DB_PASSWORD` con el mismo valor. Windows PowerShell: `$env:DB_PASSWORD = 'LA_MISMA_CLAVE'`; bash: `export DB_PASSWORD='LA_MISMA_CLAVE'`.
4. Iniciar Java: `cd backend` y `mvn spring-boot:run`. Esperar arranque y migraciones Flyway.
5. Abrir en navegador `http://localhost:8080/actuator/health` (esperado: `{"status":"UP"}`). Ver paquetes en `http://localhost:8080/api/v1/paquetes`.
6. En otra terminal: `cd frontend`, `npm install` y `npm run dev`. Abrir `http://localhost:5173`.
7. Hacer una reserva desde la interfaz: debe devolver código `RES-...`. Si no, ver logs del backend y consola del navegador.
8. Parar PostgreSQL cuando termine: `docker compose --env-file .env.local down` (el volumen persiste).

## 2. Crear recursos en el Portal Azure

1. **Resource groups → Create**: `rg-agencia-viajes-lab` en una región disponible.
2. **Azure Database for PostgreSQL flexible server → Create**: base `agencia_viajes` (crear dentro de servidor); guardar nombre completo DNS `.postgres.database.azure.com`, usuario y contraseña de administrador de forma segura. Para producción cree usuario de aplicación con permisos mínimos. El plan y zona deben ajustarse al presupuesto; no hay garantía de gratuidad.
3. **Networking del servidor**: configurar acceso para el backend App Service. Para un proyecto real preferir conectividad privada (VNet integration + Private Endpoint/Private DNS, sujeta a planes/costo). Si usa acceso público para un laboratorio, restringir firewall a las IP requeridas. **No dejar 0.0.0.0/0 abierto indiscriminadamente**.
4. **App Services → Create → Web App**: nombre único, publicar `Code`, sistema Linux, pila **Java 21**, servidor **Java SE** (no Tomcat externo para JAR Spring Boot). Crear App Service plan compatible con su presupuesto.
5. **Static Web Apps → Create**: nombre `swa-agencia-viajes`; puede configurar Source=Other/manual si prefiere usar el workflow entregado. Obtener token de implementación desde *Manage deployment token* o usar el workflow generado por Azure, evitando dos pipelines en paralelo.

## 3. Variables en App Service → Environment variables

| Nombre | Ejemplo / significado |
|---|---|
| `DB_URL` | `jdbc:postgresql://NOMBRE.postgres.database.azure.com:5432/agencia_viajes?sslmode=verify-full` |
| `DB_USER` | Usuario PostgreSQL habilitado para la base |
| `DB_PASSWORD` | Secreto de PostgreSQL; **no publicarlo** |
| `CORS_ALLOWED_ORIGINS` | `https://DOMINIO.azurestaticapps.net` (dominio exacto del frontend) |

**No cambiar `PORT` manualmente** en Java SE Linux: Azure puede inyectarlo. Si aún no creó el frontend, use temporalmente una URL prevista y cámbiela tras conocer el dominio real. App Service reinicia al guardar variables.

Para mayor seguridad en producción use identidad administrada y/o referencias Key Vault en lugar de mantener secretos estáticos; se requiere configuración adicional de identidades/roles.

## 4. Configurar GitHub → Settings → Secrets and variables → Actions

**Repository secrets** para `02-desplegar-backend.yml`:
- `AZURE_CLIENT_ID`: ID de aplicación / principal de servicio usado para OIDC.
- `AZURE_TENANT_ID`: ID del directorio Microsoft Entra.
- `AZURE_SUBSCRIPTION_ID`: ID de suscripción.

Es necesario crear una **federated credential** en Entra para la identidad con `subject=repo:PROPIETARIO/REPOSITORIO:ref:refs/heads/main`, audiencia `api://AzureADTokenExchange` y conceder rol limitado que permita desplegar en App Service (por ejemplo Website Contributor sobre el recurso). No introducir una contraseña de cliente si utiliza OIDC.

**Repository secret** para frontend:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: deployment token de Static Web Apps.

**Repository variables**:
- `AZURE_WEBAPP_NAME`: nombre exacto del App Service existente (sin URL).
- `VITE_API_URL`: `https://NOMBRE-APP.azurewebsites.net` (sin barra final).

### 5. Desplegar en orden

1. GitHub → Actions → **01 - Validacion de codigo**: ejecutar/confirmar tests y builds en verde.
2. GitHub → Actions → **02 - Desplegar backend** → `Run workflow` en `main`.
3. Azure → App Service → Overview → Default domain → abrir `https://BACKEND.azurewebsites.net/actuator/health` y `/api/v1/paquetes`. Si la app inicia sin BD, revisar `DB_URL`, firewall, credenciales y logs.
4. GitHub → Actions → **03 - Desplegar frontend** → `Run workflow` después de definir `VITE_API_URL`.
5. Abrir dirección Static Web Apps. Hacer una reserva, confirmando **HTTP 201** desde navegador y persistencia en la base de datos.

**Nota GitHub OIDC**: la credencial federada configurada con `ref:refs/heads/main` sirve para ejecuciones desde `main`; si lanza manualmente en otra rama, puede fallar la identidad.

## 6. Diagnóstico de los errores más frecuentes

| Síntoma | Causa más probable | Dónde comprobar |
|---|---|---|
| GitHub Actions falla en Maven | Error Java, dependencias, test | Actions → job backend |
| `npm run build` falla | Error JSX/import o dependencias | Actions → job frontend |
| `GET /actuator/health` responde 503 | Backend no inicia o BD falla | App Service → Log stream; DB/firewall |
| API devuelve 500 | Error Java/SQL | App Service → Log stream |
| React dice sin conexión | URL API incorrecta o backend caído | DevTools → Network; `VITE_API_URL` en build |
| React muestra error CORS | Dominio frontend no coincide | `CORS_ALLOWED_ORIGINS` en App Service |
| SSL connection error | JDBC TLS/firewall/certificado | JDBC `sslmode=verify-full`, red PostgreSQL |
| Frontend carga blanco | Archivo `dist`/ruta incorrecta | Workflow frontend y `staticwebapp.config.json` |
| Reservas no aparecen | Frontend no conectó con API/BD | HTTP 201 y consultar `reservas` en PostgreSQL |

## 7. Control de costos

- Crear presupuesto y alertas en Cost Management + Billing antes de desplegar.
- App Service Plan y PostgreSQL Flexible Server pueden cobrar por recursos aprovisionados, incluso sin solicitudes.
- PostgreSQL Flexible Server permite detener y volver a iniciar temporalmente, sujeto a sus límites de plataforma; no equivale a borrar el recurso ni implica costo cero de almacenamiento.
- Al finalizar, **eliminar el Resource Group de laboratorio** solo si está seguro de no necesitar sus recursos y datos.

## Documentación oficial Microsoft

- App Service y GitHub Actions: https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions
- Static Web Apps Build: https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration
- PostgreSQL JDBC: https://learn.microsoft.com/en-us/azure/postgresql/connectivity/connect-java
- App Service Java: https://learn.microsoft.com/en-us/azure/app-service/quickstart-java

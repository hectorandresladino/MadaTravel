# MadaTravel - despliegue reutilizable con cualquier PostgreSQL

**Objetivo:** un solo repositorio de GitHub, un mismo archivo JAR y diferentes servidores PostgreSQL según el App Service elegido. No hay ninguna base de datos fija en GitHub ni en el código Java.

## 1. Arquitectura

GitHub (compila Java 21 con Maven) -> Azure App Service (ejecuta Spring Boot) -> PostgreSQL configurado para ESE App Service.

Cada App Service define en su propia configuración:

| Variable en App Service | Qué indica |
| --- | --- |
| `DB_URL` | URL JDBC completa del servidor y base de datos |
| `DB_USER` | Usuario autorizado en ese PostgreSQL |
| `DB_PASSWORD` | Contraseña de ese usuario (secreto) |
| `CORS_ALLOWED_ORIGINS` | URL HTTPS del frontend React correspondiente |

**No** se agregan datos de conexión al repositorio ni se definen en los pasos de compilación de GitHub. Azure App Service inyecta las variables al proceso Java durante la ejecución.

El archivo `backend/src/main/resources/application.yml` ya lee:
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/agencia_viajes}
    username: ${DB_USER:viajes}
    password: ${DB_PASSWORD:}
```

Los valores `localhost` son solo para desarrollo local si faltan las variables. En Azure debe establecer las 3.

## 2. Ejemplos de PostgreSQL intercambiables (NO son valores fijos)

Ejemplo A — App Service `aplicacion` y PostgreSQL `gestor11`:
```text
DB_URL=jdbc:postgresql://gestor11.postgres.database.azure.com:5432/basedatos1?sslmode=require
DB_USER=USUARIO_REAL_DE_GESTOR11
DB_PASSWORD=CONTRASENA_REAL_QUE_NO_DEBE_SUBIRSE_A_GITHUB
```

Ejemplo B — App Service `Moda` y PostgreSQL `modal86063`:
```text
DB_URL=jdbc:postgresql://modal86063.postgres.database.azure.com:5432/agencia_viajes?sslmode=require
DB_USER=USUARIO_REAL_DE_MODAL86063
DB_PASSWORD=OTRA_CONTRASENA_SECRETAMENTE_CONFIGURADA
```

Ejemplo C — servidor PostgreSQL compatible en otro proveedor o propio:
```text
DB_URL=jdbc:postgresql://SERVIDOR_O_IP:5432/NOMBRE_BASE?sslmode=require
DB_USER=USUARIO_APLICACION
DB_PASSWORD=CLAVE_APLICACION
```

La URL siempre tiene el formato `jdbc:postgresql://HOST:PUERTO/BASE?sslmode=require`, **sin espacios alrededor del signo igual**. Para producción, considere TLS con validación de certificado `sslmode=verify-full` y certificados confiables.

## 3. Preparar cada PostgreSQL

1. Crear o confirmar el servidor y la base de datos destino.
2. Crear un usuario autorizado. Para un laboratorio, el administrador puede ejecutar migraciones; en producción conceder solo privilegios necesarios.
3. Asegurar conectividad desde el App Service (reglas IP o conectividad privada, DNS, puerto 5432, TLS).
4. El backend activa **Flyway** y valida entidades con JPA; requiere permisos para ejecutar sus migraciones al iniciar, y una base compatible con las tablas del proyecto.
5. Mantener una base de datos distinta por despliegue si no se desea compartir reservas ni datos.

## 4. Configurar App Service en el Portal de Azure

1. Portal Azure -> App Services -> seleccionar el destino (p. ej. `aplicacion`).
2. Configuración -> Variables de entorno -> Configuración de aplicación.
3. Establecer `DB_URL`, `DB_USER`, `DB_PASSWORD` y `CORS_ALLOWED_ORIGINS`.
4. Guardar. Azure reinicia la aplicación cuando cambian las variables.
5. Comprobar Java SE 21 y que el JAR esté realmente desplegado. **Un App Service Running no significa que Spring Boot funcione**.
6. Nunca enviar contraseñas por capturas, commits ni logs. Para producción, considerar Azure Key Vault y credenciales de mínimo privilegio.

Consultas útiles desde Azure Cloud Shell (PowerShell), sustituyendo nombres:
```powershell
az webapp config appsettings list --resource-group clase --name aplicacion --query "[?name=='DB_URL'].value" -o tsv
az postgres flexible-server db list --resource-group clase --server-name gestor11 -o table
az webapp config show --resource-group clase --name aplicacion --query linuxFxVersion -o tsv
```
**No** consultar ni imprimir `DB_PASSWORD`.

## 5. GitHub Actions: desplegar un mismo JAR a cualquier App Service

Workflow manual:
```text
.github/workflows/04-desplegar-backend-universal.yml
```

1. GitHub -> repositorio MadaTravel -> Settings -> Secrets and variables -> Actions -> **Secrets**.
2. Crear los secretos de autenticación Azure OIDC: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`.
3. Configurar en Microsoft Entra las credenciales federadas GitHub para la rama `main` y conceder a esa identidad permisos mínimos para desplegar al App Service de destino; las credenciales y permisos de `Moda` pueden no servir para `aplicacion`.
4. Ir a Actions -> **04 - Desplegar backend universal (PostgreSQL por App Service)** -> Run workflow.
5. Seleccionar `main`, ingresar `app_name` y `resource_group` del App Service de destino.
6. El workflow compila **`backend/pom.xml`**, verifica la presencia de DB_URL/DB_USER/DB_PASSWORD en el App Service y publica el JAR allí. **No elige ni modifica el PostgreSQL**.
7. Comprobar el arranque con `GET /actuator/health` y los datos con `GET /api/v1/paquetes`.

**Importante:** el workflow universal utiliza los tres secretos OIDC genéricos. Si aún no los configuró, la ejecución no podrá iniciar sesión en Azure. Esto no afecta a los workflows que Azure generó con credenciales diferentes.

## 6. El frontend también es configurable, pero NO conoce PostgreSQL

React solo llama al backend a través de `VITE_API_URL`, por ejemplo:
```text
VITE_API_URL=https://URL-PUBLICA-DEL-APP-SERVICE
```

`VITE_API_URL` debe suministrarse **durante la compilación del frontend Vite**, en el workflow de Azure Static Web Apps correspondiente. No es una contraseña. No apunte React directamente a PostgreSQL.

En este repositorio hay despliegues anteriores:
- `azure-static-web-apps-mango-wave-0fab55f0f.yml` -> frontend anterior asociado a `Moda`.
- `azure-static-web-apps-ambitious-flower-054db1310.yml` -> frontend nuevo, que lee la variable de GitHub `VITE_API_URL_APLICACION`. Configure esa variable con la URL HTTPS real del nuevo backend, sin `/api` ni `/actuator/health`.

## 7. Diagnóstico

| Síntoma | Revisión |
| --- | --- |
| 404 Nginx en `/actuator/health` | Java/JAR no desplegado correctamente; revisar runtime y workflow |
| 503 App Service | Revisar logs de arranque Java, DB_URL, red, TLS, autenticación y Flyway |
| `Connect timed out` | El App Service no alcanza PostgreSQL: IP/firewall/red |
| `SQL State 28P01` | Usuario o contraseña incorrectos |
| Error en Flyway | Permisos, esquema, migraciones o compatibilidad PostgreSQL |
| React dice `No fue posible conectar con la API` | Verificar `VITE_API_URL` al compilar, endpoint y CORS |
| 404 Whitelabel en `/` | Normal en API sin ruta raíz; probar `/actuator/health` |

## 8. Seguridad y límites

Este diseño es **agnóstico al servidor PostgreSQL**, pero NO significa que una aplicación conecte a varias bases simultáneamente o que cambie de servidor sin reiniciar. Cada instancia de App Service utiliza el conjunto de variables de entorno que tenga configurado. No copie el firewall ni la contraseña de un servidor a otro; configure cada servidor individualmente.

Documentación Microsoft: https://learn.microsoft.com/en-us/azure/app-service/configure-common

Repositorio: https://github.com/hectorandresladino/MadaTravel

# music-store-web

Frontend de Music Store, una tienda online de vinilos y CDs de rock y metal japonés (J-Rock, J-Metal y Visual Kei). Consume los microservicios `user` (autenticación y cuentas) y `album` (catálogo).

## Composición

```
music-store-web/
├── proxy.conf.json            Proxy de desarrollo hacia los microservicios
├── public/
│   ├── covers/                Portadas de los álbumes
│   ├── favicon.svg
│   └── logo.svg
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.css             Tema global (colores y estilos compartidos)
    └── app/
        ├── app.config.ts      Router, HttpClient, interceptor y locale es-CL
        ├── app.routes.ts      Rutas con carga diferida y guards
        ├── app.ts / app.html  Estructura base: barra, contenido y footer
        ├── components/        Componentes reutilizables
        │   ├── navbar/        Barra de navegación según el rol
        │   ├── footer/        Pie de página
        │   └── order-history/ Historial de compras
        ├── guards/            auth, customer y admin
        ├── interceptors/      Agrega las credenciales a las peticiones /api
        ├── models/            Album, Profile, CartItem, Order
        ├── pages/             Una carpeta por pantalla
        ├── services/          auth, account, album, cart, order
        └── validators/        Reglas de contraseña y correo
```

## Especificaciones

### Tecnologías

| Tecnología | Versión |
|---|---|
| Angular (componentes standalone, signals) | 21.2 |
| Bootstrap | 5.3.9 |
| TypeScript | 5.9 |
| Node.js | 22 o superior |

### Pantallas y acceso por rol

| Ruta | Pantalla | Anónimo | Cliente (`USER`) | Administrador (`ADMIN`) |
|---|---|---|---|---|
| `/` | Inicio: carrusel de destacados y novedades | Sí | Sí | Sí |
| `/catalog` | Catálogo con buscador | Sí | Sí | Sí |
| `/albums/:id` | Detalle del álbum | Sí | Sí | Sí |
| `/login` | Inicio de sesión | Sí | Sí | Sí |
| `/register` | Registro de usuarios | Sí | Sí | Sí |
| `/recover-password` | Recuperar contraseña | Sí | Sí | Sí |
| `/profile` | Modificar perfil y ver mis compras | No | Sí | Sí, sin compras |
| `/cart` | Carrito | No | Sí | No |
| `/checkout` | Finalizar compra | No | Sí | No |
| `/admin/albums` | Gestión del catálogo | No | No | Sí |

Los guards redirigen a `/login` si no hay sesión y al inicio si el rol no corresponde. La barra de navegación y el footer muestran solo las opciones del rol activo.

### Patrón de diseño

El front aplica **Singleton** y **Observer**:

- **Singleton**: cada servicio (`AuthService`, `CartService`, `OrderService`, `AlbumService`, `AccountService`) se declara con `providedIn: 'root'`, por lo que existe una sola instancia compartida por toda la aplicación.
- **Observer**: el estado se expone con `signal` y `computed`. Los componentes observan esos valores y se actualizan solos cuando cambian; por ejemplo, la barra muestra el contador del carrito y las opciones del rol sin recargar la página. Las respuestas HTTP se manejan como `Observable` de RxJS.

### Datos

| Dato | Origen | Almacenamiento en el front |
|---|---|---|
| Álbumes | Microservicio `album` | Arreglos en `signal` dentro de cada página |
| Sesión | Microservicio `user` (`POST /api/auth/login`) | `sessionStorage`; se borra al cerrar la pestaña |
| Carrito | Front | Arreglo en `localStorage`, una clave por usuario |
| Compras | Front | Arreglo en `localStorage`, una clave por usuario |

La compra es simulada: no hay pasarela de pago ni se descuenta stock en el microservicio. La recuperación de contraseña también es simulada y no envía correos.

### Validaciones

Todos los formularios usan Reactive Forms y validan con atributos HTML (`required`, `minlength`, `maxlength`, `pattern`, `type="email"`) y con validadores de Angular. Los mensajes se muestran en español debajo de cada campo.

La contraseña de registro y perfil debe cumplir:

1. Entre 8 y 100 caracteres
2. Al menos una letra mayúscula
3. Al menos una letra minúscula
4. Al menos un número
5. Al menos un carácter especial
6. Sin espacios

El correo debe tener un dominio con extensión, por ejemplo `nombre@dominio.cl`.

### Diseño responsive

La grilla de 12 columnas de Bootstrap adapta las pantallas a tres tamaños:

| Tamaño | Ejemplo |
|---|---|
| Celular (< 576 px) | Catálogo en 1 columna, menú hamburguesa |
| Tablet (≥ 768 px) | Catálogo en 2 columnas, novedades en 3 |
| Escritorio (≥ 992 px) | Catálogo en 4 columnas, barra completa |

## Ejecución

### Requisitos

- Node.js 22 o superior y npm
- Microservicio `user` en `http://localhost:8081`
- Microservicio `album` en `http://localhost:8080`

### Instalación

```powershell
npm install
```

### Desarrollo

```powershell
npm start
```

La aplicación queda en `http://localhost:4200`. El proxy de `proxy.conf.json` redirige las peticiones a los microservicios, así que no se necesita CORS:

| Ruta | Destino |
|---|---|
| `/api/albums` | `http://localhost:8080` |
| `/api/auth`, `/api/users` | `http://localhost:8081` |

### Compilación

```powershell
npm run build
```

Los archivos quedan en `dist/music-store-web/browser`.

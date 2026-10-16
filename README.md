# La cadena de llamadas — CBO y RFC

Aplicación web (HTML + CSS + JavaScript, sin build) que cuenta una historia para
exponer en clase dos métricas de la suite de Chidamber & Kemerer (1994):

- **CBO** — *Coupling Between Objects*: cuántas **clases** distintas usa una clase.
- **RFC** — *Response For a Class*: cuántos **métodos** se ejecutan en respuesta a un mensaje.

La historia: una empresa de cinco personas. Cada oficina es una clase, cada llamada
es una arista. Ana (Cliente) escribe a Carla (Pedido); Carla llama a Diego
(Inventario), Elena (Facturación) y Gloria (Notificaciones); Bruno (Mostrador) es la
fachada que lo coordina todo.

## Cómo usarla (offline, sin servidor)

1. Clona o descarga el repo.
2. Doble clic en `index.html`.

No hay dependencias, ni `node_modules`, ni CDN, ni `fetch`. Funciona desde `file://`
y sin conexión a internet, que es la razón por la que no se usó ningún framework ni
ninguna fuente descargada.

## Controles

| Tecla | Acción |
| --- | --- |
| `→`, `Espacio`, `Enter`, `PageDown`, `n` | Siguiente paso |
| `←`, `PageUp`, `p` | Paso anterior |
| `Inicio` / `Fin` | Primera / última escena |
| `S` | Abrir / cerrar las notas del expositor |
| `R` | Abrir / cerrar la ficha de referencia |
| `Esc` | Cerrar el panel abierto |
| `F` | Pantalla completa |

También funciona con un *clicker* de presentaciones, porque responde a `PageDown`,
`PageUp` y a las flechas. Los botones ‹ › de la barra inferior hacen lo mismo con
ratón o pantalla táctil. La navegación respeta `prefers-reduced-motion`.

## Datos de la portada

Ya están puestos en `scenes.js`, dentro de `meta`:

```js
course: "Ingeniería de Software III",
author: "David Barceló · Exposición corte 2",
```

Para cambiarlos, edita esos dos valores. No hay marcadores `[ ]` pendientes en el guion.

## Cómo editar el guion

Todo el contenido está en **`scenes.js`**, en `window.STORY.scenes`. Cada escena tiene
un `kind` que decide cómo se dibuja:

| `kind` | Para qué sirve |
| --- | --- |
| `cover` | Portada |
| `graph` | Grafo de la empresa (nodos, aristas, HUD con el valor acumulado) |
| `table` | Tabla de comparación o de convenciones |
| `code` | Código Java antes / después |
| `quiz` | Preguntas con opciones y explicación |
| `closing` | Cierre y fuentes |

Cada `graph` dibuja un nodo SVG por elemento de `nodes` y una flecha por elemento de
`edges`. Las coordenadas están en un `viewBox` de `100 × 70` y los nodos miden
`20 × 9` unidades (`NODE_HW` / `NODE_HH` en `app.js`). Si mueves un nodo, deja al
menos 20 unidades de separación horizontal en la misma fila: si no, la etiqueta de la
arista no cabe en el hueco y queda tapada por las cajas.

`app.js` es el motor (navegación, render, marcadores SVG). `styles.css` es el aspecto.
Para cambiar solo el guion no hace falta tocar ninguno de los dos.

## Comprobar que no rompiste nada

```powershell
node --check app.js
node --check scenes.js
```

Las dos deben salir sin error. Después abre `index.html` y recorre las 12 escenas /
21 pasos: los grafos son lo único que puede quedar mal sin dar error de consola.

## Publicarlo (opcional)

El repo es estático, así que GitHub Pages lo sirve tal cual: *Settings → Pages →
Deploy from a branch → main / (root)*. El doble clic local sigue funcionando igual.

## Fuentes

- Chidamber, S. R. & Kemerer, C. F. (1994). *A Metrics Suite for Object Oriented
  Design*. IEEE Transactions on Software Engineering, 20(6), 476–493.
- McCabe, T. J. (1976). *A Complexity Measure*. IEEE TSE, SE-2(4), 308–320.
- Basili, V., Caldiera, G. & Rombach, H. D. (1994). *The Goal Question Metric
  Approach*. Encyclopedia of Software Engineering.

## Dos avisos sobre terminología

La definición de la suite se usa literal, porque casi todo el valor pedagógico de la
charla está ahí:

- **RFC** es la **clausura transitiva** del conjunto de respuesta (*RB*+*RF*); muchas
  herramientas comerciales cuentan solo un nivel de profundidad. El mismo código da 2
  o 6 según la convención. Por eso la escena 7 compara las dos.
- **CBO** se cuenta **solo en saliente** (eferente) y sin herencia — la herencia es
  **DIT**. Contar a quien te llama es el error más común al contar CBO a mano.

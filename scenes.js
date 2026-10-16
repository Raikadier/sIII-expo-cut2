/* ============================================================
   CONTENIDO DE LA HISTORIA
   Edita este archivo para cambiar el guion. No hace falta tocar
   app.js ni styles.css.
   ============================================================ */

window.STORY = {
  meta: {
    title: "La cadena de llamadas",
    subtitle: "Acoplamiento entre objetos (CBO) y respuesta de una clase (RFC)",
    course: "Ingeniería de Software — [ajusta el nombre de la materia]",
    author: "[Tu nombre] · Exposición corte 2",
    hint: "Usa → / espacio para avanzar · ← para volver · S notas · R ficha"
  },

  scenes: [
    /* ---------------------------------------------------------- 1 */
    {
      id: "portada",
      kind: "cover",
      chapter: "Apertura",
      title: "La cadena de llamadas",
      subtitle: "Dos métricas, una empresa, y una pregunta incómoda.",
      narration:
        "Vamos a medir una empresa de cinco personas. No con encuestas: con dos métricas " +
        "de la suite de Chidamber y Kemerer. Al final sabrás contar CBO y RFC sobre cualquier " +
        "código que te pongan delante.",
      beats: [
        {
          say: "",
          note:
            "No leas la diapositiva. Di: 'hoy no vamos a definir métricas, vamos a contar. " +
            "Contar personas, contar llamadas, y ver qué número sale.'"
        }
      ]
    },

    /* ---------------------------------------------------------- 2 */
    {
      id: "plano",
      kind: "graph",
      chapter: "Capítulo 1",
      title: "El plano de la oficina",
      narration:
        "Esta es la empresa. Cada oficina es una clase. Ana es el cliente: el que manda un mensaje.",
      concept: {
        term: "Grafo de dependencias",
        body:
          "En orientación a objetos, 'acoplamiento' no es una sensación: es el número de aristas " +
          "de un grafo dirigido. Nodo = clase. Arista = una clase usa a otra."
      },
      graph: {
        viewBox: "0 0 100 70",
        nodes: [
          { id: "ana",    label: "Ana",    role: "Cliente",        x: 20, y: 12, kind: "actor" },
          { id: "carla",  label: "Carla",  role: "Pedido",         x: 20, y: 40, kind: "class" },
          { id: "diego",  label: "Diego",  role: "Inventario",     x: 80, y: 10, kind: "class" },
          { id: "elena",  label: "Elena",  role: "Facturación",    x: 80, y: 40, kind: "class" },
          { id: "gloria", label: "Gloria", role: "Notificaciones", x: 80, y: 62, kind: "class" }
        ],
        edges: [
          { id: "e_ana_carla",   from: "ana",   to: "carla",  label: "pide vender" },
          { id: "e_carla_diego", from: "carla", to: "diego",  label: "2 métodos" },
          { id: "e_carla_elena", from: "carla", to: "elena",  label: "facturar" },
          { id: "e_carla_gloria",from: "carla", to: "gloria", label: "avisar" }
        ]
      },
      beats: [
        {
          say: "Todo lo que va a pasar esta tarde empieza por una sola flecha.",
          active: ["ana"], edges: [], hud: null,
          note: "Señala la flecha Ana → Carla. Insiste: el mensaje sale del cliente."
        }
      ]
    },

    /* ---------------------------------------------------------- 3 */
    {
      id: "cbo",
      kind: "graph",
      chapter: "Capítulo 2",
      title: "CBO: las líneas directas",
      narration:
        "Pregunta: ¿de cuántas oficinas distintas depende Carla para hacer UNA venta?",
      concept: {
        term: "CBO — Coupling Between Objects",
        body:
          "Número de clases distintas con las que esta clase está acoplada (usa sus métodos o sus " +
          "atributos). Cuenta clases, no llamadas.",
        formula: "CBO(Pedido) = 3"
      },
      graph: {
        viewBox: "0 0 100 70",
        nodes: [
          { id: "ana",    label: "Ana",    role: "Cliente",        x: 20, y: 12, kind: "actor" },
          { id: "carla",  label: "Carla",  role: "Pedido",         x: 20, y: 40, kind: "class" },
          { id: "diego",  label: "Diego",  role: "Inventario",     x: 80, y: 10, kind: "class" },
          { id: "elena",  label: "Elena",  role: "Facturación",    x: 80, y: 40, kind: "class" },
          { id: "gloria", label: "Gloria", role: "Notificaciones", x: 80, y: 62, kind: "class" }
        ],
        edges: [
          { id: "e_ana_carla",   from: "ana",   to: "carla",  label: "pide vender" },
          { id: "e_carla_diego", from: "carla", to: "diego",  label: "2 métodos" },
          { id: "e_carla_elena", from: "carla", to: "elena",  label: "facturar" },
          { id: "e_carla_gloria",from: "carla", to: "gloria", label: "avisar" }
        ]
      },
      beats: [
        {
          say: "Carla escribe a Diego. La empresa ya tiene una oficina que depende de otra.",
          active: ["carla"], counted: ["diego"], edges: ["e_carla_diego"],
          hud: { label: "CBO(Pedido)", value: 1 },
          note: "Pregunta a la clase: '¿y aquí cuánto vale CBO?'. Deja que respondan."
        },
        {
          say: "Carla también necesita a Elena para cobrar.",
          active: ["carla"], counted: ["diego", "elena"], edges: ["e_carla_diego", "e_carla_elena"],
          hud: { label: "CBO(Pedido)", value: 2 },
          note: "Mismo patrón. El número sube de uno en uno."
        },
        {
          say: "Y a Gloria para avisar al cliente. Tres dependencias distintas.",
          active: ["carla"], counted: ["diego", "elena", "gloria"],
          edges: ["e_carla_diego", "e_carla_elena", "e_carla_gloria"],
          hud: { label: "CBO(Pedido)", value: 3 },
          note: "Aquí es donde la clase suele decir 'cuatro', contando a Ana. Ver la siguiente nota."
        },
        {
          say: "¿Ana cuenta? No. CBO no pregunta quién te llama: pregunta a quién llamas tú.",
          active: ["ana"], counted: ["diego", "elena", "gloria"],
          edges: ["e_carla_diego", "e_carla_elena", "e_carla_gloria"],
          hud: { label: "CBO(Pedido)", value: 3, warn: "Ana no se cuenta" },
          concept: {
            term: "Dirección del acoplamiento",
            body:
              "CBO mide acoplamiento eferente (saliente). Si te llama Ana, el acoplado es Ana, no tú. " +
              "Confundir la dirección es el error número uno al contar CBO a mano."
          },
          note:
            "Este es el punto pedagógico del capítulo. Si la clase no se equivocó, provócala: " +
            "'¿seguro? ¿Ana no es una dependencia?'"
        }
      ]
    },

    /* ---------------------------------------------------------- 4 */
    {
      id: "rfc",
      kind: "graph",
      chapter: "Capítulo 3",
      title: "RFC: el efecto dominó",
      narration:
        "Segunda pregunta, distinta: si Ana le pide a Carla UNA sola venta, ¿cuántos métodos acaban ejecutándose?",
      concept: {
        term: "RFC — Response For a Class",
        body:
          "Tamaño del conjunto de respuesta: los métodos que pueden ejecutarse cuando un objeto de " +
          "la clase recibe un mensaje. Cuenta métodos, no clases.",
        formula: "RFC(Pedido) = |RS| = 5"
      },
      graph: {
        viewBox: "0 0 100 70",
        nodes: [
          { id: "ana",    label: "Ana",    role: "Cliente",        x: 20, y: 12, kind: "actor" },
          { id: "carla",  label: "Carla",  role: "Pedido",         x: 20, y: 40, kind: "class" },
          { id: "diego",  label: "Diego",  role: "Inventario",     x: 80, y: 10, kind: "class" },
          { id: "elena",  label: "Elena",  role: "Facturación",    x: 80, y: 40, kind: "class" },
          { id: "gloria", label: "Gloria", role: "Notificaciones", x: 80, y: 62, kind: "class" }
        ],
        edges: [
          { id: "e_ana_carla",   from: "ana",   to: "carla",  label: "pide vender" },
          { id: "e_carla_diego", from: "carla", to: "diego",  label: "2 métodos" },
          { id: "e_carla_elena", from: "carla", to: "elena",  label: "facturar" },
          { id: "e_carla_gloria",from: "carla", to: "gloria", label: "avisar" }
        ]
      },
      beats: [
        {
          say: "Se ejecuta Pedido.vender(). Van 1.",
          active: ["carla"], edges: [],
          hud: { label: "RFC(Pedido)", value: 1 },
          note: "Empieza a contar en voz alta. El conteo en voz alta es el 80% de la explicación."
        },
        {
          say: "vender() llama a verificarStock(). Van 2. Y luego a reservar(). Van 3.",
          active: ["carla"], counted: ["diego"], edges: ["e_carla_diego"],
          hud: { label: "RFC(Pedido)", value: 3 },
          note:
            "CLAVE: Diego aporta DOS métodos con UNA sola clase acoplada. CBO=3 pero RFC=5. " +
            "Ese desfase es el corazón de la exposición."
        },
        {
          say: "facturar() de Elena. Van 4.",
          active: ["carla"], counted: ["diego", "elena"],
          edges: ["e_carla_diego", "e_carla_elena"],
          hud: { label: "RFC(Pedido)", value: 4 },
          note: "Pausa. Deja que la clase anticipe el último."
        },
        {
          say: "avisar() de Gloria. Cinco.",
          active: ["carla"], counted: ["diego", "elena", "gloria"],
          edges: ["e_carla_diego", "e_carla_elena", "e_carla_gloria"],
          hud: { label: "RFC(Pedido)", value: 5 },
          concept: {
            term: "CBO y RFC no miden lo mismo",
            body:
              "CBO = 3 clases acopladas. RFC = 5 métodos ejecutables. Diego cuenta una vez para CBO " +
              "y dos veces para RFC. Quien promedie ambas métricas como si fueran la misma cosa, " +
              "está midiendo peor que si no midiera nada."
          },
          note: "Cierra el capítulo con la comparación en la pizarra: 3 vs 5."
        }
      ]
    },

    /* ---------------------------------------------------------- 5 */
    {
      id: "ficha",
      kind: "table",
      chapter: "Ficha técnica",
      title: "Qué mide cada una (y dónde se rompe)",
      narration: "Antes de seguir, la letra pequeña. Sin esto, los números que viste no significan nada.",
      table: {
        headers: ["", "CBO", "RFC"],
        rows: [
          ["Qué cuenta", "Clases distintas acopladas", "Métodos ejecutables"],
          ["Unidad", "Clases", "Métodos"],
          ["Grafo sobre el que se calcula", "Dependencias (usa-a)", "Llamadas (invoca-a)"],
          ["Dirección", "Solo saliente (eferente)", "Saliente y transitiva"],
          ["En Pedido (cap. 2 y 3)", "3", "5"],
          ["Dónde está el problema", "Valor alto = cambio en cascada", "Valor alto = difícil de probar y de depurar"]
        ],
        warnings: [
          "RFC según Chidamber & Kemerer (1994) es la CLAUSURA transitiva del conjunto de respuesta. Muchas herramientas comerciales cuentan solo un nivel. El número cambia; la definición, no.",
          "CBO suele contarse sin herencia (para eso está DIT), pero cada herramienta decide. Declara siempre tu regla de conteo.",
          "Ninguna de las dos distingue acoplamiento a una interfaz estable de acoplamiento a una clase concreta. Ese es el punto ciego que veremos en el capítulo 5."
        ]
      },
      beats: [
        {
          say: "Dos métricas, dos grafos, dos unidades. Y una advertencia: sin definición operativa, el número es decorativo.",
          note:
            "Si el docente pregunta por la fuente: Chidamber, S. R. y Kemerer, C. F. (1994). " +
            "A Metrics Suite for Object Oriented Design. IEEE TSE 20(6), 476-493."
        }
      ]
    },

    /* ---------------------------------------------------------- 6 */
    {
      id: "refactor",
      kind: "graph",
      chapter: "Capítulo 4",
      title: "El mostrador único",
      narration:
        "Contratan a Bruno. Ahora Carla no habla con Diego, Elena ni Gloria: habla solo con el mostrador.",
      concept: {
        term: "Interfaz estable / fachada",
        body:
          "Carla depende de una abstracción (Mostrador) y no de tres clases concretas. El acoplamiento " +
          "no desaparece: se traslada al mostrador, que asume toda la coordinación."
      },
      graph: {
        viewBox: "0 0 100 70",
        nodes: [
          { id: "ana",    label: "Ana",    role: "Cliente",        x: 20, y: 12, kind: "actor" },
          { id: "carla",  label: "Carla",  role: "Pedido",         x: 20, y: 40, kind: "class" },
          { id: "bruno",  label: "Bruno",  role: "Mostrador",      x: 52, y: 40, kind: "interface" },
          { id: "diego",  label: "Diego",  role: "Inventario",     x: 80, y: 10, kind: "class", muted: true },
          { id: "elena",  label: "Elena",  role: "Facturación",    x: 80, y: 40, kind: "class", muted: true },
          { id: "gloria", label: "Gloria", role: "Notificaciones", x: 80, y: 62, kind: "class", muted: true }
        ],
        edges: [
          { id: "e_ana_carla",    from: "ana",   to: "carla",  label: "pide vender" },
          { id: "e_carla_bruno",  from: "carla", to: "bruno",  label: "despachar" },
          { id: "e_bruno_diego",  from: "bruno", to: "diego",  label: "", muted: true },
          { id: "e_bruno_elena",  from: "bruno", to: "elena",  label: "", muted: true },
          { id: "e_bruno_gloria", from: "bruno", to: "gloria", label: "", muted: true }
        ]
      },
      beats: [
        {
          say: "CBO(Pedido) cae de 3 a 1. Carla ya solo conoce una clase.",
          active: ["carla"], counted: ["bruno"], edges: ["e_carla_bruno"],
          hud: { label: "CBO(Pedido)", value: 1, delta: "3 → 1" },
          note: "Este es el resultado que todos esperaban. No te detengas: la sorpresa viene ahora."
        },
        {
          say: "Pero mira las llamadas. vender() → despachar() → y desde ahí, otra vez todo el edificio.",
          active: ["bruno"], counted: ["diego", "elena", "gloria"],
          edges: ["e_carla_bruno", "e_bruno_diego", "e_bruno_elena", "e_bruno_gloria"],
          hud: { label: "RFC(Pedido)", value: 6, warn: "subió" },
          concept: {
            term: "Cuando las métricas se contradicen",
            body:
              "Si RFC se calcula como clausura transitiva, acabas de AÑADIR un método (despachar) y " +
              "RFC pasó de 5 a 6. Un refactor que mejora el acoplamiento puede empeorar la respuesta. " +
              "Ninguna de las dos métricas es 'la verdad': miden cosas distintas."
          },
          note:
            "Si alguien dice 'entonces la fachada no sirve', responde: la fachada sí redujo el " +
            "acoplamiento directo. Lo que falla es creer que una sola métrica resume la calidad."
        }
      ]
    },

    /* ---------------------------------------------------------- 7 */
    {
      id: "convencion",
      kind: "table",
      chapter: "Capítulo 5",
      title: "La métrica que no significa nada",
      narration: "El mismo código, la misma herramienta inexistente, dos respuestas.",
      table: {
        headers: ["Convención de conteo", "RS (conjunto de respuesta)", "RFC"],
        rows: [
          ["Después del refactor · un nivel (llamadas directas)", "{vender, despachar}", "2"],
          ["Después del refactor · clausura (definición de CK, 1994)", "{vender, despachar, verificarStock, reservar, facturar, avisar}", "6"],
          ["Antes del refactor · clausura", "{vender, verificarStock, reservar, facturar, avisar}", "5"]
        ],
        warnings: [
          "Mismo código, mismo instante: con 'un nivel' el refactor bajó RFC de 5 a 2; con 'clausura' lo subió de 5 a 6. Ambas cifras son defendibles.",
          "Conclusión operativa: en un informe de métricas, la definición operativa va ANTES que el número. Un RFC sin declarar su convención es una cifra sin unidad."
        ]
      },
      beats: [
        {
          say: "3 → 1 en CBO es indiscutible. En RFC, el refactor puede haber mejorado, empeorado o dado igual. Depende de tu regla.",
          note:
            "Esta es la diapositiva que separa una exposición de estudiantes de una exposición profesional. " +
            "Aquí demuestras que entiendes la diferencia entre medir y calcular."
        }
      ]
    },

    /* ---------------------------------------------------------- 8 */
    {
      id: "trampa",
      kind: "graph",
      chapter: "Capítulo 6",
      title: "El mostrador mágico",
      narration:
        "Seis meses después, alguien 'optimiza' a Bruno para que acepte cualquier cosa: una acción como texto y un mapa de datos.",
      concept: {
        term: "El acoplamiento que la métrica no ve",
        body:
          "CBO sigue diciendo 1 y se ve excelente. Pero Carla ahora depende del STRING \"crear-venta\" y " +
          "del formato del mapa. Cambiar el nombre de la acción rompe el sistema, y ninguna métrica " +
          "de clases lo detecta."
      },
      graph: {
        viewBox: "0 0 100 70",
        nodes: [
          { id: "ana",    label: "Ana",    role: "Cliente",        x: 20, y: 12, kind: "actor" },
          { id: "carla",  label: "Carla",  role: "Pedido",         x: 20, y: 40, kind: "class" },
          { id: "bruno",  label: "Bruno",  role: "Map + String",   x: 52, y: 40, kind: "warning" },
          { id: "diego",  label: "Diego",  role: "Inventario",     x: 80, y: 10, kind: "class", muted: true },
          { id: "elena",  label: "Elena",  role: "Facturación",    x: 80, y: 40, kind: "class", muted: true },
          { id: "gloria", label: "Gloria", role: "Notificaciones", x: 80, y: 62, kind: "class", muted: true }
        ],
        edges: [
          { id: "e_ana_carla",   from: "ana",   to: "carla",  label: "pide vender" },
          { id: "e_carla_bruno", from: "carla", to: "bruno",  label: "\"crear-venta\"", warning: true },
          { id: "e_bruno_diego", from: "bruno", to: "diego",  label: "", muted: true },
          { id: "e_bruno_elena", from: "bruno", to: "elena",  label: "", muted: true },
          { id: "e_bruno_gloria",from: "bruno", to: "gloria", label: "", muted: true }
        ]
      },
      beats: [
        {
          say: "CBO(Pedido) = 1. La métrica aplaude. La realidad no.",
          active: ["carla"], counted: ["bruno"], edges: ["e_carla_bruno"],
          hud: { label: "CBO(Pedido)", value: 1, warn: "métrica ciega" },
          note: "Baja el tono. Este es el momento incómodo de la charla y por eso se recuerda."
        },
        {
          say: "Buenas métricas no te ahorran pensar. Te dan mejores preguntas.",
          active: ["bruno"], edges: ["e_carla_bruno"],
          hud: { label: "CBO(Pedido)", value: 1, warn: "no cuenta el String" },
          concept: {
            term: "Alcance de CBO",
            body:
              "CBO cuenta tipos, no valores. Cualquier acoplamiento mediado por cadenas, números " +
              "mágicos, JSON, esquemas de base de datos o configuración queda fuera de su alcance. " +
              "Esto no invalida la métrica: delimita su dominio."
          },
          note: "Esta es la diapositiva de mayor nivel de la exposición. No la corras."
        }
      ]
    },

    /* ---------------------------------------------------------- 9 */
    {
      id: "codigo",
      kind: "code",
      chapter: "Capítulo 7",
      title: "El mismo cuento, en Java",
      narration: "Todo esto en código. Misma empresa, dos formas de escribirla.",
      code: {
        language: "java",
        before: {
          label: "Antes · CBO(Pedido) = 3 · RFC = 5",
          source:
`public class Pedido {
    private final Inventario     inventario     = new Inventario();
    private final Facturacion    facturacion    = new Facturacion();
    private final Notificaciones notificaciones = new Notificaciones();

    public void vender(Cliente c, Producto p) {   // metodo propio: 1
        if (inventario.verificarStock(p)) {       // Diego: 2
            inventario.reservar(p);               // Diego: 3
            facturacion.facturar(c, p);           // Elena: 4
            notificaciones.avisar(c);             // Gloria: 5
        }
    }
}`
        },
        after: {
          label: "Después · CBO(Pedido) = 1 · RFC = 1 nivel 2 / clausura 6",
          source:
`public class Pedido {
    private final Mostrador mostrador;        // abstraccion, no 3 clases concretas

    public Pedido(Mostrador mostrador) {      // inyeccion de dependencia
        this.mostrador = mostrador;
    }

    public void vender(Cliente c, Producto p) {
        mostrador.despachar(c, p);            // una sola colaboracion directa
    }
}

interface Mostrador {                          // el contrato es ahora el punto de acoplamiento
    void despachar(Cliente c, Producto p);
}`
        }
      },
      beats: [
        {
          say: "Antes: Pedido fabrica sus tres dependencias. Está soldado a tres clases concretas.",
          note: "Subraya 'new' tres veces en la pizarra. Cada 'new' es una arista de acoplamiento."
        },
        {
          say: "Después: Pedido recibe el contrato desde fuera. Depende de una abstracción, no de la realidad.",
          note:
            "Conecta con el principio de inversión de dependencias. Ya no necesitas recordar CBO: " +
            "lo ves."
        }
      ]
    },

    /* ---------------------------------------------------------- 10 */
    {
      id: "encaje",
      kind: "table",
      chapter: "Contexto",
      title: "Dónde encajan CBO y RFC",
      narration:
        "Ni CBO ni RFC son islas: son 2 de las 6 métricas de clase de Chidamber y Kemerer, y conviven con las métricas tradicionales.",
      table: {
        headers: ["Familia", "Métricas", "Qué mide"],
        rows: [
          ["Tradicionales (código)", "LOC", "Tamaño en líneas de código"],
          ["Tradicionales (código)", "Halstead", "Volumen, dificultad y esfuerzo a partir de operadores y operandos"],
          ["Tradicionales (código)", "McCabe", "Complejidad ciclomática (caminos independientes del grafo de control)"],
          ["Tradicionales (diseño)", "Fan-in / Fan-out", "Acoplamiento entre módulos. Es análisis estructural, no código fuente"],
          ["OO — Suite CK", "WMC", "Complejidad ponderada: suma de complejidades de los métodos"],
          ["OO — Suite CK", "DIT", "Profundidad del árbol de herencia"],
          ["OO — Suite CK", "NOC", "Número de subclases inmediatas"],
          ["OO — Suite CK", "CBO", "Acoplamiento entre objetos — el de esta charla"],
          ["OO — Suite CK", "RFC", "Respuesta de la clase — el de esta charla"],
          ["OO — Suite CK", "LCOM", "Falta de cohesión entre métodos"],
          ["Dinámicas (ejecución)", "Tiempo de respuesta, tasa de fallos", "Rendimiento y fiabilidad en producción"]
        ],
        warnings: [
          "Atributos internos (complejidad, acoplamiento) se usan para PREDECIR atributos externos (mantenibilidad, fiabilidad). No son lo mismo: son predictor y predicho.",
          "En métricas de ejecución, la tasa de fallos se escribe ROCOF (Rate of Occurrence of Failures). Verifica el acrónimo en el material del curso antes de ponerlo: RDCOF no es estándar."
        ]
      },
      beats: [
        {
          say: "Interno predice externo. CBO y RFC no son el objetivo: son el termómetro.",
          note:
            "Si te preguntan por GQM: Meta (conceptual) → Pregunta (operacional) → Métrica (cuantitativo). " +
            "Basili, Caldiera y Rombach, 1994."
        }
      ]
    },

    /* ---------------------------------------------------------- 11 */
    {
      id: "quiz",
      kind: "quiz",
      chapter: "Comprobación",
      title: "Cuenten ustedes",
      narration: "Dos preguntas rápidas. Si fallan la primera, el resto de la charla no sirvió.",
      quiz: {
        questions: [
          {
            q:
              "Carla tiene 1 método (vender) que llama a 4 métodos de Diego y a 1 de Elena, y ninguno " +
              "de esos métodos llama a su vez a otros. Con la clausura (contando el método propio), " +
              "¿cuánto valen CBO y RFC de Carla?",
            options: [
              "CBO = 2 · RFC = 5",
              "CBO = 2 · RFC = 6",
              "CBO = 6 · RFC = 2",
              "CBO = 7 · RFC = 6"
            ],
            correct: 1,
            why:
              "CBO cuenta CLASES: Diego y Elena son dos, no seis. RFC cuenta MÉTODOS de la clausura: " +
              "1 propio + 4 de Diego + 1 de Elena = 6. El mismo grafo, dos números que no se parecen."
          },
          {
            q: "Añades una fachada. El acoplamiento directo de Carla baja de 3 clases a 1. ¿Qué pasa con RFC (clausura)?",
            options: [
              "Siempre baja, son proporcionales",
              "Siempre sube",
              "Puede subir, bajar o no cambiar: depende del conteo y de la clausura",
              "RFC no se ve afectado por el acoplamiento"
            ],
            correct: 2,
            why:
              "La fachada añade métodos a la clausura y no elimina los colaboradores que están detrás. " +
              "Por eso las métricas pueden contradecirse, y por eso hay que declarar la convención."
          }
        ]
      },
      beats: []
    },

    /* ---------------------------------------------------------- 12 */
    {
      id: "cierre",
      kind: "closing",
      chapter: "Cierre",
      title: "Cuatro cosas para llevarse",
      narration: "",
      points: [
        "CBO cuenta clases salientes. RFC cuenta métodos ejecutables, transitivamente.",
        "Pueden contradecirse. Un refactor que baja el acoplamiento puede subir la respuesta, y ambas lecturas son correctas.",
        "Una métrica sin definición operativa no es evidencia: es decoración. Declara la convención antes del número.",
        "Los atributos internos (CBO, RFC, McCabe) predicen los externos (mantenibilidad, fiabilidad). No los miden."
      ],
      sources: [
        "Chidamber, S. R. & Kemerer, C. F. (1994). A Metrics Suite for Object Oriented Design. IEEE Transactions on Software Engineering, 20(6), 476-493.",
        "McCabe, T. J. (1976). A Complexity Measure. IEEE TSE, SE-2(4), 308-320.",
        "Basili, V., Caldiera, G. & Rombach, H. D. (1994). The Goal Question Metric Approach. Encyclopedia of Software Engineering."
      ],
      beats: [
        {
          say: "La historia se acaba. Las métricas se quedan.",
          note: "Agradece, deja las fuentes en pantalla y abre preguntas."
        }
      ]
    }
  ]
};

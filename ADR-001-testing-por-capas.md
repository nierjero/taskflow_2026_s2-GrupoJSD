# ADR-001: Arquitectura de testing por capas

## Estado

Aceptado.

## Contexto

TaskFlow contiene una API implementada con Express y una interfaz web implementada con React y TypeScript. Utiliza SQLite para persistencia y autentica a los usuarios mediante JWT.

La suite necesita verificar tres tipos de comportamiento:

- Lógica y validaciones expuestas por los endpoints.
- Reglas de integración entre backend, persistencia y autenticación.
- Flujos visibles desde el navegador y el funcionamiento de la interfaz.

Probar toda la aplicación exclusivamente desde la interfaz sería lento y dificultaría localizar el origen de un defecto. Por eso, las pruebas deben distribuirse por capas y cada caso debe usar el nivel que mejor se ajuste al comportamiento que verifica.

## Arquitectura reconocida

### Pruebas de API e integración

Jest y Supertest verifican los endpoints de autenticación, proyectos, tareas y comentarios. La configuración corresponde a `server/jest.config.js`, mientras que los tests se encuentran en `server/tests/*.test.ts`.

Un ejemplo de reutilización es `server/tests/helpers.ts`, que encapsula operaciones comunes como registrar usuarios y crear proyectos o tareas.

Este nivel conviene para:

- Validar status codes, cuerpos de respuesta y errores.
- Probar autorización y validaciones.
- Ejecutar muchos casos sin abrir un navegador.
- Detectar rápidamente defectos del backend.

No conviene realizar aquí verificaciones visuales o recorridos completos de navegación. Tampoco debe usarse para reemplazar todas las pruebas de interfaz.

### Pruebas E2E con Playwright

Playwright prueba flujos completos desde el navegador en `server/tests/e2e/`.

Ejemplos actuales:

- Login exitoso y fallido.
- Creación de proyectos.
- Creación de tareas.
- Edición de tareas.
- Agregado de etiquetas.
- Agregado de comentarios.
- Auditorías de accesibilidad con Axe.

Las configuraciones existentes se encuentran en:

- `playwright.config.ts`
- `server/playwright.config.ts`

En la configuración que se usa desde la raíz, `testDir` apunta a `server/tests/e2e`, se usa Chromium headless y se conservan evidencias ante fallos.

Playwright conviene para verificar que varias partes del sistema coordinan correctamente desde la perspectiva del usuario. El flujo E2E debe probar comportamiento visible y navegación; no conviene usarlo para repetir todas las combinaciones de validación que pertenecen a la API.

### Fixtures y preparación de datos

Los fixtures de `server/tests/e2e/fixtures.ts` crean usuarios, proyectos y tareas mediante el API. Esta estrategia permite:

- Ejecutar pruebas independientemente.
- Mantener preparaciones reutilizables.
- Evitar recorrer formularios innecesarios para crear datos que no son parte del flujo que se quiere probar.
- Reducir el tiempo y la fragilidad de los tests.

Conviene cuando el dato preparado no es el comportamiento bajo prueba. Por ejemplo, preparar una tarea por API es adecuado antes de probar su edición o detalle.

No conviene usar este mecanismo para probar la creación de tareas si el objetivo es verificar el formulario desde la interfaz. En ese caso, la creación debe realizarse desde la UI.

### Page Objects

Los Page Objects encapsulan los localizadores y las operaciones de una página.

En este proyecto se crean, por ejemplo:

- `e2e/pages/LoginPage.ts`
- `e2e/pages/BoardPage.ts`
- `e2e/pages/TaskDetailPage.ts`

Los Page Objects convienen cuando:

- Varias pruebas usan la misma página.
- Una página tiene muchos controles y selectores.
- Cambiar la interfaz podría afectar varias pruebas.
- Se quiere evitar repetir secuencias de interacción.

No conviene crear un Page Object por cada página si solo se usa una vez y si añadirlo hace menos legible el test. Tampoco deben contener reglas de negocio ni reemplazar las aserciones del test.

### Component Objects

Los Component Objects representan componentes visuales reutilizables.

En TaskFlow, `e2e/components/TaskCard.ts` encapsula la tarjeta usada en el tablero: localizarla por título, abrirla y consultar información visible.

Este patrón conviene cuando:

- El mismo componente aparece en varias pruebas.
- Sus localizadores pueden cambiar y afectan varias acciones.
- El componente tiene comportamiento propio, como abrir el detalle o cambiar estado.

No conviene crear Component Objects demasiado generales ni ocultar detrás de ellos los resultados que forman parte del comportamiento bajo prueba.

### Selectores `data-testid`

La aplicación usa atributos `data-testid` en la interfaz y los tests los utilizan para localizar controles.

Convienen porque desacoplan las pruebas de clases CSS, estructura visual y textos que podrían cambiar por razones de diseño o internacionalización.

No deben reemplazar reglas de accesibilidad ni verificaciones de comportamiento visibles. Tampoco conviene usarlos para ubicar elementos que ya tienen roles semánticos o nombres accesibles más apropiados.

## Decisión

Se mantiene la arquitectura actual:

- Jest + Supertest para API e integración.
- Playwright para recorridos E2E.
- Fixtures Playwright y datos preparados mediante API.
- `data-testid` como mecanismo principal de localización.
- Page Objects para páginas reutilizadas en varios flujos.
- Component Objects para componentes reutilizados, comenzando por `TaskCard`.

No se reemplaza el stack ni se obliga a usar E2E para todo el backend.

## Alternativas consideradas

### Probar todo exclusivamente desde la interfaz

Se descarta para la suite general.

Costos:

- Es más lenta.
- Oculta dónde ocurrió un defecto de backend.
- Repite validaciones de API a través de formularios.
- Hace crecer el tiempo total de ejecución.
- Es menos eficiente para cubrir combinaciones negativas.

Puede seguir usándose para validar el recorrido visible que lleva a esa operación.

### Mantener todos los tests en una estructura plana

Se descarta como arquitectura principal.

Costos:

- Repite localizadores y preparaciones.
- Dificulta localizar responsabilidades.
- Hace más costosos los cambios de UI.
- Reduce la legibilidad de los recorridos.

Puede existir un helper pequeño para una operación muy específica, pero no debe ser el único mecanismo de reutilización.

### Preparar todos los datos navegando por la interfaz

Se descarta para datos que no forman parte del flujo bajo prueba.

Costos:

- Duplica recorridos.
- Introduce dependencias entre pruebas.
- Hace fallar más casos por efectos fuera del objetivo.
- Consume más tiempo.

### Usar solo Page Objects

No reemplaza a los Component Objects ni a los fixtures.

Costos:

- Duplicaría abstracciones dentro de una página.
- Los componentes repetidos seguirían teniendo localizadores dispersos.
- Ciertos elementos compartidos podrían cambiar en muchas páginas.

### Usar solo Component Objects

No sería suficiente para encerrar las operaciones propias de una página completa.

## Consecuencias positivas

- Las pruebas quedan distribuidas según su responsabilidad.
- Los tests de API detectan defectos más rápido.
- Los tests E2E siguen cubriendo integración con la interfaz.
- Los fixtures reducen navegación innecesaria.
- Los Page Objects y Component Objects reducen la repetición de selectores.
- El mantenimiento queda localizado cuando cambia una página o un componente.

## Costos y riesgos

- El equipo debe respetar la separación entre API, UI y preparación.
- Los Page Objects pueden convertirse en wrappers innecesarios si contienen poca lógica reutilizable.
- Los Component Objects pueden ocultar información si encapsulan demasiado.
- Los fixtures por API no prueban los formularios usados para crear esos datos.
- Mantener dos configuraciones de Playwright puede generar ambigüedad sobre cuál ejecutar.
- La suite debe conservar aserciones visibles en los specs en vez de mover toda la intención a las clases auxiliares.

## Criterios de revisión

Una nueva abstracción debe incorporarse cuando:

- Reduce repetición real.
- Hace más clara la intención de una prueba.
- Limita el alcance de los cambios ante cambios de UI.
- Tiene al menos dos usos o una responsabilidad claramente reutilizable.

Una abstracción debe revisarse o eliminarse cuando:

- Solo envuelve un único método.
- Oculta datos que la prueba necesita verificar.
- Contiene aserciones arbitrarias o reglas de negocio.
- Hace que el flujo sea menos legible.

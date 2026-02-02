[**spec.md**](http://spec.md) **\- Especificación Funcional Completa**

**Anclora Cognitive Solutions Platform**

**Versión:** 1.0.0  
**Tipo de documento:** Functional Requirements Specification  
**Audiencia:** Developers, QA, Product Manager  
**Estado:** Aprobado para desarrollo  
**Fecha:** 30 de enero de 2026

---

**1\. OVERVIEW**

**1.1 Propósito del Sistema**

Plataforma web SaaS que permite a consultorías de IA:

* Generar presupuestos personalizados con IA local (Ollama \+ Llama 3.2 3B)

* Gestionar proyectos mediante Kanban visual con drag & drop

* Ofrecer transparencia total a clientes vía portal dedicado

* Automatizar facturación profesional con generación de PDFs

* Recibir alertas inteligentes sobre estados críticos del proyecto

**1.2 Usuarios del Sistema**

| Rol | Descripción | Permisos |
| :---- | :---- | :---- |
| Admin | Consultor de IA (Anclora team) | CRUD completo en todos los módulos |
| Cliente | Cliente de consultoría | Read-only en proyectos propios vía portal |

Table 1: Roles de usuario del sistema

**1.3 Principios de Diseño**

1. **Mobile-first:** Diseño responsive desde 320px

2. **Offline-ready:** PWA con service workers (fase futura)

3. **Real-time updates:** Supabase Realtime para sincronización Kanban

4. **Accessibility:** WCAG 2.1 AA compliance obligatorio

5. **Performance:** Lighthouse score \>90 en todas las categorías

---

**2\. MÓDULOS FUNCIONALES**

**2.1 AUTENTICACIÓN Y AUTORIZACIÓN**

**2.1.1 Login Admin**

**Endpoint:** Supabase Auth  
**Método:** Email \+ Password

**Flujo:**

1. Usuario ingresa email/password en formulario

2. Supabase valida credenciales contra tabla auth.users

3. Si válido → Genera JWT token \+ guarda en session storage

4. Redirect a /dashboard

5. Si inválido → Mensaje de error "Credenciales incorrectas"

**Validaciones:**

1. Email formato válido (regex estándar)

2. Password mínimo 8 caracteres

3. Rate limiting: 5 intentos por minuto por IP

**Seguridad:**

1. Password hasheado con bcrypt (Supabase nativo)

2. Session timeout: 7 días

3. Logout destroye token y limpia session storage

4. HTTPS obligatorio (Vercel automático)

**2.1.2 Login Cliente (Portal)**

**Endpoint:** Supabase Auth (Magic Link)  
**Método:** Passwordless

**Flujo:**

1. Cliente ingresa email en formulario simplificado

2. Sistema verifica que email existe en tabla clients

3. Si existe → Envía magic link a email

4. Cliente hace click en link → Auto-login

5. Redirect a /portal/client/:clientId

6. Si no existe → Mensaje "Email no registrado"

**Validaciones:**

1. Email debe existir en tabla clients

2. Magic link expira en 1 hora

3. Un solo uso por link (token invalidado tras uso)

---

**2.2 GESTIÓN DE CLIENTES**

**2.2.1 Crear Cliente**

**UI:** Modal form  
**Trigger:** Botón "+ Nuevo Cliente" en página /clients

**Campos obligatorios:**

1. company\_name (string, max 100 chars)

2. email (string, unique, formato email válido)

3. preferred\_language (enum: 'es' | 'en' | 'ca')

**Campos opcionales:**

1. contact\_person (string, max 100 chars)

2. phone (string, formato internacional E.164)

3. address (text, max 500 chars)

4. nif\_cif (string, validación formato español)

5. notes (text, notas internas no visibles para cliente)

**Validaciones:**

1. Email único en sistema (constraint DB)

2. NIF/CIF formato válido si se proporciona (regex español)

3. Phone formato E.164 (ej: \+34612345678)

**Acciones:**

1. Validar formulario client-side

2. INSERT en tabla clients

3. Auto-generar client\_id (UUID v4)

4. Timestamp created\_at \= NOW()

5. Opcional: Enviar email de bienvenida con link al portal

6. Cerrar modal y refrescar lista de clientes

**2.2.2 Listar Clientes**

**UI:** Tabla con paginación  
**Ruta:** /clients

**Columnas:**

| Columna | Descripción |
| :---- | :---- |
| Logo | Avatar con iniciales de company\_name |
| Nombre empresa | company\_name (clickable → detalle) |
| Email | email (clickable → enviar email) |
| Idioma | preferred\_language (badge ES/EN/CA) |
| \# Proyectos activos | Count de proyectos no archivados |
| Última actividad | updated\_at formateado |
| Acciones | Botones: Editar, Eliminar, Ver proyectos |

Table 2: Estructura de tabla de clientes

**Filtros:**

1. Búsqueda por nombre/email (search input con debounce 300ms)

2. Filtro por idioma (dropdown: Todos/ES/EN/CA)

3. Ordenar por: Fecha creación, Última actividad, Nombre A-Z

**Paginación:** 20 items por página, botones Anterior/Siguiente

**2.2.3 Editar Cliente**

**UI:** Mismo modal form que Crear  
**Trigger:** Botón "Editar" en fila de tabla

**Restricciones:**

1. No editable: client\_id, created\_at

2. Auto-actualizar: updated\_at \= NOW()

**Auditoría:**

1. Registrar cambio en tabla audit\_logs

2. Campos: table\_name='clients', record\_id=client\_id, action='UPDATE', old\_data, new\_data, changed\_by

**2.2.4 Eliminar Cliente**

**UI:** Confirmation dialog  
**Trigger:** Botón "Eliminar" en fila de tabla

**Validaciones:**

1. Si tiene proyectos activos (status \!= 'cancelled' y archived \= false) → Prohibir eliminación, mostrar mensaje "Cliente tiene proyectos activos. Archívelos primero."

2. Si no tiene proyectos → Permitir hard delete

3. Alternativa soft delete: Añadir campo deleted\_at

**Cascade (si hard delete):**

1. DELETE proyectos asociados (CASCADE en FK)

2. DELETE presupuestos asociados (CASCADE)

3. DELETE facturas asociadas (CASCADE)

4. MOVE archivos Storage a carpeta "deleted" (manual via Edge Function)

---

**2.3 GESTIÓN DE PROYECTOS**

**2.3.1 Crear Proyecto**

**UI:** Form full-page  
**Ruta:** /projects/new

**Campos obligatorios:**

1. project\_name (string, max 150 chars)

2. client\_id (foreign key, dropdown de clientes activos)

3. status (enum, default: 'backlog')

**Campos opcionales:**

1. description (rich text editor, max 2000 chars)

2. budget (decimal(10,2), currency EUR)

3. deadline (date picker)

4. priority (enum: 'low' | 'medium' | 'high' | 'urgent', default: 'medium')

**Estados disponibles:**

1. backlog \- Proyecto en cola, no visible para cliente

2. proposal \- Presupuesto enviado, esperando aprobación

3. approved \- Cliente aprobó, listo para iniciar

4. in\_progress \- Desarrollo activo

5. testing \- Fase QA/Testing

6. completed \- Proyecto finalizado y entregado

7. cancelled \- Proyecto cancelado por cualquier motivo

**Acciones:**

1. Validar formulario

2. INSERT en tabla projects

3. Auto-generar project\_id (UUID)

4. created\_at \= NOW()

5. Crear tarjeta en Kanban en columna correspondiente a status

6. Si status \!= 'backlog' → Notificar a cliente (email)

7. Redirect a /kanban

**2.3.2 Kanban Board**

**Tecnología:** @hello-pangea/dnd (fork mantenido de react-beautiful-dnd)  
**Ruta:** /kanban  
**Layout:** 7 columnas horizontales (scroll horizontal en mobile)

**Columnas:**

1. Backlog

2. Propuesta

3. Aprobado

4. En Progreso

5. Testing

6. Completado

7. Cancelado

**Interacciones:**

1. Usuario arrastra tarjeta de proyecto

2. Al soltar en nueva columna → UPDATE projects SET status \= nuevo\_status, updated\_at \= NOW()

3. Trigger Supabase Realtime broadcast a todos los clientes suscritos

4. Todos los usuarios conectados ven cambio instantáneamente (\<1s)

**Estructura de Tarjeta:**

1. Header: Badge de prioridad (color-coded) \+ project\_name

2. Body:

   1. Cliente: company\_name

   2. Deadline: formateado (ej: "15 Feb 2026", rojo si \<7 días)

   3. Budget: "Gastado / Total" (ej: "15.000€ / 20.000€")

   4. Progress bar visual

3. Footer: Iconos de alerta (si hay alertas activas) \+ botón "Ver detalles"

**Click en tarjeta:**

1. Abrir modal full-screen con:

   1. Detalles completos del proyecto (todos los campos)

   2. Timeline de cambios (audit\_logs filtrado por project\_id)

   3. Tabs: Presupuestos, Facturas, Archivos

   4. Botones de acción: Editar, Archivar, Generar presupuesto

**2.3.3 Editar Proyecto**

**UI:** Modal form (similar a Crear)  
**Trigger:** Botón "Editar" en modal de detalles

**Campos editables:** Todos excepto project\_id, client\_id, created\_at

**Validaciones especiales:**

1. Si cambio de status → Validar transiciones permitidas (matriz de transiciones)

2. Si cambio de deadline → Opcional: Notificar cliente automáticamente

3. Si cambio de budget → Campo obligatorio: budget\_change\_reason (text)

**Matriz de transiciones permitidas:**

| Desde | Hacia (permitido) |
| :---- | :---- |
| backlog | proposal, cancelled |
| proposal | approved, cancelled |
| approved | in\_progress, cancelled |
| in\_progress | testing, cancelled |
| testing | in\_progress, completed, cancelled |
| completed | \- (estado final) |
| cancelled | backlog (re-abrir) |

Table 3: Transiciones de estado permitidas

**2.3.4 Archivar/Eliminar Proyecto**

**Archivar:**

1. Soft delete: UPDATE projects SET archived \= true

2. No visible en Kanban (filtro WHERE archived \= false)

3. Accesible desde sección "Proyectos archivados" (/projects/archived)

4. Reversible: botón "Desarchivar"

**Eliminar (hard delete):**

1. Requiere confirmación modal

2. Usuario debe escribir nombre del proyecto para confirmar

3. DELETE CASCADE: presupuestos, facturas, archivos

4. Registrar en audit\_logs con action='DELETE'

---

**2.4 GENERACIÓN DE PRESUPUESTOS CON IA**

**2.4.1 Formulario de Entrada**

**UI:** Wizard multi-step (3 pasos)  
**Ruta:** /quotes/new  
**Trigger:** Botón "Generar Presupuesto" en proyecto

**Paso 1: Información Básica**

1. Seleccionar proyecto existente (dropdown con search)

2. O crear nuevo proyecto inline (collapse form)

3. Idioma del presupuesto: Radio buttons (Español, English, Català)

**Paso 2: Servicios Solicitados**

Checkboxes múltiples con estimaciones pre-cargadas:

| Servicio | Estimación (horas) |
| :---- | :---- |
| Consultoría inicial | 20-40h |
| Desarrollo MVP | 80-120h |
| Fine-tuning de modelos | 30-50h |
| Implementación RAG | 40-60h |
| Agentes autónomos | 60-100h |
| Integración APIs | 20-40h |
| Mantenimiento mensual | 10h/mes |
| Otro (campo libre) | Input manual |

Table 4: Servicios disponibles con estimaciones

Por cada servicio seleccionado:

1. Campo description\_detail (textarea, opcional, max 500 chars)

2. Campo custom\_hours (number input, sobrescribe estimado)

**Paso 3: Tono y Configuración**

Dropdown tone con opciones:

1. **Técnico:** "Para CTOs y equipos técnicos. Incluye arquitecturas, KPIs, stack."

2. **Sencillo:** "Para audiencias no técnicas. Lenguaje claro, sin jerga."

3. **Formal:** "Corporativo. Referencias a estudios, estructura tradicional."

4. **Profesional:** "Balance técnico-comercial. *Default recomendado*."

5. **Consultivo:** "Énfasis en ROI, business case, impacto medible."

6. **Casual:** "Cercano y directo. Para startups."

Slider technical\_depth (1-10):

1. 1-3: Muy high-level, ejecutivo

2. 4-7: Balance (default: 5\)

3. 8-10: Deep-dive técnico

Checkboxes:

1. include\_timeline (bool, default: true)

2. include\_payment\_terms (bool, default: true)

Campo libre:

1. custom\_instructions (textarea, opcional, max 300 chars): "Instrucciones adicionales para la IA"

**2.4.2 Llamada a IA Local**

**Endpoint:** POST [http://localhost:8000/api/generate-quote](http://localhost:8000/api/generate-quote) (FastAPI)  
**Modelo:** Llama 3.2 3B via Ollama  
**Timeout:** 30 segundos  
**Max tokens:** 2048

**Payload enviado:**

{  
"client\_name": "Empresa Cliente SA",  
"project\_name": "Implementación Sistema RAG",  
"project\_description": "Sistema RAG para documentación interna...",  
"services": \[  
{  
"name": "Implementación RAG",  
"custom\_hours": 50,  
"description\_detail": "Pipeline completo con embeddings"  
}  
\],  
"language": "es",  
"tone": "técnico",  
"technical\_depth": 8,  
"custom\_instructions": "Enfatizar escalabilidad"  
}

**System Prompt Template:**

Eres un consultor experto en IA que genera presupuestos profesionales.

CONTEXTO:

* Cliente: {client\_name}

* Proyecto: {project\_name}

* Descripción: {project\_description}

* Idioma: {language}

* Tono: {tone}

* Nivel técnico: {technical\_depth}/10

SERVICIOS SOLICITADOS:  
{services\_list}

INSTRUCCIONES:

1. Genera un presupuesto estructurado en JSON válido con esta forma EXACTA:  
   {  
   "introduction": "string (2-3 párrafos introductorios adaptados al tono)",  
   "services": \[  
   {  
   "name": "string",  
   "description": "string (detallada según technical\_depth)",  
   "hours": number,  
   "hourly\_rate": 85,  
   "amount": number (hours \* 85\)  
   }  
   \],  
   "timeline": "string (estimación temporal realista)",  
   "payment\_terms": "string (condiciones de pago profesionales)",  
   "conclusion": "string (call-to-action persuasivo)"  
   }

2. ADAPTAR AL TONO "{tone}":

   * Técnico: Arquitecturas, KPIs, stack (ej: "pipeline RAG con embeddings BERT")

   * Sencillo: Sin jerga, metáforas (ej: "sistema que entiende documentos")

   * Formal: Referencias, lenguaje corporativo

   * Profesional: Balance técnico-comercial

   * Consultivo: ROI, business case, impacto medible

   * Casual: Cercano, primera persona

3. NIVEL TÉCNICO {technical\_depth}/10:

   * 1-3: Solo resultados de negocio

   * 4-7: Balance conceptos técnicos explicados

   * 8-10: Deep-dive implementación, arquitecturas

4. REGLAS ESTRICTAS:

   * Tarifa fija: 85€/hora

   * NO incluir IVA (se calcula después)

   * Timeline realista (no prometer imposibles)

   * Payment terms default: "50% inicio, 50% entrega"

5. OUTPUT:

   * SOLO JSON válido

   * SIN texto fuera del JSON

   * NO inventar servicios no solicitados

Genera el presupuesto en {language}:

**Manejo de Respuesta:**

1. Parsear respuesta de FastAPI

2. Extraer JSON de texto (puede venir envuelto en markdown)

3. Validar estructura obligatoria (keys requeridas)

4. Si parse falla → Retry con prompt simplificado (1 intento)

5. Si 2º fallo → Fallback a template predefinido

6. Mostrar vista previa

**2.4.3 Vista Previa y Edición**

**UI:** Split-view (50/50)  
**Layout:** Editor (izquierda) \+ Preview (derecha)

**Panel Izquierdo (Editable):**

1. Campo introduction (textarea enriquecido, max 1000 chars)

2. Tabla editable de servicios:

   1. Columnas: Servicio | Descripción | Horas | Tarifa/h | Importe

   2. Inputs editables en cada celda

   3. Botones: \[+ Añadir servicio\] \[❌ Eliminar fila\]

3. Campo timeline (textarea, max 500 chars)

4. Campo payment\_terms (textarea, max 500 chars)

5. Campo conclusion (textarea, max 500 chars)

6. Botón \[🔄 Regenerar con IA\] (vuelve al wizard)

**Panel Derecho (Preview):**

1. Render HTML profesional del presupuesto

2. Estilo: Similar al PDF final (logo, tipografías, colores brand)

3. Secciones colapsables (accordions)

4. Auto-actualiza en tiempo real al editar

**Cálculos Automáticos:**

// Recalcular al cambiar horas o tarifa  
services.forEach(service \=\> {  
service.amount \= service.hours \* service.hourly\_rate  
})

const subtotal \= services.reduce((sum, s) \=\> sum \+ s.amount, 0\)  
const iva \= subtotal \* 0.21 // España  
const total \= subtotal \+ iva

**2.4.4 Guardar Presupuesto**

**Tabla:** quotes  
**Campos almacenados:**

1. quote\_id (UUID, PK)

2. project\_id (UUID, FK)

3. version (integer, auto-increment por proyecto)

4. status (enum: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected')

5. language (enum: 'es' | 'en' | 'ca')

6. tone (enum)

7. content\_json (JSONB, contiene JSON completo generado)

8. subtotal (decimal(10,2))

9. iva (decimal(10,2))

10. total (decimal(10,2))

11. created\_at (timestamptz)

12. sent\_at (timestamptz, nullable)

13. viewed\_at (timestamptz, nullable)

14. pdf\_url (text, nullable)

**Lógica de Versionado:**

\-- Trigger automático al INSERT  
SELECT COALESCE(MAX(version), 0\) \+ 1 AS new\_version  
FROM quotes  
WHERE project\_id \= {project\_id}

**Estado inicial:** 'draft'

**Botones disponibles:**

1. → INSERT con status='draft'

1. → Genera PDF \+ sube a Storage

1. → Cambia status='sent' \+ envía email

**2.4.5 Exportar a PDF**

**Librería:** @react-pdf/renderer  
**Trigger:** Botón \[📄 Generar PDF\]  
**Proceso:**

1. Tomar datos de content\_json

2. Renderizar componente PDF con @react-pdf/renderer

3. Generar blob

4. Subir a Supabase Storage bucket: quotes-pdfs

5. Path: {client\_id}/{project\_id}/quote-v{version}.pdf

6. Permisos: Public read con URL firmada

7. UPDATE quotes SET pdf\_url \= public\_url

**Estructura del PDF:**

1. Header: Logo Anclora (top-left) \+ "PRESUPUESTO \#001-2026" (top-right)

2. Fecha emisión

3. Sección: DATOS EMPRESA

   1. Anclora Cognitive Solutions

   2. NIF: B12345678

   3. Dirección: C/ Ejemplo 123, Madrid

4. Sección: DATOS CLIENTE

   1. company\_name

   2. email

   3. NIF/CIF (si disponible)

5. Sección: INTRODUCCIÓN (texto de content\_json.introduction)

6. Sección: SERVICIOS (tabla con columnas: Servicio, Descripción, Horas, Tarifa, Importe)

7. Sección: TIMELINE (texto)

8. Sección: CONDICIONES DE PAGO (texto)

9. Sección: TOTALES (tabla)

   1. Subtotal: [XX.XXX](http://XX.XXX),XX €

   2. IVA (21%): [X.XXX](http://X.XXX),XX €

   3. TOTAL: [XX.XXX](http://XX.XXX),XX €

10. Sección: CONCLUSIÓN (texto)

11. Footer: Firma "Anclora Cognitive Solutions" \+ fecha

**Botones post-generación:**

1. → Modal con email cliente pre-rellenado \+ mensaje personalizable

1. → Abrir PDF en nueva pestaña

1. → Download directo del PDF

---

**2.5 PORTAL CLIENTE**

**2.5.1 Autenticación Cliente**

Ver sección 2.1.2 (Magic Link)

**2.5.2 Dashboard Cliente**

**URL:** /portal/client/:clientId  
**Permisos:** RLS → WHERE client\_id \= :clientId

**Layout:**

1. Header: Logo Anclora \+ Nombre del cliente (company\_name)

2. Resumen en cards:

   1. Total proyectos activos (count WHERE status IN ('proposal', 'approved', 'in\_progress', 'testing'))

   2. Total completados (count WHERE status \= 'completed')

   3. Total pendientes de aprobación (count WHERE status \= 'proposal')

3. Sección: "Proyectos en Curso" (lista de cards)

   1. Por cada proyecto: Nombre, Estado (badge), Progreso (bar), Deadline, Botones (Ver Kanban, Ver Presupuesto)

4. Sección: "Última Actividad" (timeline)

   1. Últimos 10 eventos de audit\_logs

   2. Formato: "30 Ene: Tarea X completada", "29 Ene: Proyecto A → Testing"

**Funcionalidades:**

1. Ver estado Kanban en read-only

2. Descargar presupuestos aceptados (lista con versiones)

3. Descargar facturas pagadas

4. Ver timeline detallado del proyecto

5. Futuro: Chat con consultor (fuera de MVP)

**2.5.3 Vista Kanban Read-Only**

**Igual que Kanban admin pero:**

1. Sin drag & drop (tarjetas no draggable)

2. Sin botones de edición

3. Hover muestra tooltip "Solo lectura"

4. Filtrado automático por client\_id (RLS)

---

**2.6 FACTURACIÓN**

**2.6.1 Generar Factura desde Proyecto**

**Trigger:** Botón \[💰 Generar Factura\] en proyecto  
**Condición:** status IN ('in\_progress', 'testing', 'completed')

**Formulario:**

1. Proyecto (pre-seleccionado, readonly)

2. Número factura (auto-generado: YYYY-MM-NNNN, readonly)

3. Fecha emisión (date, default: hoy)

4. Fecha vencimiento (date, default: \+30 días)

5. Conceptos (opciones):

   1. Opción 1: \[Importar desde presupuesto\] → Carga líneas de quote aprobado

   2. Opción 2: Líneas manuales (tabla editable: Descripción, Cantidad, Precio unitario)

6. Base imponible (auto-calculada, readonly)

7. IVA 21% (auto-calculado, readonly)

8. Total (auto-calculado, readonly)

9. Notas internas (textarea, opcional, no visible en PDF)

**Validaciones:**

1. Número factura único (constraint DB)

2. Fecha emisión ≤ hoy

3. Fecha vencimiento \> fecha emisión

4. Warning (no bloqueante): Si total factura \> presupuesto aprobado

**Tabla:** invoices  
**Campos:**

1. invoice\_id (UUID, PK)

2. project\_id (UUID, FK)

3. invoice\_number (string, unique)

4. issue\_date (date)

5. due\_date (date)

6. status (enum: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled')

7. line\_items (JSONB array)

8. subtotal (decimal(10,2))

9. iva (decimal(10,2))

10. total (decimal(10,2))

11. pdf\_url (text, nullable)

12. paid\_at (timestamptz, nullable)

13. created\_at (timestamptz)

**Función auto-generar número:**

CREATE FUNCTION generate\_invoice\_number() RETURNS trigger AS BEGINNEW.invoicenumber:=TOCHAR(NOW(),′YYYY−MM′)||′−′||LPAD((SELECTCOALESCE(MAX(CAST(SPLITPART(invoicenumber,′−′,3)ASINTEGER)),0)+1FROMinvoicesWHEREinvoicenumberLIKETOCHAR(NOW(),′YYYY−MM′)||′−)::TEXT,4,′0′);RETURNNEW;END;

 LANGUAGE plpgsql;

**2.6.2 PDF de Factura**

**Similar a PDF presupuesto pero con:**

1. Título: "FACTURA" (en lugar de "PRESUPUESTO")

2. Número de factura destacado (grande, top-right)

3. Fechas: Emisión y Vencimiento

4. Tabla de conceptos con columnas: Descripción, Cantidad, Precio unitario, Importe

5. Sección: "Forma de Pago"

   1. Transferencia bancaria

   2. IBAN: ES00 1234 5678 90 1234567890

   3. Concepto: "Factura YYYY-MM-NNNN"

6. Texto legal (pequeño, footer):

   1. "Retención IRPF: No aplica (exento)"

   2. "Factura válida sin firma según Ley 25/2013"

**Storage:** Bucket invoices-pdfs  
**Path:** {client\_id}/{project\_id}/invoice-{number}.pdf

**2.6.3 Enviar Factura**

**Botón:** \[📧 Enviar Factura\]  
**Acción:**

1. UPDATE invoices SET status \= 'sent', sent\_at \= NOW()

2. Obtener email de clients.email

3. Enviar email con PDF adjunto

4. Notificación toast: "Factura enviada correctamente"

**Email Template:**

Asunto: Factura {invoice\_number} \- Anclora Cognitive Solutions

Estimado/a {contact\_person},

Adjunto encontrarás la factura {invoice\_number} por importe de {total}€  
correspondiente al proyecto "{project\_name}".

Fecha de vencimiento: {due\_date}

Forma de pago:

* Transferencia bancaria a IBAN: ES00 1234 5678 90 1234567890

* Concepto: Factura {invoice\_number}

Puedes descargarla también desde tu portal de cliente: {portal\_url}

Gracias por confiar en Anclora Cognitive Solutions.

Saludos cordiales,  
Equipo Anclora

**2.6.4 Marcar como Pagada**

**Botón:** \[✅ Marcar como Pagada\]  
**Trigger:** Manual por admin tras verificar pago

**Acción:**

1. Confirmation dialog "¿Confirmar pago recibido?"

2. UPDATE invoices SET status \= 'paid', paid\_at \= NOW()

3. Opcional: Notificación interna (Slack, email admin)

4. Badge en tarjeta de proyecto cambia a "Pagado"

---

**2.7 SISTEMA DE ALERTAS**

**2.7.1 Tipos de Alertas**

| Tipo | Trigger | Prioridad | Notificación |
| :---- | :---- | :---- | :---- |
| deadline\_approaching | Deadline \<7 días | Medium | Email \+ UI badge |
| budget\_exceeded | Horas \>110% budget | High | Email \+ Banner |
| invoice\_overdue | due\_date \+ 7 días | High | Email diario |
| project\_stale | Sin cambios 14 días | Low | Email semanal |
| client\_inactive | Sin proyectos 90 días | Low | Email mensual |

Table 5: Tipos de alertas del sistema

**2.7.2 Tabla de Alertas**

**Tabla:** alerts

1. alert\_id (UUID, PK)

2. project\_id (UUID, FK, nullable)

3. client\_id (UUID, FK, nullable)

4. type (enum)

5. priority (enum: 'low' | 'medium' | 'high' | 'critical')

6. message (text)

7. is\_read (boolean, default: false)

8. created\_at (timestamptz)

9. resolved\_at (timestamptz, nullable)

10. CHECK: (project\_id IS NOT NULL) OR (client\_id IS NOT NULL)

**2.7.3 Generación de Alertas**

**Método:** Supabase Edge Functions (cron jobs)  
**Función:** generate-alerts  
**Frecuencia:** Diaria a las 09:00 CET

**Lógica SQL:**

\-- Deadline alerts  
INSERT INTO alerts (type, project\_id, message, priority)  
SELECT  
'deadline\_approaching',  
project\_id,  
'Proyecto ' || project\_name || ' vence en ' ||  
(deadline \- CURRENT\_DATE) || ' días',  
'medium'  
FROM projects  
WHERE deadline BETWEEN CURRENT\_DATE AND CURRENT\_DATE \+ 7  
AND status NOT IN ('completed', 'cancelled')  
AND NOT EXISTS (  
SELECT 1 FROM alerts  
WHERE project\_id \= projects.project\_id  
AND type \= 'deadline\_approaching'  
AND created\_at \> CURRENT\_DATE  
);

\-- Invoice overdue alerts  
INSERT INTO alerts (type, project\_id, message, priority)  
SELECT  
'invoice\_overdue',  
project\_id,  
'Factura ' || invoice\_number || ' vencida hace ' ||  
(CURRENT\_DATE \- due\_date) || ' días',  
'high'  
FROM invoices  
WHERE due\_date \< CURRENT\_DATE \- INTERVAL '7 days'  
AND status \= 'sent'  
AND NOT EXISTS (  
SELECT 1 FROM alerts  
WHERE type \= 'invoice\_overdue'  
AND message LIKE '%' || invoice\_number || '%'  
AND created\_at \> CURRENT\_DATE \- INTERVAL '1 day'  
);

\-- Project stale alerts  
INSERT INTO alerts (type, project\_id, message, priority)  
SELECT  
'project\_stale',  
project\_id,  
'Proyecto ' || project\_name || ' sin actividad 14 días',  
'low'  
FROM projects  
WHERE updated\_at \< CURRENT\_DATE \- INTERVAL '14 days'  
AND status IN ('in\_progress', 'testing')  
AND NOT EXISTS (  
SELECT 1 FROM alerts  
WHERE project\_id \= projects.project\_id  
AND type \= 'project\_stale'  
AND created\_at \> CURRENT\_DATE \- INTERVAL '7 days'  
);

**2.7.4 Panel de Alertas**

**UI:** Badge en navbar (top-right) \+ dropdown  
**Badge:** Muestra contador de alertas no leídas (is\_read \= false)

**Dropdown (click en badge):**

1. Lista de últimas 10 alertas no leídas

2. Por cada alerta:

   1. Icono según priority (🔴 critical, 🟠 high, 🟡 medium, 🔵 low)

   2. Mensaje resumido

   3. Tiempo relativo ("hace 2 horas")

   4. Click → Navega a recurso relacionado (proyecto/cliente)

3. Footer: \[Marcar todas como leídas\] \[Ver todas las alertas\]

**Página completa:** /alerts

1. Tabla con todas las alertas (paginación 50/página)

2. Filtros:

   1. Por tipo (dropdown multi-select)

   2. Por prioridad (dropdown multi-select)

   3. Por estado (Activas / Resueltas)

   4. Por fecha (date range picker)

3. Acciones bulk: \[Marcar como leídas\] \[Resolver\] \[Descartar\]

4. Exportar CSV

---

**3\. MODELO DE DATOS**

**3.1 Diagrama ER (Entity-Relationship)**

┌──────────────┐ ┌──────────────┐  
│ clients │◄─────────┤ projects │  
│──────────────│ 1 N │──────────────│  
│ client\_id PK │ │ project\_id PK│  
│ company\_name │ │ client\_id FK │  
│ email UNIQUE │ │ status │  
│ language │ │ budget │  
└──────────────┘ │ deadline │  
└──────────────┘  
△  
│ 1  
│  
┌────────┴─────────┐  
│ │  
│ N │ N  
┌────┴──────┐ ┌────┴──────┐  
│ quotes │ │ invoices │  
│───────────│ │───────────│  
│ quote\_id │ │invoice\_id │  
│project\_id │ │project\_id │  
│ version │ │ status │  
│ content │ │ total │  
└───────────┘ └───────────┘

**3.2 Tablas Completas con SQL**

**Tabla: clients**

CREATE TABLE clients (  
client\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
company\_name VARCHAR(100) NOT NULL,  
email VARCHAR(255) UNIQUE NOT NULL,  
contact\_person VARCHAR(100),  
phone VARCHAR(20),  
address TEXT,  
nif\_cif VARCHAR(20),  
preferred\_language VARCHAR(2) DEFAULT 'es'  
CHECK (preferred\_language IN ('es', 'en', 'ca')),  
notes TEXT,  
created\_at TIMESTAMPTZ DEFAULT NOW(),  
updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- Index para búsquedas  
CREATE INDEX idx\_clients\_email ON clients(email);  
CREATE INDEX idx\_clients\_company ON clients(company\_name);

\-- RLS Policies  
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access"  
ON clients FOR ALL  
USING (auth.role() \= 'authenticated' AND auth.jwt() \-\>\> 'role' \= 'admin');

CREATE POLICY "Clients read own data"  
ON clients FOR SELECT  
USING (auth.uid() \= client\_id);

**Tabla: projects**

CREATE TABLE projects (  
project\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
client\_id UUID REFERENCES clients(client\_id) ON DELETE CASCADE,  
project\_name VARCHAR(150) NOT NULL,  
description TEXT,  
status VARCHAR(20) DEFAULT 'backlog' CHECK (  
status IN ('backlog', 'proposal', 'approved', 'in\_progress',  
'testing', 'completed', 'cancelled')  
),  
budget DECIMAL(10, 2),  
deadline DATE,  
priority VARCHAR(10) DEFAULT 'medium'  
CHECK (priority IN ('low', 'medium', 'high', 'urgent')),  
archived BOOLEAN DEFAULT FALSE,  
created\_at TIMESTAMPTZ DEFAULT NOW(),  
updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- Indexes  
CREATE INDEX idx\_projects\_client ON projects(client\_id);  
CREATE INDEX idx\_projects\_status ON projects(status)  
WHERE archived \= FALSE;  
CREATE INDEX idx\_projects\_deadline ON projects(deadline)  
WHERE status NOT IN ('completed', 'cancelled');

\-- RLS  
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access"  
ON projects FOR ALL  
USING (auth.jwt() \-\>\> 'role' \= 'admin');

CREATE POLICY "Clients read own projects"  
ON projects FOR SELECT  
USING (client\_id \= auth.uid());

**Tabla: quotes**

CREATE TABLE quotes (  
quote\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
project\_id UUID REFERENCES projects(project\_id) ON DELETE CASCADE,  
version INTEGER NOT NULL,  
status VARCHAR(20) DEFAULT 'draft' CHECK (  
status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected')  
),  
language VARCHAR(2) DEFAULT 'es',  
tone VARCHAR(20),  
content\_json JSONB NOT NULL,  
subtotal DECIMAL(10, 2\) NOT NULL,  
iva DECIMAL(10, 2\) NOT NULL,  
total DECIMAL(10, 2\) NOT NULL,  
pdf\_url TEXT,  
created\_at TIMESTAMPTZ DEFAULT NOW(),  
sent\_at TIMESTAMPTZ,  
viewed\_at TIMESTAMPTZ,  
UNIQUE(project\_id, version)  
);

\-- Trigger auto-incrementar version  
CREATE OR REPLACE FUNCTION set\_quote\_version()

RETURNS TRIGGER AS BEGINNEW.version:=COALESCE((SELECTMAX(version)+1FROMquotesWHEREprojectid=NEW.projectid),1);RETURNNEW;END;

 LANGUAGE plpgsql;

CREATE TRIGGER before\_insert\_quote  
BEFORE INSERT ON quotes  
FOR EACH ROW  
WHEN (NEW.version IS NULL)  
EXECUTE FUNCTION set\_quote\_version();

\-- Index  
CREATE INDEX idx\_quotes\_project ON quotes(project\_id);  
CREATE INDEX idx\_quotes\_status ON quotes(status);

\-- RLS  
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access"  
ON quotes FOR ALL  
USING (auth.jwt() \-\>\> 'role' \= 'admin');

CREATE POLICY "Clients read own quotes"  
ON quotes FOR SELECT  
USING (  
project\_id IN (  
SELECT project\_id FROM projects WHERE client\_id \= auth.uid()  
)  
);

**Tabla: invoices**

CREATE TABLE invoices (  
invoice\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
project\_id UUID REFERENCES projects(project\_id) ON DELETE RESTRICT,  
invoice\_number VARCHAR(50) UNIQUE NOT NULL,  
issue\_date DATE DEFAULT CURRENT\_DATE,  
due\_date DATE NOT NULL,  
status VARCHAR(20) DEFAULT 'draft' CHECK (  
status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')  
),  
line\_items JSONB NOT NULL,  
subtotal DECIMAL(10, 2\) NOT NULL,  
iva DECIMAL(10, 2\) NOT NULL,  
total DECIMAL(10, 2\) NOT NULL,  
pdf\_url TEXT,  
paid\_at TIMESTAMPTZ,  
created\_at TIMESTAMPTZ DEFAULT NOW(),  
updated\_at TIMESTAMPTZ DEFAULT NOW(),  
CHECK (due\_date \> issue\_date)  
);

\-- Trigger generar invoice\_number  
CREATE OR REPLACE FUNCTION generate\_invoice\_number()

RETURNS TRIGGER AS BEGINNEW.invoicenumber:=TOCHAR(NOW(),′YYYY−MM′)||′−′||LPAD((SELECTCOALESCE(MAX(CAST(SPLITPART(invoicenumber,′−′,3)ASINTEGER)),0)+1FROMinvoicesWHEREinvoicenumberLIKETOCHAR(NOW(),′YYYY−MM′)||′−)::TEXT,4,′0′);RETURNNEW;END;

 LANGUAGE plpgsql;

CREATE TRIGGER before\_insert\_invoice  
BEFORE INSERT ON invoices  
FOR EACH ROW  
WHEN (NEW.invoice\_number IS NULL)  
EXECUTE FUNCTION generate\_invoice\_number();

\-- Indexes  
CREATE INDEX idx\_invoices\_project ON invoices(project\_id);  
CREATE INDEX idx\_invoices\_status ON invoices(status);  
CREATE INDEX idx\_invoices\_due ON invoices(due\_date)  
WHERE status IN ('sent', 'overdue');

\-- RLS  
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access"  
ON invoices FOR ALL  
USING (auth.jwt() \-\>\> 'role' \= 'admin');

CREATE POLICY "Clients read own invoices"  
ON invoices FOR SELECT  
USING (  
project\_id IN (  
SELECT project\_id FROM projects WHERE client\_id \= auth.uid()  
)  
);

**Tabla: alerts**

CREATE TABLE alerts (  
alert\_id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
project\_id UUID REFERENCES projects(project\_id) ON DELETE CASCADE,  
client\_id UUID REFERENCES clients(client\_id) ON DELETE CASCADE,  
type VARCHAR(50) NOT NULL CHECK (  
type IN ('deadline\_approaching', 'budget\_exceeded', 'invoice\_overdue',  
'project\_stale', 'client\_inactive')  
),  
priority VARCHAR(10) DEFAULT 'medium'  
CHECK (priority IN ('low', 'medium', 'high', 'critical')),  
message TEXT NOT NULL,  
is\_read BOOLEAN DEFAULT FALSE,  
created\_at TIMESTAMPTZ DEFAULT NOW(),  
resolved\_at TIMESTAMPTZ,  
CHECK ((project\_id IS NOT NULL) OR (client\_id IS NOT NULL))  
);

\-- Index  
CREATE INDEX idx\_alerts\_unread ON alerts(is\_read, created\_at)  
WHERE is\_read \= FALSE;  
CREATE INDEX idx\_alerts\_project ON alerts(project\_id)  
WHERE project\_id IS NOT NULL;

\-- RLS  
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access"  
ON alerts FOR ALL  
USING (auth.jwt() \-\>\> 'role' \= 'admin');

**Tabla: audit\_logs**

CREATE TABLE audit\_logs (  
log\_id BIGSERIAL PRIMARY KEY,  
table\_name VARCHAR(50) NOT NULL,  
record\_id UUID NOT NULL,  
action VARCHAR(10) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),  
old\_data JSONB,  
new\_data JSONB,  
changed\_by UUID REFERENCES auth.users(id),  
changed\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- Index  
CREATE INDEX idx\_audit\_table\_record ON audit\_logs(table\_name, record\_id);  
CREATE INDEX idx\_audit\_date ON audit\_logs(changed\_at DESC);

\-- Trigger genérico para auditoría  
CREATE OR REPLACE FUNCTION audit\_trigger()

RETURNS TRIGGER AS BEGININSERTINTOauditlogs(tablename,recordid,action,olddata,newdata,changedby)VALUES(TGTABLENAME,COALESCE(NEW.projectid,OLD.projectid,NEW.clientid,OLD.clientid),TGOP,CASEWHENTGOP\!=′INSERT′THENrowtojson(OLD)END,CASEWHENTGOP\!=′DELETE′THENrowtojson(NEW)END,auth.uid());RETURNCOALESCE(NEW,OLD);END;

 LANGUAGE plpgsql;

\-- Aplicar a tablas críticas  
CREATE TRIGGER audit\_projects  
AFTER INSERT OR UPDATE OR DELETE ON projects  
FOR EACH ROW EXECUTE FUNCTION audit\_trigger();

CREATE TRIGGER audit\_quotes  
AFTER INSERT OR UPDATE OR DELETE ON quotes  
FOR EACH ROW EXECUTE FUNCTION audit\_trigger();

CREATE TRIGGER audit\_invoices  
AFTER INSERT OR UPDATE OR DELETE ON invoices  
FOR EACH ROW EXECUTE FUNCTION audit\_trigger();

---

**4\. INTEGRACIÓN CON IA LOCAL**

**4.1 Arquitectura**

Frontend (Vercel)  
↓ HTTP POST  
Cloudflare Tunnel / Render (público)  
↓ Proxy/Forward  
FastAPI Local (Puerto 8000\)  
↓ HTTP POST  
Ollama (Puerto 11434\)  
↓ Inference  
Llama 3.2 3B Model (local)

**4.2 FastAPI Middleware**

**Archivo:** ai-service/main.py

from fastapi import FastAPI, HTTPException, Depends  
from fastapi.middleware.cors import CORSMiddleware  
from pydantic import BaseModel, Field  
import requests  
import json  
import re

app \= FastAPI(title="Anclora AI Quote Generator")

**CORS para Vercel**

app.add\_middleware(  
CORSMiddleware,  
allow\_origins=\["[https://anclora-platform.vercel.app](https://anclora-platform.vercel.app)"\],  
allow\_credentials=True,  
allow\_methods=\["POST"\],  
allow\_headers=\["\*"\],  
)

class QuoteRequest(BaseModel):  
client\_name: str \= Field(..., min\_length=1, max\_length=100)  
project\_name: str \= Field(..., min\_length=1, max\_length=150)  
project\_description: str \= Field(..., max\_length=2000)  
services: list\[dict\] \= Field(..., min\_items=1)  
language: str \= Field(default="es", regex="^(es|en|ca)$")  
tone: str \= Field(default="profesional")  
technical\_depth: int \= Field(default=5, ge=1, le=10)  
custom\_instructions: str \= Field(default="", max\_length=300)

@app.post("/api/generate-quote")  
async def generate\_quote(req: QuoteRequest):  
\# Construir prompt  
system\_prompt \= build\_system\_prompt(req)

\# Llamar a Ollama  
try:  
    response \= requests.post(  
        "http://localhost:11434/api/generate",  
        json={  
            "model": "llama3.2:3b",  
            "prompt": system\_prompt,  
            "stream": False,  
            "options": {  
                "temperature": 0.7,  
                "top\_p": 0.9,  
                "num\_predict": 2048,  
                "stop": \["\</json\>"\]  
            }  
        },  
        timeout=30  
    )  
    response.raise\_for\_status()  
      
    \# Parsear respuesta  
    llm\_output \= response.json()\["response"\]  
    quote\_json \= extract\_json\_from\_text(llm\_output)  
      
    \# Validar estructura  
    validate\_quote\_structure(quote\_json)  
      
    return {"success": True, "quote": quote\_json}  
      
except requests.Timeout:  
    raise HTTPException(status\_code=504, detail="IA timeout después de 30s")  
except json.JSONDecodeError as e:  
    raise HTTPException(status\_code=500, detail=f"Invalid JSON from IA: {str(e)}")  
except ValueError as e:  
    raise HTTPException(status\_code=400, detail=str(e))  
except Exception as e:  
    raise HTTPException(status\_code=500, detail=f"Error interno: {str(e)}")

def build\_system\_prompt(req: QuoteRequest) \-\> str:  
services\_list \= "\\n".join(\[  
f"- {s\['name'\]}: {s.get('custom\_hours', 'estimar')} horas, {s.get('description\_detail', '')}"  
for s in req.services  
\])

tone\_descriptions \= {  
    "técnico": "Usa terminología especializada como 'arquitectura microservicios', 'RAG pipeline', 'fine-tuning LoRA', 'embeddings vectoriales'. Incluye KPIs técnicos.",  
    "sencillo": "Explica sin jerga técnica, usa metáforas cotidianas. Como si explicaras a tu abuela.",  
    "formal": "Lenguaje corporativo, referencias a estudios, estructura tradicional.",  
    "profesional": "Balance entre técnico y comercial. Default.",  
    "consultivo": "Enfatiza ROI, business case, impacto medible en negocio.",  
    "casual": "Tono cercano, primera persona, emojis moderados."  
}

depth\_instructions \= {  
    range(1, 4): "Solo resultados de negocio, sin detalles técnicos.",  
    range(4, 8): "Balance de conceptos técnicos explicados claramente.",  
    range(8, 11): "Deep-dive en implementación, arquitecturas, trade-offs técnicos."  
}

depth\_desc \= next(v for k, v in depth\_instructions.items() if req.technical\_depth in k)

prompt \= f"""Eres un consultor experto en IA que genera presupuestos profesionales.

CONTEXTO:

* Cliente: {req.client\_name}

* Proyecto: {req.project\_name}

* Descripción: {req.project\_description}

* Idioma: {req.language}

* Tono: {req.tone}

* Nivel técnico: {req.technical\_depth}/10

SERVICIOS SOLICITADOS:  
{services\_list}

INSTRUCCIONES:

1. Genera un presupuesto estructurado en JSON válido con esta forma EXACTA:  
   {{  
   "introduction": "string (2-3 párrafos introductorios adaptados al tono)",  
   "services": \[  
   {{  
   "name": "string",  
   "description": "string (detallada según technical\_depth)",  
   "hours": number,  
   "hourly\_rate": 85,  
   "amount": number (hours \* 85\)  
   }}  
   \],  
   "timeline": "string (estimación temporal realista en semanas/meses)",  
   "payment\_terms": "string (condiciones de pago profesionales)",  
   "conclusion": "string (call-to-action persuasivo pero profesional)"  
   }}

2. ADAPTAR AL TONO "{req.tone}":  
   {tone\_descriptions.get(req.tone, tone\_descriptions\['profesional'\])}

3. NIVEL TÉCNICO {req.technical\_depth}/10:  
   {depth\_desc}

4. REGLAS ESTRICTAS:

   * Tarifa fija: 85€/hora

   * NO incluir IVA (se calcula después)

   * Timeline realista (no prometer imposibles)

   * Payment terms default: "50% al inicio, 50% a la entrega"

   * Usar estimaciones de horas proporcionadas

5. INSTRUCCIONES ADICIONALES DEL CLIENTE:  
   {req.custom\_instructions if req.custom\_instructions else "Ninguna"}

6. OUTPUT:

   * SOLO JSON válido

   * SIN texto fuera del JSON

   * NO inventar servicios no solicitados

   * SER persuasivo pero honesto

Genera el presupuesto en idioma {req.language}:  
"""

return prompt

def extract\_json\_from\_text(text: str) \-\> dict:  
"""Extrae JSON de texto que puede incluir markdown o texto adicional"""  
\# Buscar JSON entre llaves  
start \= text.find('{')  
end \= text.rfind('}') \+ 1

if start \== \-1 or end \== 0:  
    raise json.JSONDecodeError("No JSON found in response", text, 0\)

json\_str \= text\[start:end\]  
return json.loads(json\_str)

def validate\_quote\_structure(data: dict):  
"""Valida que el JSON tenga la estructura esperada"""  
required\_keys \= \["introduction", "services", "timeline", "payment\_terms", "conclusion"\]

for key in required\_keys:  
    if key not in data:  
        raise ValueError(f"Missing required key in JSON: {key}")

if not isinstance(data\["services"\], list) or len(data\["services"\]) \== 0:  
    raise ValueError("'services' must be a non-empty array")

for i, service in enumerate(data\["services"\]):  
    required\_service\_keys \= \["name", "description", "hours", "hourly\_rate", "amount"\]  
    for key in required\_service\_keys:  
        if key not in service:  
            raise ValueError(f"Service {i} missing required key: {key}")  
      
    \# Validar tipos  
    if not isinstance(service\["hours"\], (int, float)):  
        raise ValueError(f"Service {i} 'hours' must be a number")  
    if service\["hourly\_rate"\] \!= 85:  
        raise ValueError(f"Service {i} 'hourly\_rate' must be 85")  
    if abs(service\["amount"\] \- (service\["hours"\] \* service\["hourly\_rate"\])) \> 0.01:  
        raise ValueError(f"Service {i} 'amount' calculation incorrect")

@app.get("/health")  
async def health():  
"""Endpoint de healthcheck"""  
try:  
\# Verificar que Ollama responde  
response \= requests.get("[http://localhost:11434/api/tags](http://localhost:11434/api/tags)", timeout=5)  
response.raise\_for\_status()  
return {"status": "healthy", "ollama": "connected"}  
except:  
return {"status": "unhealthy", "ollama": "disconnected"}

if **name** \== "**main**":  
import uvicorn  
uvicorn.run(app, host="0.0.0.0", port=8000)

**4.3 Despliegue**

**Opción 1: Render (Recomendado para MVP)**

1. Free tier: 750h/mes (suficiente para MVP)

2. Dockerfile con FastAPI \+ Ollama

3. Auto-sleep después de 15 min inactividad

4. Wake-up automático en request (latencia \+10s primera vez)

5. Deploy desde GitHub (CI/CD automático)

**Dockerfile:**

FROM python:3.11-slim

**Instalar Ollama**

RUN curl \-fsSL [https://ollama.ai/install.sh](https://ollama.ai/install.sh) | sh

**Instalar dependencias Python**

COPY requirements.txt .  
RUN pip install \--no-cache-dir \-r requirements.txt

**Copiar código**

COPY . /app  
WORKDIR /app

**Pull modelo al build (cachea en imagen)**

RUN ollama serve & sleep 5 && ollama pull llama3.2:3b

**Exponer puerto**

EXPOSE 8000

**Start script que inicia Ollama y FastAPI**

CMD \["sh", "-c", "ollama serve & sleep 5 && python [main.py](http://main.py)"\]

**Opción 2: Self-hosted \+ Cloudflare Tunnel (Zero-cost)**

1. Ollama corriendo en máquina local (Linux/Mac/Windows)

2. Cloudflare Tunnel expone puerto 8000 públicamente

3. Requiere máquina siempre encendida

4. Comando: cloudflared tunnel \--url http://localhost:8000

---

**5\. FLUJOS DE USUARIO COMPLETOS**

**5.1 Flujo: Crear Presupuesto End-to-End**

1. Admin hace login → Redirect a /dashboard

2. Click botón \[+ Nuevo Presupuesto\] → Abre /quotes/new

3. Wizard Paso 1:

   1. Dropdown "Cliente": Selecciona "Cliente A" (o click "Crear nuevo")

   2. Dropdown "Proyecto": Selecciona "Proyecto X" (o click "Crear nuevo")

   3. Radio buttons "Idioma": Selecciona "Español"

   4. Click \[Siguiente →\]

4. Wizard Paso 2:

   1. Checkbox ☑ Desarrollo MVP

   2. Input "Horas MVP": 100h

   3. Checkbox ☑ Implementación RAG

   4. Textarea "Detalle RAG": "Sistema RAG para documentación interna con ChromaDB"

   5. Click \[Siguiente →\]

5. Wizard Paso 3:

   1. Dropdown "Tono": Selecciona "Técnico"

   2. Slider "Nivel técnico": 8/10

   3. Checkbox ☑ Incluir timeline

   4. Checkbox ☑ Incluir condiciones de pago

   5. Textarea "Instrucciones": "Enfatizar escalabilidad y performance"

   6. Click \[Generar con IA\] → Loading spinner (10-15s)

6. Vista Previa (split-view):

   1. Panel izquierdo: JSON editable con campos

   2. Panel derecho: Preview HTML actualizado en tiempo real

   3. Admin revisa introducción generada (OK)

   4. Admin edita descripción de MVP: "Incluye CI/CD pipeline"

   5. Verifica cálculos: 100h × 85€ \= 8.500€, RAG 50h × 85€ \= 4.250€

   6. Subtotal auto-calculado: 12.750€

   7. IVA 21%: 2.677,50€

   8. Total: 15.427,50€

   9. Click \[Guardar como borrador\]

7. Sistema:

   1. INSERT en tabla quotes con status='draft'

   2. Auto-generar version=1 (primera versión del proyecto)

   3. Toast: "Presupuesto guardado como borrador"

8. Admin click \[Generar PDF\]:

   1. @react-pdf/renderer genera PDF (2-3s)

   2. Upload a Supabase Storage: quotes-pdfs/{client\_id}/{project\_id}/quote-v1.pdf

   3. UPDATE quotes SET pdf\_url \= public\_url

   4. Toast: "PDF generado correctamente"

   5. Botón \[Ver PDF\] habilitado

9. Admin click \[Enviar por email\]:

   1. Modal confirmación: "Enviar presupuesto a [cliente@example.com](mailto:cliente@example.com)?"

   2. Click \[Confirmar\]

   3. UPDATE quotes SET status='sent', sent\_at=NOW()

   4. Supabase Edge Function envía email con PDF adjunto

   5. Toast: "Presupuesto enviado correctamente"

   6. Redirect a /dashboard

**5.2 Flujo: Cliente ve Presupuesto**

1. Cliente recibe email:

   1. Asunto: "Nuevo presupuesto disponible \- Anclora Cognitive Solutions"

   2. Cuerpo: Saludo \+ resumen \+ botón \[Ver Presupuesto\]

2. Click en botón \[Ver Presupuesto\] → Abre link con magic token

3. Magic link auto-login:

   1. Supabase Auth valida token

   2. Genera session

   3. UPDATE quotes SET viewed\_at=NOW() WHERE quote\_id=...

   4. Redirect a /portal/client/{clientId}

4. Portal Cliente \- Dashboard:

   1. Badge "Nuevo presupuesto" visible en card de Proyecto X

   2. Click en card → Abre /portal/projects/{projectId}

5. Página Detalle Proyecto:

   1. Tab "Presupuesto" activo por defecto

   2. Vista previa HTML del presupuesto (read-only)

   3. Botón \[Descargar PDF\] → Download directo

   4. Botón \[Aceptar Presupuesto\] (futuro: firma digital)

6. Cliente click \[Aceptar Presupuesto\]:

   1. Modal confirmación: "¿Confirma aceptación del presupuesto por 15.427,50€?"

   2. Checkbox: "He leído y acepto las condiciones"

   3. Click \[Aceptar\]

   4. UPDATE quotes SET status='accepted'

   5. UPDATE projects SET status='approved'

   6. Supabase Realtime broadcast cambio de estado

   7. Notificación email a admin: "Cliente aceptó presupuesto Proyecto X"

   8. Toast cliente: "Presupuesto aceptado. Recibirás actualizaciones del proyecto."

7. Admin (si tiene Kanban abierto):

   1. Recibe evento Realtime

   2. Tarjeta "Proyecto X" se mueve automáticamente de "Propuesta" a "Aprobado"

   3. Badge verde "Presupuesto aceptado" en tarjeta

**5.3 Flujo: Gestión Kanban en Tiempo Real**

1. Admin abre /kanban

2. Ve tarjeta "Proyecto X" en columna "Aprobado"

3. Drag tarjeta → Arrastra a columna "En Progreso"

4. Al soltar (onDragEnd):

   1. Frontend: Actualiza UI optimísticamente

   2. Backend: UPDATE projects SET status='in\_progress', updated\_at=NOW()

   3. Supabase Realtime: Broadcast evento a canal 'projects'

   4. INSERT en audit\_logs (action='UPDATE', table='projects')

5. Cliente tiene portal abierto en otra ventana:

   1. Supabase Realtime listener recibe evento (\<1s latencia)

   2. Frontend actualiza Kanban automáticamente

   3. Tarjeta se mueve de "Aprobado" a "En Progreso"

   4. Toast: "Proyecto X iniciado"

6. Admin click en tarjeta → Modal detalles:

   1. Tab "Timeline": Lista de cambios de audit\_logs

   2. Formulario "Añadir comentario":

      1. Textarea: "Comenzando fase de descubrimiento. Reunión kickoff programada para mañana."

      2. Checkbox: "Notificar a cliente"

      3. Click \[Guardar\]

   3. INSERT en tabla project\_notes (futura, no en MVP)

   4. Si checkbox marcado: Email a cliente con comentario

7. Cliente recibe email:

   1. Asunto: "Nueva actualización en Proyecto X"

   2. Cuerpo: Comentario del admin \+ link al portal

8. Cliente click link → Portal muestra comentario en timeline del proyecto

**5.4 Flujo: Sistema de Alertas Automático**

1. Cron job (Supabase Edge Function) ejecuta a las 09:00 CET:

   1. Función: generate-alerts

   2. SELECT proyectos con deadline \< CURRENT\_DATE \+ 7

   3. Encuentra "Proyecto Y" (deadline: 3 Feb 2026, hoy: 30 Ene 2026\)

2. INSERT en tabla alerts:

   1. type: 'deadline\_approaching'

   2. priority: 'medium'

   3. message: "Proyecto Y vence en 3 días"

   4. project\_id: {uuid}

   5. created\_at: NOW()

3. Admin abre /dashboard a las 10:00:

   1. Badge rojo en navbar: 🔴 (1)

   2. Click en badge → Dropdown muestra:

      1. 🟡 Proyecto Y vence en 3 días (hace 1 hora)

      2. Click en alerta → Navega a /kanban con highlight en tarjeta

4. Admin revisa Proyecto Y:

   1. Ve que falta completar 2 tareas

   2. Decide extender deadline

   3. Click \[Editar Proyecto\]

   4. Campo "Deadline": Cambia de "3 Feb" a "10 Feb"

   5. Checkbox: "Notificar a cliente del cambio"

   6. Click \[Guardar\]

5. Sistema:

   1. UPDATE projects SET deadline='2026-02-10', updated\_at=NOW()

   2. Si checkbox marcado: Email a cliente notificando cambio

   3. Admin vuelve a dropdown de alertas

   4. Click \[Resolver alerta\]

   5. UPDATE alerts SET resolved\_at=NOW(), is\_read=true

   6. Badge desaparece (0 alertas no leídas)

6. Al día siguiente (31 Ene), cron job ejecuta de nuevo:

   1. SELECT proyectos con deadline \< 7 días

   2. "Proyecto Y" ahora tiene deadline en 10 días (fuera del rango)

   3. NO crea nueva alerta para este proyecto

---

**6\. CRITERIOS DE ACEPTACIÓN**

**6.1 Módulo Clientes**

1. ☐ Puede crear cliente con todos los campos obligatorios

2. ☐ Validación de email único funciona (error si duplicado)

3. ☐ Validación de NIF español correcta (regex acepta formatos válidos)

4. ☐ Lista muestra paginación correctamente (20 items/página)

5. ☐ Búsqueda por nombre/email funciona con debounce 300ms

6. ☐ Filtro por idioma (ES/EN/CA) funciona

7. ☐ Editar cliente actualiza updated\_at automáticamente

8. ☐ Eliminar cliente con proyectos activos muestra advertencia

9. ☐ RLS impide que cliente A vea datos de cliente B en portal

10. ☐ Magic link enviado al crear cliente llega al email (verificar spam)

**6.2 Módulo Proyectos**

1. ☐ Crear proyecto requiere cliente asociado (dropdown obligatorio)

2. ☐ Kanban muestra 7 columnas con nombres correctos

3. ☐ Drag & drop entre columnas funciona sin lag

4. ☐ Cambio de estado persiste en BD inmediatamente

5. ☐ Supabase Realtime sincroniza cambios en \<1s

6. ☐ Badge de prioridad muestra colores correctos (rojo=urgent, amarillo=high, azul=medium, gris=low)

7. ☐ Deadline en rojo si \<7 días, amarillo si \<14 días

8. ☐ Progreso presupuestario calcula correctamente (gastado/total × 100\)

9. ☐ Archivar proyecto lo oculta de Kanban pero accesible en /projects/archived

10. ☐ Cliente solo ve proyectos propios en portal (RLS validado)

11. ☐ Transiciones de estado respetan matriz de transiciones permitidas

**6.3 Módulo Presupuestos con IA**

1. ☐ Wizard 3 pasos se completa sin errores

2. ☐ Llamada a Ollama retorna en \<30s (medir con Network tab)

3. ☐ JSON parseado contiene todas las claves requeridas

4. ☐ Cálculo de totales (subtotal, IVA, total) es correcto al céntimo

5. ☐ Tono "técnico" incluye terminología especializada (verificar manualmente)

6. ☐ Tono "sencillo" evita jerga y usa metáforas

7. ☐ Vista previa es editable y actualiza preview en tiempo real

8. ☐ Recalculo automático al editar horas funciona

9. ☐ Guardar presupuesto auto-incrementa versión correctamente

10. ☐ PDF generado contiene logo Anclora y todos los datos

11. ☐ PDF subido a Storage tiene URL pública accesible

12. ☐ Email enviado incluye PDF como adjunto (\<5MB)

13. ☐ Estado cambia a "sent" al enviar email

14. ☐ Presupuesto accesible desde portal cliente tras enviar

15. ☐ viewed\_at se registra al abrir presupuesto en portal

**6.4 Módulo Facturación**

1. ☐ Número factura auto-generado es único (formato YYYY-MM-NNNN)

2. ☐ Importar desde presupuesto copia líneas correctamente

3. ☐ Cálculo IVA 21% es correcto

4. ☐ PDF factura incluye IBAN y datos legales completos

5. ☐ Enviar factura cambia estado a "sent"

6. ☐ Marcar como pagada registra paid\_at con timestamp correcto

7. ☐ Facturas vencidas generan alerta automática (verificar cron)

8. ☐ Cliente puede descargar facturas desde portal

**6.5 Módulo Alertas**

1. ☐ Cron job ejecuta diariamente a las 09:00 CET

2. ☐ Alerta deadline se crea si proyecto vence en \<7 días

3. ☐ Alerta factura vencida si due\_date \+ 7 días

4. ☐ Badge en navbar muestra contador correcto de alertas no leídas

5. ☐ Dropdown lista alertas no leídas ordenadas por created\_at DESC

6. ☐ Click en alerta navega a recurso relacionado (proyecto/cliente)

7. ☐ Marcar como leída funciona (is\_read=true)

8. ☐ Resolver alerta la oculta de lista activa

9. ☐ Página /alerts muestra filtros funcionales

10. ☐ Exportar CSV genera archivo con formato correcto

**6.6 Portal Cliente**

1. ☐ Magic link envía email correctamente

2. ☐ Login automático desde link funciona sin fricción

3. ☐ Dashboard muestra solo proyectos propios (RLS)

4. ☐ Kanban read-only no permite drag (cursor no cambia)

5. ☐ Descargar presupuesto funciona sin errores

6. ☐ Descargar factura funciona sin errores

7. ☐ Timeline muestra cambios recientes ordenados

8. ☐ Aceptar presupuesto cambia estados correctamente

---

**7\. REQUISITOS NO FUNCIONALES**

**7.1 Performance**

| Métrica | Target | Método de medición |
| :---- | :---- | :---- |
| First Contentful Paint (FCP) | \<1.8s | Lighthouse |
| Time to Interactive (TTI) | \<3.9s | Lighthouse |
| Bundle size (inicial) | \<300KB gzipped | webpack-bundle-analyzer |
| API response time (p95) | \<500ms | Supabase logs |
| IA generation time (p95) | \<30s | Custom timing |
| Realtime latency | \<1s | Manual testing |

Table 6: Métricas de performance

**7.2 Seguridad**

1. **Auth:** JWT con expiración 7 días (refresh token 30 días)

2. **RLS:** Habilitado en todas las tablas con políticas estrictas

3. **HTTPS:** Obligatorio (Vercel automático)

4. **Secrets:** Nunca en código (usar .env.local, Vercel env vars)

5. **CORS:** Whitelist de dominios (solo Vercel production domain)

6. **Rate limiting:** 100 requests/min por IP (Supabase nativo)

7. **SQL Injection:** Parameterized queries (Supabase client)

8. **XSS:** Sanitización de inputs (DOMPurify en rich text)

**7.3 Escalabilidad**

| Recurso | Límite Free Tier / Estimación MVP |
| :---- | :---- |
| Supabase DB | 500MB / \~100MB (50 clientes, 200 proyectos) |
| Supabase Storage | 1GB / \~200MB (500 PDFs × 400KB avg) |
| Supabase Bandwidth | 2GB/mes / \~500MB/mes |
| Vercel Functions | 100GB-hours / Bajo uso (solo Edge Functions) |
| Render (IA API) | 750h/mes / \~300h (auto-sleep) |

Table 7: Límites de free tiers y uso estimado

**7.4 Disponibilidad**

1. **Uptime:** 99.9% (Vercel SLA \+ Supabase SLA)

2. **Backup:** Supabase Point-in-Time Recovery (7 días retención)

3. **Recovery:** Manual restore via Supabase dashboard (RTO: \<1h)

4. **Monitoring:** Vercel Analytics \+ Supabase Dashboard

5. **Error tracking:** Sentry (opcional, free tier 5K events/mes)

**7.5 Accesibilidad (A11Y)**

1. **Compliance:** WCAG 2.1 AA

2. **Keyboard navigation:** 100% features accesibles con Tab

3. **Screen reader:** Compatible (probar con NVDA/VoiceOver)

4. **Contrast ratio:** Mínimo 4.5:1 para texto normal, 3:1 para texto grande

5. **Focus indicators:** Visibles y con buen contraste

6. **ARIA labels:** En todos los componentes interactivos

7. **Form validations:** Anunciadas por screen readers

**7.6 Multiidioma (i18n)**

1. **Idiomas soportados:** Español (default), English, Català

2. **Frontend:** react-i18next con archivos JSON

3. **Backend:** Templates de email por idioma

4. **PDFs:** Generados en idioma del cliente (preferred\_language)

5. **Fallback:** Si traducción falta → mostrar en español \+ log warning

6. **Detección:** Por configuración cliente, no por navegador

---

**8\. FUERA DE SCOPE (MVP v1.0)**

**No implementar en MVP. Considerar para MVP+:**

1. ☒ Tareas granulares dentro de proyectos (solo estructura DB preparada)

2. ☒ Time tracking (horas trabajadas vs presupuestadas)

3. ☒ Chat en tiempo real consultor-cliente (Supabase Realtime)

4. ☒ Integración calendarios (Google Calendar, Outlook)

5. ☒ Notificaciones push móviles (solo email)

6. ☒ Reportes avanzados (analytics, métricas, dashboards)

7. ☒ Gestión de equipos (múltiples consultores con roles)

8. ☒ Roles granulares (admin, project-manager, viewer)

9. ☒ Firma digital de presupuestos/contratos (DocuSign, HelloSign)

10. ☒ Pagos integrados (Stripe, PayPal)

11. ☒ Multi-moneda (solo EUR en MVP)

12. ☒ Exportar datos masivos (CSV, Excel) \- solo PDFs individuales

13. ☒ API pública para integraciones (webhooks, REST API)

14. ☒ Modo oscuro (solo light mode)

15. ☒ Mobile apps nativas (solo PWA)

16. ☒ IA para estimar horas automáticamente

17. ☒ Integración GitHub para time tracking desde commits

18. ☒ Automatización Zapier/Make

**Priorizar para MVP+ v1.1:**

1. Time tracking (crítico para validar presupuestos)

2. Chat consultor-cliente (mejora engagement)

3. Firma digital (reduce fricción aprobación)

4. Reportes básicos (métricas de negocio)

---

**Fin del [spec.md](http://spec.md)**

Este documento define EXACTAMENTE qué construir. Siguiente paso: [plan.md](http://plan.md) (cómo construirlo técnicamente).
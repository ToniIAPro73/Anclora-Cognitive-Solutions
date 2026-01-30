[**Constitution.md**](http://Constitution.md) **\- Leyes Supremas del Proyecto**

**Anclora Cognitive Solutions Platform**

**Versión:** 1.0.0  
**Última actualización:** 30 de enero de 2026  
**Principio rector:** Estas leyes son inmutables y tienen precedencia sobre cualquier decisión técnica

---

**🎯 MISIÓN CORE**

Construir una plataforma SaaS de gestión para consultorías de IA que combine:

1. **Transparencia radical** hacia el cliente

2. **Automatización inteligente** mediante IA local

3. **Zero-cost hasta escala** usando free tiers

4. **Open source first** en toda la arquitectura

---

**📜 LEYES SUPREMAS**

**LEY 1: PRIVACY-FIRST**

**Nunca comprometer la privacidad del cliente**

* ✅ Modelos de IA ejecutados localmente (Ollama)

* ✅ Datos sensibles nunca salen del backend

* ✅ Cifrado en reposo (Supabase nativo)

* ✅ RLS (Row Level Security) obligatorio en todas las tablas

* ❌ PROHIBIDO: APIs externas para procesamiento de datos privados

* ❌ PROHIBIDO: Logging de información sensible

**LEY 2: SIMPLICIDAD RADICAL**

**Menos código es más mantenible**

* ✅ Single-file App.jsx como punto de entrada

* ✅ Componentes funcionales sin lógica compleja

* ✅ Estado global mínimo (React Context \+ Supabase Realtime)

* ✅ Tailwind CSS inline \> archivos CSS externos

* ❌ PROHIBIDO: Over-engineering, abstracciones innecesarias

* ❌ PROHIBIDO: Dependencias no justificadas

**LEY 3: TRANSPARENCIA TOTAL**

**El cliente debe ver todo en tiempo real**

* ✅ Portal cliente con acceso read-only a su proyecto

* ✅ Kanban board visible para el cliente

* ✅ Actualizaciones en tiempo real (Supabase Realtime)

* ✅ Historial completo de cambios (auditoría)

* ❌ PROHIBIDO: Ocultar estados intermedios

* ❌ PROHIBIDO: Modificar datos sin trazabilidad

**LEY 4: IA COMO ASISTENTE, NO DECISOR**

**La IA sugiere, el humano decide**

* ✅ Presupuestos generados con IA son editables

* ✅ Tono de presupuesto configurable por el usuario

* ✅ Override manual siempre permitido

* ✅ Feedback loops para mejorar prompts

* ❌ PROHIBIDO: Auto-aprobar acciones críticas (enviar facturas, aceptar proyectos)

* ❌ PROHIBIDO: IA con acceso directo a datos de producción

**LEY 5: MULTIIDIOMA SIN EXCEPCIONES**

**Toda string visible debe ser traducible**

* ✅ Soporte nativo: Español, Inglés, Catalán

* ✅ i18n en frontend (react-i18next)

* ✅ Templates de email multiidioma

* ✅ PDFs generados en idioma del cliente

* ❌ PROHIBIDO: Hardcodear strings en español

* ❌ PROHIBIDO: UI elements sin traducción

**LEY 6: ZERO-COST HASTA 50 CLIENTES**

**Optimizar para free tiers**

* ✅ Supabase Free Tier: 500MB DB, 1GB storage, 2GB bandwidth/mes\[1\]

* ✅ Vercel Free Tier: 100GB bandwidth, 100 builds/mes

* ✅ Render Free Tier: 750h/mes (IA API)

* ✅ Ollama local (sin costo)

* ❌ PROHIBIDO: Servicios que requieran tarjeta de crédito antes de 50 clientes

* ❌ PROHIBIDO: Arquitecturas que escalen prematuramente

**LEY 7: TEST-DRIVEN DEVELOPMENT**

**No code sin test**

* ✅ Tests unitarios para lógica crítica (cálculos, validaciones)

* ✅ Tests de integración para flujos principales

* ✅ Tests E2E para user journeys críticos

* ✅ Coverage mínimo: 70%

* ❌ PROHIBIDO: Push a main sin tests pasando

* ❌ PROHIBIDO: Deployment sin CI/CD pipeline

**LEY 8: ACCESIBILIDAD (A11Y) OBLIGATORIA**

**Diseñar para todos**

* ✅ WCAG 2.1 AA compliance

* ✅ Navegación por teclado completa

* ✅ Screen reader compatible

* ✅ Contraste de color mínimo 4.5:1

* ❌ PROHIBIDO: Componentes sin aria-labels

* ❌ PROHIBIDO: Formularios sin validaciones accesibles

**LEY 9: MOBILE-FIRST**

**Diseñar primero para móvil**

* ✅ Responsive design desde 320px

* ✅ Touch-friendly (botones mínimo 44x44px)

* ✅ PWA-ready (service workers, manifest)

* ✅ Optimización para 3G

* ❌ PROHIBIDO: Layouts que rompan en mobile

* ❌ PROHIBIDO: Features desktop-only

**LEY 10: DOCUMENTATION AS CODE**

**El código se documenta a sí mismo**

* ✅ JSDoc en todas las funciones públicas

* ✅ README actualizado en cada PR

* ✅ Diagrams as code (Mermaid)

* ✅ CHANGELOG semántico (SemVer)

* ❌ PROHIBIDO: Código sin comentarios en lógica compleja

* ❌ PROHIBIDO: Breaking changes sin migration guide

---

**🚫 ANTI-PATTERNS PROHIBIDOS**

**Prohibido \#1: Feature Creep**

* **Descripción**: Añadir features no validadas en el PRD

* **Consecuencia**: Deuda técnica, scope creep

* **Excepción**: Solo si cliente paga extra y se actualiza PRD

**Prohibido \#2: Premature Optimization**

* **Descripción**: Optimizar sin métricas reales

* **Consecuencia**: Complejidad innecesaria

* **Excepción**: Cuellos de botella demostrados con profiling

**Prohibido \#3: Vendor Lock-in**

* **Descripción**: Dependencia crítica de un proveedor único

* **Consecuencia**: Imposibilidad de migrar

* **Excepción**: Si hay plan de migración documentado

**Prohibido \#4: Silent Failures**

* **Descripción**: Errores sin logging ni notificación

* **Consecuencia**: Bugs invisibles, mala UX

* **Excepción**: Nunca

**Prohibido \#5: Magic Numbers**

* **Descripción**: Constantes sin nombre semántico

* **Consecuencia**: Código ilegible

* **Excepción**: Nunca (usar constants.js)

---

**📊 MÉTRICAS DE ÉXITO**

**Métricas Técnicas**

* **Test Coverage**: \>70%

* **Bundle Size**: \<500KB inicial

* **Lighthouse Score**: \>90 en todas las categorías

* **Error Rate**: \<0.1% en producción

* **API Response Time**: \<500ms p95

**Métricas de Negocio**

* **Time-to-Quote**: \<5 minutos (con IA)

* **Client Portal Adoption**: \>80% de clientes activos

* **Invoice Generation Time**: \<2 minutos

* **Project Visibility**: 100% tiempo real

---

**🔄 PROCESO DE CAMBIOS**

**Modificar esta Constitution**

1. Propuesta formal en PR

2. Revisión por todo el equipo core

3. Votación unánime requerida

4. Documentar en CHANGELOG

5. Comunicar a stakeholders

**Excepciones Temporales**

* Justificación por escrito

* Aprobación del tech lead

* Fecha límite obligatoria

* Plan de remediación

---

**🛡️ ENFORCEMENT**

**Responsabilidades**

* **Tech Lead**: Guardián de la Constitution

* **Developers**: Reportar violaciones

* **Code Reviews**: Bloquear PRs que violen leyes

* **CI/CD**: Automated checks donde sea posible

**Violaciones**

* **Leve**: Warning en PR, corrección requerida

* **Moderada**: PR bloqueado, refactoring necesario

* **Grave**: Rollback inmediato, postmortem

---

**📚 REFERENCIAS**

\[1\] Supabase. (2026). Pricing & Free Tier Limits. [https://supabase.com/pricing](https://supabase.com/pricing)  
\[2\] Ollama. (2024). Llama 3.2 3B Model. [https://ollama.com/library/llama3.2:3b](https://ollama.com/library/llama3.2:3b)  
\[3\] W3C. (2021). WCAG 2.1 Guidelines. [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/)  
\[4\] SemVer. (2023). Semantic Versioning 2.0.0. [https://semver.org/](https://semver.org/)

---

**Firma del Tech Lead**: Anclora Nexus Group  
**Fecha de vigencia**: 30 de enero de 2026  
**Próxima revisión**: 30 de julio de 2026
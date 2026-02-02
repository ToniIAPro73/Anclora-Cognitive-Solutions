# Anclora AI Service

Servicio de generación de presupuestos con IA usando Ollama y Llama 3.2.

## Requisitos

- Python 3.11+
- Ollama instalado y ejecutándose
- Modelo Llama 3.2 3B descargado

## Instalación

### 1. Instalar Ollama

```bash
# Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Descargar desde https://ollama.ai/download
```

### 2. Descargar el modelo

```bash
ollama pull llama3.2:3b
```

### 3. Instalar dependencias Python

```bash
cd ai-service
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
.\venv\Scripts\activate

pip install -r requirements.txt
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env según sea necesario
```

## Ejecución

### Desarrollo

```bash
# Asegurarse de que Ollama esté ejecutándose
ollama serve

# En otra terminal, iniciar el servicio
uvicorn main:app --reload --port 8000
```

### Producción

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

## API Endpoints

### Health Check

```
GET /health
```

Verifica el estado del servicio y la disponibilidad de Ollama.

### Generar Presupuesto

```
POST /api/generate-quote
```

**Request Body:**

```json
{
  "client_name": "Empresa ABC",
  "project_name": "Desarrollo de App Móvil",
  "project_description": "Aplicación móvil para gestión de inventario",
  "services": [
    {
      "name": "Diseño UX/UI",
      "description": "Diseño de interfaces de usuario",
      "estimated_hours": 40,
      "hourly_rate": 75
    },
    {
      "name": "Desarrollo Frontend",
      "description": "Implementación de la aplicación móvil",
      "estimated_hours": 120,
      "hourly_rate": 85
    }
  ],
  "language": "es",
  "tone": "professional",
  "technical_depth": 5,
  "custom_instructions": "Enfatizar la experiencia en React Native"
}
```

**Response:**

```json
{
  "success": true,
  "content": {
    "introduction": "...",
    "services": [...],
    "timeline": "...",
    "payment_terms": "...",
    "conclusion": "..."
  }
}
```

## Documentación

La documentación interactiva de la API está disponible en:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Configuración

| Variable | Descripción | Default |
|----------|-------------|---------|
| `OLLAMA_URL` | URL del servidor Ollama | `http://localhost:11434` |
| `OLLAMA_MODEL` | Modelo a utilizar | `llama3.2:3b` |
| `ALLOWED_ORIGINS` | Orígenes CORS permitidos | `http://localhost:3000` |
| `REQUEST_TIMEOUT` | Timeout en segundos | `60` |

## Integración con Frontend

El frontend debe configurar la variable de entorno:

```env
AI_SERVICE_URL=http://localhost:8000
```

Y llamar al endpoint desde los server actions.

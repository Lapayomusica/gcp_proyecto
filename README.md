# Google Cloud Platform - RECARGA TELEFONICA
GCP proyecto trabajo final
Una **explicación breve de cada componente** , siguiendo la arquitectura de tu plataforma de recargas:

---

## 📦 **Componentes principales**

### 1. **Frontend (HTML+JS en Cloud Storage)**
Sitio web estático que permite al usuario ingresar su número y monto para recargar.  
Se aloja como página pública en un bucket de Google Cloud Storage y envía solicitudes HTTP al backend.

### 2. **Backend HTTP API (Cloud Run)**
Microservicio expuesto por HTTP que recibe las solicitudes del frontend (POST de recarga).  
Valida los datos y publica un mensaje en el tópico Pub/Sub correspondiente.  
También puede exponer rutas directas para registrar ventas o actualizar saldo.

### 3. **Pub/Sub**
Servicio de mensajería asíncrona de Google Cloud.  
Recibe los mensajes de recarga y los enruta a los microservicios suscriptores para procesamiento desacoplado y escalable.

### 4. **Procesador de Recargas (Cloud Run o Cloud Function)**
Microservicio suscrito al tópico Pub/Sub.  
Procesa cada mensaje recibido (ejemplo: validación, lógica de negocio), y almacena la recarga procesada en Firestore.

### 5. **Microservicio de Registro de Ventas (GKE o Cloud Run)**
Servicio especializado en registrar las ventas realizadas.  
Recibe solicitudes HTTP y almacena cada venta en Firestore para control y auditoría.

### 6. **Microservicio de Actualización de Saldo (GKE o Cloud Run)**
Servicio que actualiza el saldo de un número tras una recarga.  
Recibe solicitudes HTTP (directas o indirectas) y modifica los datos correspondientes en Firestore.

### 7. **Firestore**
Base de datos NoSQL administrada de Google Cloud.  
Es el almacén central de la plataforma, donde se registran ventas, recargas y saldos actualizados.

---

## 🚦 **Resumen visual del flujo**

1. **Frontend** → (POST) → **Backend API**
2. **Backend API** → (Pub/Sub) → **Procesador**
3. **Procesador** → (escribe) → **Firestore**
4. **Backend API** → (POST) → **Registro de Ventas** → **Firestore**
5. **Backend API** → (POST) → **Actualización de Saldo** → **Firestore**

---

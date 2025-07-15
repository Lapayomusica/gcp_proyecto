#1. Creación del proyecto y activación de APIs

     # (Opcional) Crea un proyecto nuevo o selecciona uno existente
     gcloud projects create [ID_DEL_PROYECTO]
     gcloud config set project [ID_DEL_PROYECTO]
     PROJECT_ID=$(gcloud config get-value project)
     
     gcloud config set compute/zone us-central1-a
     gcloud config set compute/region us-central1
     
     # Habilita las APIs necesarias
     gcloud services enable cloudfunctions.googleapis.com pubsub.googleapis.com firestore.googleapis.com
     Luego va pedir habilitar  Artifact

2. Crear el Topic de Pub/Sub
     gcloud pubsub topics create recargas

3. Clone the repo con archivos necesarios
     git clone https://github.com/Lapayomusica/gcp_proyecto.git


4. cd gcp_proyecto/src/frontend
     Frontend simple (HTML + JS) 

     Despliega el frontend en Cloud Storage (hosting gratuito)

     gsutil mb gs://$PROJECT_ID-bucket-html-01
     gsutil cp index.html gs://$PROJECT_ID-bucket-html-01
     gsutil web set -m index.html gs://$PROJECT_ID-bucket-html-01
     gsutil iam ch allUsers:objectViewer gs://$PROJECT_ID-bucket-html-01

     Accede por:
     http://storage.googleapis.com/$PROJECT_ID-bucket-html-01/index.html

5. Cloud Function HTTP para recibir recargas (frontend → backend)
    cd ../cloud-functions_recarga_request

     # (Solo la primera vez) Crea el repositorio en Artifact Registry
     gcloud artifacts repositories create microservicios --repository-format=docker --location=us-central1
     
     # Configura autenticación Docker
     gcloud auth configure-docker us-central1-docker.pkg.dev
     
     # Construye y sube la imagen
     npm install cors (TBD)
     docker build -t recarga-backend:latest .
     docker tag recarga-backend:latest us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/recarga-backend:latest
     docker push us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/recarga-backend:latest
     
     # Despliega en Cloud Run
     gcloud run deploy recarga-backend \
       --image us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/recarga-backend:latest \
       --platform managed \
       --region us-central1 \
                 --allow-unauthenticated

6. Cloud Function backend (procesa la recarga y guarda en Firestore)
cd ../microservicio_procesar_recarga

     # Crear suscripcion
     gcloud pubsub subscriptions create recarga-run-sub --topic=recargas

     # Configura autenticación Docker
     gcloud auth configure-docker us-central1-docker.pkg.dev
     
     # Construye y sube la imagen
     docker build -t procesar-recarga:latest .
     docker tag procesar-recarga:latest us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/procesar-recarga:latest
     docker push us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/procesar-recarga:latest
     
     # Despliega en Cloud Run
     gcloud run deploy procesar-recarga \
       --image us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/procesar-recarga:latest \
       --platform managed \
       --region us-central1 \
       --allow-unauthenticated

     Permiso de las cuentas:
     Ve a IAM & Admin > IAM.
     Busca la cuenta de servicio que usa Cloud Run y verificar que tiene los isguientes roles:.
     "Pub/Sub Subscriber"
     "Cloud Datastore User" (este rol da acceso a Firestore en modo Datastore)
     Guarda los cambios.

     Verificar que Firestore y PubSub esten habilitado en el proyecto que es, para asegura incluí la referencia al project_is al momento de utilizarlos.

     Prueba el flujo
     Haz un POST desde el frontend o Postman/curl al endpoint del backend HTTP.
     Pub/Sub recibirá el mensaje.
     La Cloud Function procesará automáticamente cualquier mensaje publicado en el tópico.
     Notas
     Puedes consultar los logs de la función en Cloud Logging.

7. cd ../microservicio_registro_de_ventas
    Construir y subir la imagen a Artifact Registry:

    Solo sino se ha creado: gcloud artifacts repositories create microservicios --repository-format=docker --location=us-central1
    docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/registro-venta:latest .
    docker push us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/registro-venta:latest

     gcloud run deploy registro-venta \
            --image us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/registro-venta:latest \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated
     
     Crear tu Kubernetes
     gcloud container clusters create recarga-saldo-cluster  --zone=us-central1-a  --num-nodes=1  --machine-type=e2-medium
     gcloud container clusters get-credentials recarga-saldo-cluster --zone=us-central1-a
     Verificar el permiso la cuenta por default no tiene todos los permisos o puedes hacerlo por el CLI

     Comandos de despliegue de .yaml
     kubectl apply -f registro-venta-deployment.yaml
     kubectl apply -f registro-venta-ingress.yaml

     Cuando el Ingress esté disponible, se obtienen la IPs con:
     kubectl get pods
     kubectl get svc
     kubectl get ingress

     Y prueba el servicio (por ejemplo, con curl):

     curl -X POST http://[EXTERNAL_IP]/registrar-venta \
      -H "Content-Type: application/json" \
      -d '{"numero":"5551234567","monto":50,"fecha":"2024-07-10T12:00:00Z"}'
     
     Se debe recordar que Firestore esta habilitado desde el primer punto, pero es bueno confirmar que este en el proyecto actual.

8. cd ../microservicio_de_actualizacion_de_saldo

    docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/actualizar-saldo:latest .
    docker push us-central1-docker.pkg.dev/$PROJECT_ID/microservicios/actualizar-saldo:latest

    Despliega en GKE qu e ya fue creado en el punto anterior:
    kubectl apply -f actualizar-saldo-deployment.yaml
    kubectl apply -f plataforma-recargas-ingress.yaml  # solo si es nuevo o cambió

     
     kubectl get pods
     kubectl get svc
     Obtén la IP pública (EXTERNAL-IP):
     kubectl get ingress

    Prueba el servicio
    curl -X POST http://[EXTERNAL_IP]/actualizar-saldo \
      -H "Content-Type: application/json" \
      -d '{"numero":"5551234567","monto":50}'

9. Otros detalles técnicos:
    **Pasos básicos:**
       1. **Crea una cuenta de servicio de Google Cloud:**
          ```sh
          gcloud iam service-accounts create microservicios-auth
          ```
       2. **Dale permisos solo necesarios (ejemplo: acceso a Firestore):**
          ```sh
          gcloud projects add-iam-policy-binding TU_PROYECTO \
            --member="serviceAccount:microservicios-auth@TU_PROYECTO.iam.gserviceaccount.com" \
            --role="roles/datastore.user"
          ```
       3. **Habilita Workload Identity en tu clúster:**
          ```sh
          gcloud container clusters update TU_CLUSTER \
            --workload-pool=TU_PROYECTO.svc.id.goog
          ```
       4. **Crea un ServiceAccount de Kubernetes vinculado:**
          ```yaml
          apiVersion: v1
          kind: ServiceAccount
          metadata:
            name: k8s-firestore
            annotations:
              iam.gke.io/gcp-service-account: microservicios-auth@TU_PROYECTO.iam.gserviceaccount.com
          ```
       5. **Asigna este ServiceAccount a tus pods en el deployment:**
          ```yaml
          spec:
            serviceAccountName: k8s-firestore
          ```
       6. **Enlaza las identidades:**
          ```sh
          gcloud iam service-accounts add-iam-policy-binding microservicios-auth@TU_PROYECTO.iam.gserviceaccount.com \
            --role roles/iam.workloadIdentityUser \
            --member "serviceAccount:TU_PROYECTO.svc.id.goog[default/k8s-firestore]"

    ## 2. **Observabilidad: Cloud Logging y Monitoring**

    **Por defecto:**
    - **Todos los logs** de tus pods, Cloud Functions y Cloud Run se envían automáticamente a **Cloud Logging**.
    - **Métricas** de uso, errores y tráfico se envían a **Cloud Monitoring**.

    **¿Qué debes hacer?**
    - Añade logs personalizados en tus apps usando `console.log` (Node.js) o el equivalente en otros lenguajes.
    - Puedes crear dashboards y alertas en Cloud Monitoring.

    **Accede desde la consola:**
    - [Cloud Logging](https://console.cloud.google.com/logs)
    - [Cloud Monitoring](https://console.cloud.google.com/monitoring)

    ## 3. **Uso eficiente del nivel gratuito**

    - **GKE Autopilot:** 1 clúster gratis, suficiente para microservicios pequeños. No uses nodos grandes ni cargas pesadas.
    - **Firestore:** Hasta 1GB de almacenamiento gratis (usa documentos compactos).
    - **Cloud Functions:** Hasta 2 millones de invocaciones gratis (usa para funciones de backend asíncrono).
    - **Pub/Sub:** Hasta 10GB de mensajes gratis.
    - **Cloud Run:** Hasta 2 millones de invocaciones gratis y 360,000 GB-segundos/mes.

    **Tips:**
    - Elimina recursos que no uses.
    - Usa colecciones separadas en Firestore en vez de muchos proyectos.
    - Observa el uso en la consola de facturación.
    - Evita loops automáticos y verifica que tus triggers Pub/Sub o Cloud Functions no generen invocaciones inesperadas.

    ---

    ## 4. **Resumen de buenas prácticas**

    - **Desacoplamiento:** Usa Pub/Sub y microservicios independientes.
    - **Seguridad:** Workload Identity, no claves embebidas.
    - **Escalabilidad y resiliencia:** GKE Autopilot, Cloud Functions, Cloud Run.
    - **Observabilidad:** Usa Cloud Logging y Monitoring, crea alertas si quieres.
    - **Ahorro:** Mantente en la capa gratuita, revisa consumo en la consola.



/
        ├── frontend/
        │   └── index.html
├── cloud-functions/
        │   ├── recargaRequest/
        │   └── procesarRecarga/
        ├── registro-venta/
        │   ├── index.js
│   ├── Dockerfile
│   └── deployment.yaml
├── actualizar-saldo/
        │   ├── index.js
│   ├── Dockerfile
│   └── deployment.yaml
├── docs/
        │   └── diagrama.png
└── README.md



# H A S K E


# OHIF v3 with Orthanc(PostgresDB) with Authentik for Auth and Nginx Proxy Manager for Proxy Plus Orthanc Explorer 2

## Intro:
> **🩻 Ohif v3:** (OHIF) Viewer is an open source, web-based, medical imaging platform.

> **📀 Orthanc:** Its free and open-source, lightweight DICOM server for medical imaging.

> **🐘 PostgreSQL:** It is a powerful open-source relational database management system known for its reliability, extensibility, and advanced features.

> **🔐 Authentik:** It is an open-source authentication and authorization server that provides secure access control and identity management for web applications.

> **🌐 Nginx Proxy Manager:** It is a simple yet powerful web-based tool for managing Nginx proxy servers, enabling easy configuration and management of reverse proxies and SSL/TLS termination.
> **Orthanc Explorer 2 is the frontend UI that runs on the Orthanc Server.

---
## First Stage is to Run the Ohif, Orthanc, Authentik and Nginx Proxy Manager on Docker container
### Create new docker network `proxy`

```bash
docker network create proxy
```
### Clone This Repo
```bash
git clone https://github.com/Heartz00/ohif-orthanc-pacs-haske.git
cd ohif-orthanc-pacs-haske
```

### File Structure

```bash

├── authentik
│   ├── certs
│   ├── custom-templates
│   ├── database
│   ├── media
│   └── redis
├── docker-compose.yml
├── Explorer-2
│   ├── build.sh
│   ├── CITATION.cff
│   ├── CMakeLists.txt
│   ├── LICENSE
│   ├── package-lock.json
│   ├── Plugin
│   ├── Resources
│   ├── scripts
│   ├── tests
│   ├── TODO
│   └── WebApplication
├── ohif
│   ├── config
│   └── nginx
├── orthanc
│   ├── config
│   ├── database
│   └── dicomImages
└── proxy
    ├── data
    └── letsencrypt

```

### Set `.env` variable for Authentik

```bash
echo "PG_PASS=$(openssl rand 36 | base64)" >> .env
echo "AUTHENTIK_SECRET_KEY=$(openssl rand 60 | base64)" >> .env
```

### Set Orthanc UserName & Password
> Use you favourite text editor
```bash
nvim ./orthanc/config/orthanc.json
```
```json
   "AuthenticationEnabled": false,
  "RegisteredUsers": {
    "haske": "haske"
  },
```

### Create generate the base64-encoded string
```bash
echo -n 'haske:haske' | base64.
aHlwZXI6bWFwZHI=
```

### Update Nginx config for Ohif to pass http auth for accessing Orthanc
Edit Nginx reverse proxy
```bash
nvim ./ohif/nginx/ohif.conf
```
and paste base64-encoded user name and password

```conf
proxy_set_header Authorization "Basic aHlwZXI6bWFwZHI=";  # Replace with base64-encoded credentials
```
> Whenever you access OHIF it won't ask for Orthanc auth and password. 

### Spin up containers
```bash
docker-compose up -d
```

## Second Stage is to Run the Orthanc Explorer Frontend - this frontend can be modified
The source code for Orthanc Explorer 2 can be found in the Explorer-2 folder 
#### Front-end development
> Prerequisites:
install nodejs version 14 or higher and npm version 6 or higher
install nginx

Then, to continuously build and serve the front-end code on your machine, in a shell, type:
```
cd WebApplication
npm install
npm run dev
```
Npm will then serve the /ui/app/ static code (HTML/JS).

> In third shell, type:
```
cd ..
sudo ./scripts/start-nginx.sh
```
This will launch an nginx server that will implement reverse proxies to serve both the static code and the Orthanc Rest API on a single endpoind. You may then open http://localhost:5000/ui/app/ to view and debug your current front-end code. As soon as you modify a WebApplication source file, the UI shall reload automatically in the browser.
### Build Frontend
Prerequisites to build the frontend: you need nodejs version 14 or higher and npm version 6 or higher.

To build the frontend:
```
cd WebApplication
npm install
npm run build
```
And then, to build the C++ plugin:
```
cd /build
cmake -DWEBAPP_DIST_SOURCE=LOCAL -DALLOW_DOWNLOADS=ON -DCMAKE_BUILD_TYPE:STRING=Release -DUSE_SYSTEM_ORTHANC_SDK=OFF /sources/Explorer-2/
make -j 4
```

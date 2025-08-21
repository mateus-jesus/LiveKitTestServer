# LiveKit Test Server

Projeto de teste utilizando **LiveKit** com servidor em **Java (Spring Boot)** e cliente em **JavaScript**.

---

## 🚀 Requisitos

- [Git](https://git-scm.com/)  
- [Java 17+](https://adoptium.net/)  
- [Maven](https://maven.apache.org/)  
- [Node.js + npm](https://nodejs.org/)  
- [LiveKit Server](https://github.com/livekit/livekit/releases)  

---

## 📥 Instalação

Clone este repositório:  

```bash
git clone https://github.com/mateus-jesus/LiveKitTestServer
cd LiveKitTestServer
```

Baixe o binário do LiveKit Server compatível com seu sistema no [repositório oficial](https://github.com/livekit/livekit/releases).

## ▶️ Execução

### ⚡ 1. Iniciar o LiveKit Server

No Windows, execute o binário:
```bash
.\livekit-server.exe --dev --bind 0.0.0.0
```

> 💡 O parâmetro `--dev` coloca o servidor em modo de desenvolvimento e `--bind 0.0.0.0` permite conexões locais.

### ⚙️ 2. Subir o Application Server (Java)

Acesse o diretório application-server_java e rode
```bash
mvn spring-boot:run
```
> Isso inicia o backend em Spring Boot, responsável por autenticação e geração de tokens para o LiveKit.

### 🌐 3. Subir o Application Client (JavaScript)

Instale o servidor HTTP simples (se ainda não tiver):
```bash
npm install -g http-server
```
Depois, no diretório application-client_JS:
```bash
http-server -p 5080 ./src
```
> O cliente ficará disponível em http://localhost:5080/


## 💻 Uso

1. Acesse http://localhost:5080/
2. Informe um usuário
3. Informe uma sala
4. Clique para entrar



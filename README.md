# 🎓 Sistema de Ponto e Gestão de Alunos  

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)

---

## 🧾 Sobre o Projeto  

O **Sistema de Ponto e Gestão de Alunos** é uma plataforma completa desenvolvida para **instituições de ensino**.  
O sistema permite o controle de presença, gerenciamento de turmas, envio de mensagens e **inscrição automatizada de novos alunos**, totalmente integrada com o **Acronis**.  

O objetivo é facilitar o gerenciamento acadêmico e otimizar a comunicação entre alunos, professores e administração.

---

## 🚀 Funcionalidades Principais  

- ✅ **Registro de presença:** Adicione e visualize os horários em que o aluno frequentou a aula.  
- 🧑‍🏫 **Gestão de turmas:** Crie, edite e exclua turmas com facilidade.  
- 💬 **Mensagens e avisos:** Envie comunicados para alunos e professores.  
- 📅 **Calendário escolar:** Cadastre dias letivos e não letivos.  
- 🔔 **Painel de avisos:** Exiba lembretes e notificações importantes.  
- 🔐 **Login seguro com Token JWT:** Autenticação com geração e verificação de tokens.  
- 🔄 **Recuperação de senha:** Permite redefinir a senha por e-mail.  
- 📝 **Inscrição de novos alunos:** O aluno realiza todo o cadastro, que é automaticamente enviado para o **Acronis**.  

---

## 🛠️ Tecnologias Utilizadas  

### **Frontend**
- ⚛️ React.js  
- 💅 Styled Components / Bootstrap  
- 🌐 Axios  

### **Backend**
- 🟢 Node.js + Express  
- 🗄️ MySQL  
- 🔑 JWT (JSON Web Token)  
- 📧 Nodemailer (recuperação de senha)  

---

## ⚙️ Instalação e Execução  

### 📁 1️⃣ Clonar o repositório  
```bash
git clone https://github.com/cesar903/API_PontoParanoa_SQL.git
```

---

### 💻 2️⃣ Instalar as dependências  

#### 🔸 Frontend  
```bash
cd frontend
npm install
```

#### 🔹 Backend  
```bash
cd backend
npm install
```

---

### ⚙️ 3️⃣ Configurar o arquivo `.env`  

Crie um arquivo **.env** na pasta `/backend` com as seguintes variáveis de ambiente:  

```
DB_NAME=
DB_USER=
DB_PASS=
DB_HOST=
PORT=
JWT_SECRET= 
EMAIL_USER=
EMAIL_PASS=


# API do Acronis
ACRONIS_CLIENT_ID=
ACRONIS_CLIENT_SECRET=
ACRONIS_USERNAME=
ACRONIS_PASSWORD=
ACRONIS_DATACENTER_URL=

```

> 💡 **Dica:** nunca compartilhe seu arquivo `.env` em repositórios públicos.  

---

### ▶️ 4️⃣ Executar o projeto  

#### 🔹 Rodar o Backend  
```bash
cd backend
npm run dev
```

#### 🔸 Rodar o Frontend  
```bash
cd frontend
npm start
```

---

## 📁 Estrutura do Projeto  

```
/frontend
 ├── src/
 │   ├── components/
 │   ├── pages/
 │   ├── services/
 │   ├── assets/
 │   ├── App.jsx
 │   └── index.js

/backend
 ├── controllers/
 ├── routes/
 ├── models/
 ├── middlewares/
 ├── utils/
 └── server.js
```

---



## 🧰 Scripts Disponíveis  

### **Frontend**
| Comando | Descrição |
|----------|------------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build para produção |

### **Backend**
| Comando | Descrição |
|----------|------------|
| `npm run dev` | Inicia o servidor com nodemon |
| `npm start` | Executa o servidor em produção |

---

## 🧠 Requisitos  

- Node.js (>= 18.x)  
- NPM ou Yarn  
- MMySQL
- Acesso à API do Acronis (para o módulo de inscrições)  

---

## 👨‍💻 Autor  

**Desenvolvido por:** [Cesar Reis](https://github.com/cesar903)  
📧 **E-mail:** cesarreis521@gmail.com / cmeneses@paranoa.com.br

---

## 🧾 Licença  

Este projeto está licenciado sob a [MIT License](LICENSE).  

---

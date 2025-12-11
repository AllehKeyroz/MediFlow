import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para ESM (substituto do __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvFowGxEqmAzcQMrGQqNqg_cb4xay45Ug",
  authDomain: "analise-de-projeto.firebaseapp.com",
  projectId: "analise-de-projeto",
  storageBucket: "analise-de-projeto.firebasestorage.app",
  messagingSenderId: "733196870904",
  appId: "1:733196870904:web:13a4d9c2d58da29a7bc70d"
};

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

const app = express();
const PORT = process.env.PORT || 3001; // Usa porta do ambiente ou 3001

app.use(cors({ origin: true }));
app.use(bodyParser.json());

// --- API ROUTES ---

app.post('/webhook/:clinicId', async (req, res) => {
  const { clinicId } = req.params;
  const payload = req.body;
  const source = req.headers['user-agent'] || 'Unknown Source';

  console.log(`[Webhook Recebido] Clinic: ${clinicId} | Source: ${source}`);

  try {
    const docRef = await addDoc(collection(db, 'users', clinicId, 'webhook_logs'), {
      method: 'POST',
      source: source,
      status: 200,
      payload: payload,
      response: { received: true, message: "Processed by Node.js Server" },
      createdAt: serverTimestamp(),
      processedAt: new Date().toISOString()
    });

    console.log(`   -> Log salvo com ID: ${docRef.id}`);

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      logId: docRef.id
    });
  } catch (error) {
    console.error("   -> Erro ao salvar no Firestore:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// --- FRONTEND SERVING (PRODUCTION) ---

// Serve os arquivos estáticos da pasta 'dist' (gerada pelo vite build)
app.use(express.static(path.join(__dirname, 'dist')));

// Qualquer rota que não seja API, retorna o index.html (para o React Router funcionar)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor Fullstack rodando na porta ${PORT}`);
  console.log(`📡 Webhook Endpoint: /webhook/:clinicId`);
  console.log(`💻 Frontend servido em / (após build)\n`);
});
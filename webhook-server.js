import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Configuração do Firebase (Mesma do seu frontend)
const firebaseConfig = {
  apiKey: "AIzaSyBvFowGxEqmAzcQMrGQqNqg_cb4xay45Ug",
  authDomain: "analise-de-projeto.firebaseapp.com",
  projectId: "analise-de-projeto",
  storageBucket: "analise-de-projeto.firebasestorage.app",
  messagingSenderId: "733196870904",
  appId: "1:733196870904:web:13a4d9c2d58da29a7bc70d"
};

// Inicializa Firebase no contexto do Node.js
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

const app = express();
const PORT = 3001; // Porta diferente do frontend (3000/5173)

// Middlewares
app.use(cors({ origin: true })); // Aceita requisições de qualquer lugar (Zapier, etc)
app.use(bodyParser.json());

// Rota do Webhook
app.post('/webhook/:clinicId', async (req, res) => {
  const { clinicId } = req.params;
  const payload = req.body;
  const source = req.headers['user-agent'] || 'Unknown Source';

  console.log(`[Webhook Recebido] Clinic: ${clinicId} | Source: ${source}`);

  try {
    // Salva no Firestore
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

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor de Webhooks (Node.js) rodando em http://localhost:${PORT}`);
  console.log(`📡 Endpoint pronto: http://localhost:${PORT}/webhook/:clinicId\n`);
});
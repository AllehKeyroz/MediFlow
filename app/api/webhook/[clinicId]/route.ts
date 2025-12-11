import { NextResponse } from 'next/server';
import { db } from '../../../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Habilita CORS para permitir requisições de qualquer origem (Zapier, Typeform, etc)
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: { clinicId: string } }
) {
  const { clinicId } = params;
  
  // Captura o momento exato da requisição
  // Nota: serverTimestamp do Firestore funciona melhor no client-side SDK, 
  // em Node puro as vezes é preferível usar new Date() se houver conflito de tipos,
  // mas manteremos serverTimestamp() pela consistência com o firebaseConfig.
  
  let payload = {};
  let status = 200;
  let responseBody = { received: true, timestamp: new Date().toISOString() };

  try {
    // Tenta parsear o JSON recebido
    try {
      payload = await request.json();
    } catch (e) {
      payload = { error: "Invalid JSON body", rawBody: await request.text() };
      status = 400;
    }

    // Estrutura do Log
    const logData = {
      method: 'POST',
      source: request.headers.get('user-agent') || 'Unknown External Source',
      status: status,
      payload: payload,
      response: responseBody,
      createdAt: serverTimestamp(),
      processedAt: new Date().toISOString()
    };

    // Salva no Firestore na subcoleção do usuário específico (clinicId)
    // Isso garante que cada cliente SaaS tenha seus próprios logs isolados
    const logsRef = collection(db, 'users', clinicId, 'webhook_logs');
    await addDoc(logsRef, logData);

    return NextResponse.json(responseBody, {
      status: status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    
    // Log do erro interno se falhar ao salvar
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import { runQuery, getQuery } from '../database/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_PATH = process.env.WHATSAPP_SESSION_PATH || path.join(__dirname, '../../sessions');

let clients = {}; // Armazenar instâncias de clientes por usuário
let qrCodes = {}; // Armazenar QR codes para resgate

export const initWhatsAppClient = async (userId) => {
  try {
    if (clients[userId]) {
      return clients[userId];
    }

    const sessionPath = path.join(SESSIONS_PATH, `session_${userId}`);

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: `whatsapp_${userId}` }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    let qrGenerated = false;

    client.on('qr', (qr) => {
      qrcode.toDataURL(qr, (err, url) => {
        if (err) {
          console.error('Erro ao gerar QR:', err);
        } else {
          qrCodes[userId] = url;
          qrGenerated = true;
          console.log(`QR Code gerado para usuário ${userId}`);
        }
      });
    });

    client.on('ready', async () => {
      console.log(`Cliente WhatsApp conectado para usuário ${userId}`);
      
      // Atualizar status no banco
      await runQuery(
        `UPDATE whatsapp_sessions SET status = ?, last_connected = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        ['connected', userId]
      );

      delete qrCodes[userId];
    });

    client.on('auth_failure', (msg) => {
      console.error(`Erro de autenticação para usuário ${userId}:`, msg);
    });

    client.on('disconnected', async (reason) => {
      console.log(`Cliente desconectado para usuário ${userId}:`, reason);
      delete clients[userId];
      
      await runQuery(
        'UPDATE whatsapp_sessions SET status = ? WHERE user_id = ?',
        ['disconnected', userId]
      );
    });

    client.on('message', (msg) => {
      // Evento de nova mensagem será tratado pelo monitor
      console.log('Nova mensagem recebida:', msg.from);
    });

    client.initialize();
    clients[userId] = client;

    return client;
  } catch (error) {
    console.error('Erro ao inicializar cliente WhatsApp:', error);
    throw error;
  }
};

export const getQrCode = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Verificar se já existe uma sessão
    let session = await getQuery(
      'SELECT status FROM whatsapp_sessions WHERE user_id = ?',
      [userId]
    );

    if (!session) {
      await runQuery(
        'INSERT INTO whatsapp_sessions (user_id, status) VALUES (?, ?)',
        [userId, 'pending']
      );
    }

    // Inicializar cliente
    await initWhatsAppClient(userId);

    // Aguardar QR code ser gerado (com timeout)
    let attempts = 0;
    while (!qrCodes[userId] && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (qrCodes[userId]) {
      res.json({ qrCode: qrCodes[userId], status: 'pending' });
    } else {
      res.status(408).json({ error: 'Timeout ao gerar QR code' });
    }
  } catch (error) {
    console.error('Erro ao obter QR code:', error);
    res.status(500).json({ error: 'Erro ao gerar QR code' });
  }
};

export const getWhatsAppStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const session = await getQuery(
      'SELECT status, phone_number FROM whatsapp_sessions WHERE user_id = ?',
      [userId]
    );

    const client = clients[userId];
    const isConnected = client && client.info;

    res.json({
      status: isConnected ? 'connected' : 'disconnected',
      phoneNumber: session?.phone_number || null,
      lastConnected: session?.last_connected || null
    });
  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({ error: 'Erro ao obter status' });
  }
};

export const disconnectWhatsApp = async (req, res) => {
  try {
    const userId = req.user.userId;
    const client = clients[userId];

    if (client) {
      await client.destroy();
      delete clients[userId];
    }

    await runQuery(
      'UPDATE whatsapp_sessions SET status = ? WHERE user_id = ?',
      ['disconnected', userId]
    );

    res.json({ message: 'WhatsApp desconectado com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({ error: 'Erro ao desconectar' });
  }
};

export const getWhatsAppGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const client = clients[userId];

    if (!client || !client.info) {
      return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }

    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.isGroup).map(group => ({
      id: group.id._serialized,
      name: group.name,
      participants: group.participants?.length || 0
    }));

    res.json({ groups });
  } catch (error) {
    console.error('Erro ao obter grupos:', error);
    res.status(500).json({ error: 'Erro ao obter grupos' });
  }
};

export const getClient = (userId) => {
  return clients[userId];
};


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database/db.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import groupsRoutes from './routes/groups.js';
import whatsappRoutes from './routes/whatsapp.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar banco de dados e servidor
const startServer = async () => {
  try {
    // Inicializar banco de dados
    await initDatabase();
    console.log('✓ Banco de dados inicializado');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
      console.log(`✓ API disponível em http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
});

export default app;

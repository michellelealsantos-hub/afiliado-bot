import { runQuery, getQuery, allQuery } from '../database/db.js';

export const saveAffiliateConfig = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { platform, config } = req.body;

    if (!platform || !config) {
      return res.status(400).json({ error: 'Plataforma e configuração são obrigatórios' });
    }

    // Verificar se já existe configuração
    const existing = await getQuery(
      'SELECT id FROM affiliate_config WHERE user_id = ? AND platform = ?',
      [userId, platform]
    );

    if (existing) {
      // Atualizar
      await runQuery(
        `UPDATE affiliate_config 
         SET config_data = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ? AND platform = ?`,
        [JSON.stringify(config), userId, platform]
      );
    } else {
      // Inserir
      await runQuery(
        `INSERT INTO affiliate_config (user_id, platform, config_data) 
         VALUES (?, ?, ?)`,
        [userId, platform, JSON.stringify(config)]
      );
    }

    res.json({ message: `Configuração de ${platform} salva com sucesso` });
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({ error: 'Erro ao salvar configuração' });
  }
};

export const getAffiliateConfig = async (req, res) => {
  try {
    const userId = req.user.userId;

    const configs = await allQuery(
      'SELECT platform, config_data FROM affiliate_config WHERE user_id = ?',
      [userId]
    );

    const formatted = {};
    configs.forEach(config => {
      formatted[config.platform] = JSON.parse(config.config_data);
    });

    res.json({ configs: formatted });
  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    res.status(500).json({ error: 'Erro ao obter configuração' });
  }
};

export const getPlatformConfig = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { platform } = req.params;

    const config = await getQuery(
      'SELECT config_data FROM affiliate_config WHERE user_id = ? AND platform = ?',
      [userId, platform]
    );

    if (!config) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    res.json({ config: JSON.parse(config.config_data) });
  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    res.status(500).json({ error: 'Erro ao obter configuração' });
  }
};

export const deleteAffiliateConfig = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { platform } = req.params;

    await runQuery(
      'DELETE FROM affiliate_config WHERE user_id = ? AND platform = ?',
      [userId, platform]
    );

    res.json({ message: `Configuração de ${platform} deletada` });
  } catch (error) {
    console.error('Erro ao deletar configuração:', error);
    res.status(500).json({ error: 'Erro ao deletar configuração' });
  }
};

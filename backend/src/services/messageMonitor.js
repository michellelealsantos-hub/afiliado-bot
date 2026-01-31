import { getClient } from '../controllers/whatsappController.js';
import { allQuery, getQuery, runQuery } from '../database/db.js';
import { detectPlatform, replaceLinkWithAffiliate, extractUrls, processMessageLinks } from '../utils/affiliate.js';

export const startMessageMonitor = async (userId) => {
  try {
    const client = getClient(userId);
    if (!client) {
      console.log(`Cliente não inicializado para usuário ${userId}`);
      return;
    }

    // Obter grupos para monitorar
    const monitorGroups = await allQuery(
      'SELECT group_id FROM monitored_groups WHERE user_id = ? AND is_monitor = 1',
      [userId]
    );

    // Obter grupos para postar
    const postGroups = await allQuery(
      'SELECT group_id FROM monitored_groups WHERE user_id = ? AND is_post_target = 1',
      [userId]
    );

    // Obter configurações de afiliado
    const configs = await allQuery(
      'SELECT platform, config_data FROM affiliate_config WHERE user_id = ?',
      [userId]
    );

    const affiliateConfigs = {};
    configs.forEach(config => {
      affiliateConfigs[config.platform] = JSON.parse(config.config_data);
    });

    if (monitorGroups.length === 0) {
      console.log(`Nenhum grupo para monitorar para usuário ${userId}`);
      return;
    }

    if (postGroups.length === 0) {
      console.log(`Nenhum grupo para postar para usuário ${userId}`);
      return;
    }

    console.log(`Monitor iniciado para usuário ${userId}`);
    console.log(`Monitorando ${monitorGroups.length} grupos`);
    console.log(`Postando em ${postGroups.length} grupos`);

    // Listener para mensagens
    client.on('message_create', async (msg) => {
      try {
        // Verificar se a mensagem é de um grupo monitorado
        const isFromMonitoredGroup = monitorGroups.some(
          g => g.group_id === msg.from
        );

        if (!isFromMonitoredGroup) return;

        // Verificar se a mensagem já foi processada
        const processed = await getQuery(
          'SELECT id FROM processed_messages WHERE user_id = ? AND message_id = ?',
          [userId, msg.id.id]
        );

        if (processed) return;

        // Processar mensagem
        let processedText = msg.body;
        const originalUrls = extractUrls(msg.body);

        // Substituir links
        for (const url of originalUrls) {
          const platform = detectPlatform(url);
          if (platform && affiliateConfigs[platform]) {
            const replacedUrl = replaceLinkWithAffiliate(
              url,
              platform,
              affiliateConfigs[platform]
            );
            processedText = processedText.replace(url, replacedUrl);

            // Registrar processamento
            await runQuery(
              `INSERT INTO processed_messages 
               (user_id, source_group_id, message_id, original_link, replacement_link, platform) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [userId, msg.from, msg.id.id, url, replacedUrl, platform]
            );
          }
        }

        // Enviar para grupos de postagem
        const messageToSend = {
          text: processedText,
          media: msg.hasMedia ? msg.media : null
        };

        for (const postGroup of postGroups) {
          if (msg.hasMedia) {
            // Reencaminhar com mídia
            await client.forwardMessages(postGroup.group_id, [msg.id._serialized]);
          }

          // Enviar texto processado
          await client.sendMessage(postGroup.group_id, messageToSend.text);
        }

        console.log(`Mensagem processada e postada para usuário ${userId}`);
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    });
  } catch (error) {
    console.error('Erro ao iniciar monitor:', error);
  }
};

export const stopMessageMonitor = async (userId) => {
  try {
    const client = getClient(userId);
    if (client) {
      client.removeAllListeners('message_create');
      console.log(`Monitor parado para usuário ${userId}`);
    }
  } catch (error) {
    console.error('Erro ao parar monitor:', error);
  }
};

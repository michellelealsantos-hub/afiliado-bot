import { runQuery, allQuery, getQuery } from '../database/db.js';

export const updateMonitoredGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groups } = req.body; // Array de grupos para monitorar

    if (!groups || !Array.isArray(groups) || groups.length < 2) {
      return res.status(400).json({ error: 'Selecione pelo menos 2 grupos para monitorar' });
    }

    // Remover grupos antigos para este usuário
    await runQuery('DELETE FROM monitored_groups WHERE user_id = ?', [userId]);

    // Inserir novos grupos
    for (const group of groups) {
      await runQuery(
        `INSERT INTO monitored_groups (user_id, group_id, group_name, is_monitor) 
         VALUES (?, ?, ?, 1)`,
        [userId, group.id, group.name]
      );
    }

    res.json({ message: 'Grupos de monitoramento atualizados' });
  } catch (error) {
    console.error('Erro ao atualizar grupos:', error);
    res.status(500).json({ error: 'Erro ao atualizar grupos' });
  }
};

export const updatePostTargetGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groups } = req.body; // Array de grupos para postar

    if (!groups || !Array.isArray(groups)) {
      return res.status(400).json({ error: 'Grupos não fornecidos' });
    }

    // Remover seleção anterior
    await runQuery('UPDATE monitored_groups SET is_post_target = 0 WHERE user_id = ?', [userId]);

    // Atualizar novos grupos de destino
    for (const groupId of groups) {
      await runQuery(
        'UPDATE monitored_groups SET is_post_target = 1 WHERE user_id = ? AND group_id = ?',
        [userId, groupId]
      );
    }

    res.json({ message: 'Grupos de postagem atualizados' });
  } catch (error) {
    console.error('Erro ao atualizar grupos:', error);
    res.status(500).json({ error: 'Erro ao atualizar grupos' });
  }
};

export const getMonitoredGroups = async (req, res) => {
  try {
    const userId = req.user.userId;

    const groups = await allQuery(
      'SELECT group_id, group_name, is_monitor, is_post_target FROM monitored_groups WHERE user_id = ?',
      [userId]
    );

    const monitor = groups.filter(g => g.is_monitor);
    const postTargets = groups.filter(g => g.is_post_target);

    res.json({
      monitorGroups: monitor,
      postTargetGroups: postTargets
    });
  } catch (error) {
    console.error('Erro ao obter grupos:', error);
    res.status(500).json({ error: 'Erro ao obter grupos' });
  }
};

export const getGroupsForSelection = async (req, res) => {
  try {
    const userId = req.user.userId;

    const groups = await allQuery(
      'SELECT group_id, group_name FROM monitored_groups WHERE user_id = ?',
      [userId]
    );

    res.json({ groups });
  } catch (error) {
    console.error('Erro ao obter grupos:', error);
    res.status(500).json({ error: 'Erro ao obter grupos' });
  }
};

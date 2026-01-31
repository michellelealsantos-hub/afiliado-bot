// Regex patterns para diferentes plataformas de afiliados
export const AFFILIATE_PATTERNS = {
  amazon: {
    regex: /amazon\.com.*\/(.*?)(\?|$)/,
    domains: ['amazon.com', 'amzn.to', 'amazon.com.br', 'amzn.to'],
    name: 'Amazon'
  },
  shopee: {
    regex: /shopee\.com\..+?\/(.+?)(\?|$)/,
    domains: ['shopee.com.br', 'shopee.co.id', 'shopee.com.my'],
    name: 'Shopee'
  },
  magalu: {
    regex: /magalu\.com|divulgador\.magalu\.com/,
    domains: ['magalu.com', 'divulgador.magalu.com'],
    name: 'Magalu'
  },
  mercadolivre: {
    regex: /mercadolivre\.com|mercadolivre\.com\.br/,
    domains: ['mercadolivre.com', 'mercadolivre.com.br'],
    name: 'Mercado Livre'
  },
  natura: {
    regex: /natura\.com\.br|natura\.lojavirtual\.com\.br/,
    domains: ['natura.com.br'],
    name: 'Natura'
  }
};

/**
 * Detecta a plataforma de afiliado baseado na URL
 */
export const detectPlatform = (url) => {
  for (const [key, value] of Object.entries(AFFILIATE_PATTERNS)) {
    if (value.domains.some(domain => url.includes(domain))) {
      return key;
    }
  }
  return null;
};

/**
 * Substituir link original pelo link de afiliado
 */
export const replaceLinkWithAffiliate = (originalLink, platform, affiliateConfig) => {
  if (!platform || !affiliateConfig) return originalLink;

  switch (platform) {
    case 'amazon':
      // Amazon: https://amzn.to/4kb5aqD -> https://amazon.com/...?tag=TAG
      if (affiliateConfig.tag) {
        return `https://amazon.com/s?k=product&tag=${affiliateConfig.tag}`;
      }
      break;

    case 'shopee':
      // Shopee: Adicionar affiliate ID e token
      if (affiliateConfig.affiliateId && affiliateConfig.token) {
        return `${originalLink}?affiliateId=${affiliateConfig.affiliateId}&token=${affiliateConfig.token}`;
      }
      break;

    case 'magalu':
      // Magalu: Usar link de divulgador personalizado
      if (affiliateConfig.storeName && affiliateConfig.promoterId) {
        return `https://divulgador.magalu.com/${affiliateConfig.storeLink}`;
      }
      break;

    case 'mercadolivre':
      // Mercado Livre: Adicionar token e etiqueta
      if (affiliateConfig.token && affiliateConfig.tag) {
        return `${originalLink}${originalLink.includes('?') ? '&' : '?'}tag=${affiliateConfig.tag}&token=${affiliateConfig.token}`;
      }
      break;

    case 'natura':
      // Natura: Usar link da loja personalizado
      if (affiliateConfig.storeName) {
        return `https://natura.lojavirtual.com.br/?store=${affiliateConfig.storeName}`;
      }
      break;

    default:
      return originalLink;
  }

  return originalLink;
};

/**
 * Extrair URLs de um texto
 */
export const extractUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

/**
 * Processar uma mensagem e substituir links
 */
export const processMessageLinks = (message, affiliateConfigs) => {
  let processedMessage = message;
  const urls = extractUrls(message);

  urls.forEach(url => {
    const platform = detectPlatform(url);
    if (platform && affiliateConfigs[platform]) {
      const replacedUrl = replaceLinkWithAffiliate(url, platform, affiliateConfigs[platform]);
      processedMessage = processedMessage.replace(url, replacedUrl);
    }
  });

  return processedMessage;
};

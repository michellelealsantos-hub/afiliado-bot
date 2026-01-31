import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWhatsAppStore, useAuthStore } from '../store/store';
import { whatsappAPI } from '../services/api';
import './Dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { status, qrCode, setQrCode, setStatus, setLoading } = useWhatsAppStore();
  const [activeTab, setActiveTab] = useState('whatsapp');

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const { data } = await whatsappAPI.getQrCode();
      setQrCode(data.qrCode);
    } catch (error) {
      console.error('Erro ao gerar QR:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await whatsappAPI.disconnect();
      setStatus('disconnected');
      setQrCode(null);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1>Afiliado Bot</h1>
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Sair</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'whatsapp' ? 'active' : ''}`}
            onClick={() => setActiveTab('whatsapp')}
          >
            WhatsApp
          </button>
          <button
            className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            Grupos
          </button>
          <button
            className={`tab ${activeTab === 'affiliate' ? 'active' : ''}`}
            onClick={() => setActiveTab('affiliate')}
          >
            Afiliados
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'whatsapp' && (
            <div className="whatsapp-section">
              <h2>Conexão WhatsApp</h2>
              <div className="status-info">
                <p>Status: <span className={status}>{status}</span></p>
              </div>
              
              {status === 'disconnected' ? (
                <div className="qr-container">
                  <button onClick={handleGenerateQR}>Gerar QR Code</button>
                  {qrCode && (
                    <div className="qr-display">
                      <p>Escaneie o código com seu WhatsApp</p>
                      <img src={qrCode} alt="QR Code" />
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={handleDisconnect} className="disconnect-btn">
                  Desconectar
                </button>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <GroupsSection />
          )}

          {activeTab === 'affiliate' && (
            <AffiliateSection />
          )}
        </div>
      </div>
    </div>
  );
}

function GroupsSection() {
  return (
    <div className="groups-section">
      <h2>Gerenciar Grupos</h2>
      <p>Selecione grupos para monitorar e postar</p>
    </div>
  );
}

function AffiliateSection() {
  return (
    <div className="affiliate-section">
      <h2>Configurar Afiliados</h2>
      <p>Configure seus links de afiliação</p>
    </div>
  );
}
